import { useEffect, useState } from "react";
import { addPreferredSource, initPreferredSource } from "@/lib/preferred-source";

const STORAGE_KEY = "rtg-pref-source-dismissed-at";
const HIDE_DAYS = 30;
const SHOW_AFTER_MS = 4000;

function recentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < HIDE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function PreferredSourceBadge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    initPreferredSource();
    if (recentlyDismissed()) return;
    const timer = window.setTimeout(() => setShow(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // storage can be blocked, hiding for this visit is enough
    }
    setShow(false);
  };

  const choose = () => {
    addPreferredSource();
    dismiss();
  };

  return (
    <>
      <style>{`
        .rtg-ps {
          position: fixed;
          right: 16px;
          bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          z-index: 60;
          display: flex;
          align-items: stretch;
          background: #12151c;
          color: #e7eae3;
          border: 2px solid #e7eae3;
          box-shadow: 4px 4px 0 #c8321a;
          font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 13px;
          line-height: 1.2;
          animation: rtgPsIn 0.35s ease-out both;
        }
        .rtg-ps__main {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px 12px 16px;
          background: transparent;
          color: inherit;
          border: 0;
          font: inherit;
          letter-spacing: 0.01em;
          cursor: pointer;
          text-align: left;
        }
        .rtg-ps__main:hover { background: #1e2431; }
        .rtg-ps__star { width: 18px; height: 18px; flex: none; fill: #e0452b; }
        .rtg-ps__x {
          padding: 0 12px;
          background: transparent;
          color: #e7eae3;
          opacity: 0.7;
          border: 0;
          border-left: 1px solid rgba(231, 234, 227, 0.25);
          font: inherit;
          font-size: 16px;
          cursor: pointer;
        }
        .rtg-ps__x:hover { opacity: 1; background: #1e2431; }
        .rtg-ps__main:focus-visible,
        .rtg-ps__x:focus-visible { outline: 2px solid #e0452b; outline-offset: -4px; }
        @keyframes rtgPsIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) { .rtg-ps { animation: none; } }
        @media (max-width: 480px) {
          .rtg-ps { right: 12px; font-size: 12px; }
          .rtg-ps__main { padding: 10px 12px 10px 14px; }
        }
        @media print { .rtg-ps { display: none; } }
      `}</style>
      <div className="rtg-ps" role="complementary" aria-label="Add reviewthengo as a preferred source on Google">
        <button type="button" className="rtg-ps__main" onClick={choose}>
          <svg className="rtg-ps__star" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.1 6.1 20.4l1.3-6.5L2.5 9.3l6.6-.8z" />
          </svg>
          <span>Prefer us on Google</span>
        </button>
        <button type="button" className="rtg-ps__x" onClick={dismiss} aria-label="Dismiss">
          &times;
        </button>
      </div>
    </>
  );
}
