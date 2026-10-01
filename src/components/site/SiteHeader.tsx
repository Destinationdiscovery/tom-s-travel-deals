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
            <a href="/#ledger">Rules ledger</a>
            <a href="/#tools">Tools</a>
            <a href="/#changes">Changes</a>
            <a href="/#method">How we check</a>
          </nav>
          <a className="btn" href="/#alerts">
            Change alerts
          </a>
        </div>
      </header>
    </>
  );
}
