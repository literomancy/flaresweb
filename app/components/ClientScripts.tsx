"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Product = {
  name?: string;
  price?: string | number;
  image?: string;
  model3d?: string;
  isActive?: boolean;
  isSoldOut?: boolean;
};

const API_URL = "https://tgshp.vercel.app/api/feed";
const SITE_PASSWORD = "flares";

export default function ClientScripts() {
  useEffect(() => {
    const setCursorActive = (active: boolean) => {
      document.body.classList.toggle("cursor-hover", active);
    };

    const gate = document.getElementById("password-gate");
    const siteContent = document.getElementById("site-content");
    const form = document.getElementById("password-form") as HTMLFormElement | null;
    const input = document.getElementById("password-input") as HTMLInputElement | null;
    const error = document.getElementById("password-error");

    const unlockSite = () => {
      gate?.classList.add("is-hidden");
      siteContent?.classList.remove("is-locked");
      localStorage.setItem("flares_unlocked", "true");
    };

    if (localStorage.getItem("flares_unlocked") === "true") {
      unlockSite();
    } else {
      input?.focus();
    }

    const onPasswordSubmit = (e: SubmitEvent) => {
      e.preventDefault();

      if (input?.value === SITE_PASSWORD) {
        unlockSite();
      } else {
        error?.classList.add("is-visible");
        input?.classList.add("is-error");

        if (input) {
          input.value = "";
          input.focus();
        }

        window.setTimeout(() => {
          input?.classList.remove("is-error");
        }, 350);
      }
    };

    form?.addEventListener("submit", onPasswordSubmit);

    loadProducts(setCursorActive);

    const navLinks = document.querySelectorAll("a");

    navLinks.forEach((el) => {
      el.addEventListener("mouseenter", () => setCursorActive(true));
      el.addEventListener("mouseleave", () => setCursorActive(false));
    });

    const onMouseMove = (e: MouseEvent) => {
      const pixel = document.createElement("div");
      pixel.className = "pixel";
      pixel.style.left = `${e.clientX}px`;
      pixel.style.top = `${e.clientY}px`;
      document.body.appendChild(pixel);

      setTimeout(() => pixel.remove(), 350);
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      form?.removeEventListener("submit", onPasswordSubmit);
      document.removeEventListener("mousemove", onMouseMove);
      document.body.classList.remove("cursor-hover");
    };
  }, []);

  return null;
}

async function loadProducts(setCursorActive: (active: boolean) => void) {
  const productsContainer = document.getElementById("products-list");
  const itemsList = document.getElementById("items-list");
  const availableCount = document.getElementById("available-count");

  if (!productsContainer || !itemsList || !availableCount) return;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`NETWORK_${response.status}`);
    }

    const products: Product[] = await response.json();
    const activeProducts = products.filter((product) => product.isActive !== false);

    productsContainer.innerHTML = "";
    itemsList.innerHTML = "";
    availableCount.textContent = `[${activeProducts.length}] AVAILABLE`;

    activeProducts.forEach((product, index) => {
      const productName = product.name || `item_${index + 1}`;
      const isSoldOut = product.isSoldOut === true;
      const price = product.price || "40";

      const listItem = document.createElement("div");
      listItem.className = "item-row";
      listItem.dataset.index = String(index);
      listItem.textContent = `*&¥* ${productName}`;
      itemsList.appendChild(listItem);

      const card = document.createElement("article");
      card.className = "product-card";
      card.dataset.index = String(index);

      const top = document.createElement("div");
      top.className = "card-top";
      top.innerHTML = `
        <span class="product-name">${productName}</span>
        <span>${isSoldOut ? "sold out" : "in stock"}</span>
      `;

      const media = document.createElement("div");
      media.className = "product-media";

      if (product.model3d) {
        media.innerHTML = `<div class="loading-text">LOADING 3D...</div>`;

        setTimeout(() => {
          init3DViewer(media, product.model3d as string);
        }, 0);
      } else if (product.image) {
        const img = document.createElement("img");
        img.src = product.image;
        img.alt = productName;
        img.className = "product-image";
        media.appendChild(img);
      } else {
        media.innerHTML = `<div class="no-image">NO IMAGE</div>`;
      }

      const bottom = document.createElement("div");
      bottom.className = "card-bottom";
      bottom.innerHTML = `
        <span>$${price}</span>
        <span>${price}₽</span>
      `;

      card.appendChild(top);
      card.appendChild(media);
      card.appendChild(bottom);
      productsContainer.appendChild(card);

      const setLinkedHover = (isHovered: boolean) => {
        card.classList.toggle("is-linked-hover", isHovered);
        listItem.classList.toggle("is-linked-hover", isHovered);
        setCursorActive(isHovered);
      };

      listItem.addEventListener("mouseenter", () => setLinkedHover(true));
      listItem.addEventListener("mouseleave", () => setLinkedHover(false));
      card.addEventListener("mouseenter", () => setLinkedHover(true));
      card.addEventListener("mouseleave", () => setLinkedHover(false));
    });

    const scrollSpacer = document.createElement("div");
    scrollSpacer.className = "scroll-spacer";
    productsContainer.appendChild(scrollSpacer);
  } catch (error) {
    console.error(error);

    productsContainer.innerHTML = `
      <div class="products-error">// ERROR_LOADING_FEED</div>
    `;

    itemsList.innerHTML = `
      <span class="muted">// ERROR</span>
    `;
  }
}

function init3DViewer(container: HTMLElement, modelUrl: string) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 3.5);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.outline = "none";

  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(3, 5, 5);
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
  backLight.position.set(-3, -5, -5);
  scene.add(backLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.0;
  controls.target.set(0, 0, 0);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 2.35;
      const scale = targetSize / maxDim;

      model.scale.set(scale, scale, scale);
      scene.add(model);

      const loaderElem = container.querySelector(".loading-text");
      if (loaderElem) loaderElem.remove();
    },
    undefined,
    (error) => {
      console.error("Error 3D:", error);
      renderer.domElement.remove();
      container.innerHTML = '<div class="error-3d">ERR_3D</div>';
    }
  );

  let animationFrameId = 0;

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  const resizeObserver = new ResizeObserver(() => {
    if (container.clientWidth === 0) return;

    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  resizeObserver.observe(container);
}