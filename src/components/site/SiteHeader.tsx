export default function SiteHeader() {
  return (
    <>
      <div className="strip">
        <div className="wrap">
          <span>Worldwide travel rules. Dated and sourced.</span>
        </div>
      </div>
      <header className="top">
        <div className="wrap bar">
          <a className="mark" href="/">
            review<span>then</span>go
          </a>
          <nav aria-label="Primary">
            <a href="/flight-claims">Flight claims</a>
            <a href="/insurance-appeal">Insurance appeals</a>
            <a href="/connection-check">Connection check</a>
            <a href="/about">How we check</a>
          </nav>
          <a className="btn" href="/#alerts">
            Change alerts
          </a>
        </div>
      </header>
    </>
  );
}
