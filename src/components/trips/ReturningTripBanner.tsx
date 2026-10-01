import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { Briefcase, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  dismissReturnBanner,
  getSession,
  isReturnBannerDismissed,
  isReturning,
} from "@/lib/tripSession";

const ReturningTripBanner = () => {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("your trip");

  useEffect(() => {
    if (loading || user) return;
    if (isReturnBannerDismissed()) return;
    if (!isReturning()) return;
    const data = getSession();
    setLabel(data.trip_name || data.destination || "your trip");
    setVisible(true);
  }, [loading, user]);

  if (!visible) return null;

  return (
    <div className="bg-secondary/10 border-b border-secondary/30 no-print">
      <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
        <Briefcase className="h-4 w-4 text-secondary shrink-0" />
        <p className="text-sm text-foreground/90 flex-1 min-w-0 truncate">
          Your <span className="font-semibold">{label}</span> plan is still saved in this browser.
          Create a free account to keep it permanently.
        </p>
        <Link
          to="/my-trips"
          className="hidden sm:inline-flex items-center bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-xs font-semibold px-3 py-1.5 rounded-md shrink-0"
        >
          Save permanently
        </Link>
        <button
          onClick={() => {
            dismissReturnBanner();
            setVisible(false);
          }}
          aria-label="Dismiss"
          className="p-1 rounded hover:bg-foreground/10 transition-colors shrink-0"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ReturningTripBanner;
