import { Link } from "@tanstack/react-router";
import { Mark } from "./Mark";

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Link className="brand" to="/" style={{ marginBottom: 16 }}>
              <Mark />
              <div>
                <b>Aventura</b>
                <span>Sports Media</span>
              </div>
            </Link>
            <p style={{ color: "var(--mute)", fontSize: 14, lineHeight: 1.6, maxWidth: "34ch" }}>
              Recruiting film, promo cards and photography for student athletes and clubs. Based in Brantford, Ontario.
            </p>
          </div>
          <div>
            <h4>Services</h4>
            <Link to="/reels">Highlight reels</Link>
            <Link to="/promo-cards">Promo cards</Link>
            <Link to="/photography">Photography services</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/clubs">For clubs and teams</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/" hash="about">
              About us
            </Link>
            <Link to="/" hash="resources">
              Resources
            </Link>
            <Link to="/reels" hash="coverage">
              Where we film
            </Link>
            <Link to="/quote">Request a quote</Link>
            <Link to="/book">Book a call</Link>
            <Link to="/order">Start an order</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:aventurasportsmedia@gmail.com">aventurasportsmedia@gmail.com</a>
            <a href="https://instagram.com/aventurasportsmedia" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
        <div className="fbot">
          <span className="tc">&copy; 2026 Aventura Sports Media, Brantford, Ontario</span>
          <span className="tc flegal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/consent">Photo and Video Consent</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
