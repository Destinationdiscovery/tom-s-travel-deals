import { useEffect } from "react";
import { addPreferredSource, initPreferredSource } from "@/lib/preferred-source";

// Footer version of the Preferred Sources prompt, styled for the dark footer.
export default function PreferredSourceButton() {
  useEffect(() => {
    initPreferredSource();
  }, []);

  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "0.5rem" }}>
      <style>{`
        .rtg-ps-foot {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          background: transparent;
          color: #e7eae3;
          border: 2px solid #e7eae3;
          font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 13px;
          cursor: pointer;
        }
        .rtg-ps-foot svg { width: 18px; height: 18px; fill: #e0452b; flex: none; }
        .rtg-ps-foot:hover { background: #e7eae3; color: #12151c; }
        .rtg-ps-foot:focus-visible { outline: 2px solid #e0452b; outline-offset: 3px; }
      `}</style>
      <p style={{ margin: "0 0 0.6rem", fontSize: "0.9rem" }}>Want these rule updates in your Google results?</p>
      <button type="button" className="rtg-ps-foot" onClick={addPreferredSource}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.1 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z" />
        </svg>
        Add to Google preferred sources
      </button>
    </div>
  );
}
