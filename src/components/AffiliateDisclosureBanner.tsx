import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "rtg-affiliate-banner-dismissed";

const AffiliateDisclosureBanner = () => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  if (dismissed) return null;

  return (
    <div className="bg-muted/60 border-b border-border/50 py-2 px-4 text-center text-sm text-muted-foreground relative">
      This site contains affiliate links, we earn a commission at no extra cost to you.{" "}
      <Link to="/affiliate-disclosure" className="underline font-medium text-primary hover:text-primary/80">
        Learn more
      </Link>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AffiliateDisclosureBanner;
