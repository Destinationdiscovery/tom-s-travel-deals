import { useEffect, useRef, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import expediaLogo from "@/assets/expedia-logo.png";
import { trackAffiliateClick } from "@/lib/analytics";

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
  const [widgetFailed, setWidgetFailed] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      setWidgetFailed(false);
      setMounted(true);
      trackAffiliateClick("Expedia", window.location.pathname, "search_widget_open");
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    const timers = [100, 500, 1000, 2000].map((delay) =>
      setTimeout(() => {
        try {
          window.eg?.widgets?.init?.();
        } catch {}
      }, delay)
    );
    const checkTimer = setTimeout(() => {
      if (widgetRef.current) {
        const hasContent = widgetRef.current.querySelector(
          "iframe, form, input, .eg-search, [class*='eg-']"
        );
        if (!hasContent) setWidgetFailed(true);
      }
    }, 3000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(checkTimer);
    };
  }, [mounted]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[59] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] flex flex-col bg-slate-950/95 backdrop-blur-xl border-l border-border/60 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "min(575px, 92vw)", minWidth: "375px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 pt-[calc(0.75rem+64px)]">
          <img src={expediaLogo} alt="Expedia" className="h-6" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close search widget"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Widget content */}
        <div className="flex-1 overflow-y-auto p-4">
          {mounted && !widgetFailed && (
            <div
              ref={widgetRef}
              className="eg-widget bg-white rounded-lg overflow-hidden"
              data-widget="search"
              data-program="ca-expedia"
              data-lobs="stays,flights"
              data-network="pz"
              data-camref="1100l5DpWA"
              data-pubref=""
              style={{ minHeight: 200, width: "100%" }}
            />
          )}
          {mounted && widgetFailed && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
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
    </>
  );
};

export default ExpediaSearchWidget;
