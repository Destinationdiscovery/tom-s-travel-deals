import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ExpediaSearchWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpediaSearchWidget = ({ isOpen, onClose }: ExpediaSearchWidgetProps) => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    const existing = document.querySelector('script.eg-widgets-script');
    if (existing) { scriptLoaded.current = true; return; }

    const script = document.createElement("script");
    script.src = "https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js";
    script.className = "eg-widgets-script";
    script.async = true;
    document.head.appendChild(script);
    scriptLoaded.current = true;
  }, []);

  return (
    <div
      className={`fixed top-14 right-4 z-[60] w-[90vw] max-w-md transition-all duration-300 ${
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="rounded-xl border border-border/60 bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
          <span className="text-amber-400 font-bold text-sm tracking-wide">
            expedia
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close search widget"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <div
            className="eg-widget"
            data-widget="search"
            data-program="ca-expedia"
            data-lobs="stays,flights"
            data-network="pz"
            data-camref="1100l5DpWA"
            data-pubref=""
          />
        </div>
      </div>
    </div>
  );
};

export default ExpediaSearchWidget;
