import { CONTACT_EMAIL } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap cols">
        <div>
          <a className="mark" href="/">
            review<span>then</span>go
          </a>
          <p>
            Travel rules for people who cross borders. We are not lawyers. Information, not legal advice. Check
            official sources before you travel.
          </p>
        </div>
        <div>
          <h4>Tools</h4>
          <ul>
            <li><a href="/flight-claims">Flight claim guide</a></li>
            <li><a href="/insurance-appeal">Insurance appeal pack</a></li>
            <li><a href="/connection-check">Connection check</a></li>
            <li><a href="/#ledger">Rules ledger</a></li>
          </ul>
        </div>
        <div>
          <h4>Trust</h4>
          <ul>
            <li><a href="/about">About and how we check</a></li>
            <li><a href="/corrections">Corrections</a></li>
            <li><a href="/disclaimer">Disclaimer</a></li>
          </ul>
        </div>
        <div>
          <h4>Site</h4>
          <ul>
            <li><a href="/privacy-policy">Privacy</a></li>
            {CONTACT_EMAIL ? (
              <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
            ) : null}
          </ul>
        </div>
      </div>
    </footer>
  );
}
