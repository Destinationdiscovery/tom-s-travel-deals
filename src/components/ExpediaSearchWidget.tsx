import { useEffect, useRef, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import expediaLogo from "@/assets/expedia-logo.png";

interface ExpediaSearchWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    eg?: { widgets?: { init?: () => void } };
  }
}

const EXPEDIA_AFFILIATE_URL =
  "https://www.expedia.ca/?affcid=ca.network.pz.affiliate.1100l5DpWA";

const ExpediaSearchWidget = ({ isOpen, onClose }: ExpediaSearchWidgetProps) => {
  const scriptLoaded = useRef(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [widgetKey, setWidgetKey] = useState(0);
  const [widgetFailed, setWidgetFailed] = useState(false);

  // Load the Expedia script once
  useEffect(() => {
    if (scriptLoaded.current) return;
    const existing = document.querySelector("script.eg-widgets-script");
    if (existing) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js";
    script.className = "eg-widgets-script";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.head.appendChild(script);
  }, []);

  // Re-initialize widget when opened
  useEffect(() => {
    if (!isOpen) return;

    setWidgetFailed(false);
    setWidgetKey((k) => k + 1);

    // Try multiple times with increasing delays
    const timers = [300, 800, 1500].map((delay) =>
      setTimeout(() => {
        try {
          window.eg?.widgets?.init?.();
        } catch {
          // ignore
        }
      }, delay)
    );

    // Check if widget rendered after 2.5s
    const checkTimer = setTimeout(() => {
      if (widgetRef.current) {
        const hasContent =
          widgetRef.current.querySelector("iframe, form, input, .eg-search");
        if (!hasContent) {
          setWidgetFailed(true);
        }
      }
    }, 2500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(checkTimer);
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed top-16 right-4 z-[60] w-[92vw] max-w-lg transition-all duration-300 ${
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="rounded-xl border border-border/60 bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
          <img src={expediaLogo} alt="Expedia" className="h-6" />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close search widget"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 min-h-[220px]">
          {isOpen && !widgetFailed && (
            <div
              key={widgetKey}
              ref={widgetRef}
              className="eg-widget bg-white rounded-lg p-2 min-h-[180px]"
              data-widget="search"
              data-program="ca-expedia"
              data-lobs="stays,flights"
              data-network="pz"
              data-camref="1100l5DpWA"
              data-pubref=""
            />
          )}
          {isOpen && widgetFailed && (
            <div className="flex flex-col items-center justify-center gap-4 py-6">
              <p className="text-white/70 text-sm text-center">
                Search for flights, hotels & more on Expedia
              </p>
              <a
                href={EXPEDIA_AFFILIATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors"
              >
                Search on Expedia
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpediaSearchWidget;
