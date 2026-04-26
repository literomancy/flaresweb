"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  _id?: string;
  id?: string;
  text: string;
  x: number;
  y: number;
};

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 760;

export default function FeedbackBoard() {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<Message | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: -160, y: -120 });

  const [isPanning, setIsPanning] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);

  const panStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const res = await fetch("/api/feedback", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load feedback");
        }

        const data = await res.json();

        if (isMounted) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Feedback load error:", err);
      }
    };

    loadMessages();

    const interval = window.setInterval(loadMessages, 4000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const diff = end.getTime() - now.getTime();

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${d}d : ${h}h : ${m}m : ${s} sec`);
    };

    updateTimer();

    const interval = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const clampOffset = (nextX: number, nextY: number, nextScale = scale) => {
    const viewport = boardRef.current?.getBoundingClientRect();
    if (!viewport) return { x: nextX, y: nextY };

    const canvasWidth = CANVAS_WIDTH * nextScale;
    const canvasHeight = CANVAS_HEIGHT * nextScale;

    const minX = Math.min(0, viewport.width - canvasWidth);
    const minY = Math.min(0, viewport.height - canvasHeight);

    return {
      x: Math.min(0, Math.max(minX, nextX)),
      y: Math.min(0, Math.max(minY, nextY)),
    };
  };

  const screenToBoard = (clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    return {
      x: (clientX - rect.left - offset.x) / scale,
      y: (clientY - rect.top - offset.y) / scale,
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08;
    const nextScale = Math.min(1.6, Math.max(0.7, scale + zoomDelta));

    setScale(nextScale);
    setOffset((prev) => clampOffset(prev.x, prev.y, nextScale));
  };

  const handleBoardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".feedback-message")) return;
    if ((e.target as HTMLElement).closest(".feedback-ui")) return;
    if (isPanning) return;

    const point = screenToBoard(e.clientX, e.clientY);

    setDraft({
      id: crypto.randomUUID(),
      text: "",
      x: point.x,
      y: point.y,
    });
  };

  const saveDraft = async () => {
    if (!draft) return;

    const text = draft.text.trim();

    if (text.length > 0) {
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            x: draft.x,
            y: draft.y,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save feedback");
        }

        const savedMessage = await response.json();

        setMessages((prev) => [...prev, savedMessage]);
      } catch (error) {
        console.error("Feedback save error:", error);
      }
    }

    setDraft(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1 && !e.altKey && !e.shiftKey) return;

    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = offset;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;

    const nextX = offsetStart.current.x + e.clientX - panStart.current.x;
    const nextY = offsetStart.current.y + e.clientY - panStart.current.y;

    setOffset(clampOffset(nextX, nextY));
  };

  const handleMouseUp = () => {
    window.setTimeout(() => setIsPanning(false), 0);
  };

  return (
    <>
      <video autoPlay muted loop playsInline id="bg-video">
        <source src="/pc2c.mp4" type="video/mp4" />
      </video>

      <div className="bg-blur" />

      <main className="site-shell">
        <nav className="top-nav">
          <div className="nav-left">
            <a href="/">@FLARES.AGENCY</a>
            <span>~</span>
            <a href="/">VITRINE</a>
            <span>~</span>
            <a className="active" href="/feedback">
              FEEDBACK
            </a>
            <span>~</span>
            <a>MAP</a>
          </div>

          <div className="nav-right">
            <a href="https://t.me/flaresagency" target="_blank">
              TELEGRAM
            </a>
            <a href="https://www.instagram.com/33flares" target="_blank">
              INSTAGRAM
            </a>
          </div>
        </nav>

        <section className="feedback-panel">
          <div className="feedback-header feedback-ui">
            <span className="feedback-timer">{timeLeft}</span>

            <div
              className="online feedback-info"
              onClick={() => setIsInfoOpen((prev) => !prev)}
            >
              [INFO]
            </div>
          </div>

          {isInfoOpen && (
            <button
              type="button"
              className="feedback-help feedback-ui"
              onClick={() => setIsInfoOpen(false)}
            >
              you`re in feedback tool zone
              <br />
              zoom, click, write
              <br />
              everyone will see your message
              <br />
              will be clear in 1month
              <br />
              <br />
              <br />✓ OK, CLOSE
            </button>
          )}

          <div
            ref={boardRef}
            className="feedback-viewport"
            onWheel={handleWheel}
            onClick={handleBoardClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="feedback-canvas"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              }}
            >
              {messages.map((message) => (
                <div
                  key={message._id || message.id}
                  className="feedback-message"
                  style={{
                    left: message.x,
                    top: message.y,
                  }}
                >
                  {message.text}
                </div>
              ))}

              {draft && (
                <textarea
                  autoFocus
                  className="feedback-message feedback-draft"
                  style={{
                    left: draft.x,
                    top: draft.y,
                  }}
                  value={draft.text}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev ? { ...prev, text: e.target.value } : prev
                    )
                  }
                  onBlur={saveDraft}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveDraft();
                    }

                    if (e.key === "Escape") {
                      setDraft(null);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}