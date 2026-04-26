import ClientScripts from "./components/ClientScripts";

export default function Home() {
  return (
    <>
      <ClientScripts />

      <video autoPlay muted loop playsInline id="bg-video">
        <source src="/pc2c.mp4" type="video/mp4" />
      </video>

      <div className="bg-blur" />

      <div id="password-gate" className="password-gate">
        <div className="gate-box">
          <div className="gate-icons">
            <div className="gate-icon">
              <div className="gate-mask gate-logo-mask" />
            </div>

            <div className="gate-icon">
              <div className="gate-mask gate-loader-mask" />
            </div>
          </div>

          <form id="password-form" className="gate-form">
            <label htmlFor="password-input">PASSWORD:</label>
            <input id="password-input" type="password" autoComplete="off" />
          </form>

          <div id="password-error" className="password-error">
            WRONG PASSWORD
          </div>
        </div>
      </div>

      <main id="site-content" className="site-shell is-locked">
        <nav className="top-nav">
          <div className="nav-left">
            <a href="/">@FLARES.AGENCY</a>
            <span>~</span>
            <a className="active" href="/">
              VITRINE
            </a>
            <span>~</span>
            <a href="/feedback">FEEDBACK</a>
            <span>~</span>
            <a href="#">MAP</a>
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

        <section className="vitrine">
          <aside className="sidebar">
            <div className="sidebar-title">ITEMS LIST</div>

            <div id="items-list" className="items-list">
              <span className="muted">// LOADING...</span>
            </div>
          </aside>

          <section className="products-panel">
            <div className="panel-header">
              <span id="available-count">[0] AVAILABLE</span>
              <span className="online">[ONLINE]</span>
            </div>

            <div id="products-list" className="products-grid">
              <div className="loading-placeholder">// LOADING...</div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}