import { useState, useEffect } from "react";
import { Search, Shield, AlertTriangle, Newspaper, CheckCircle, XCircle, Info } from "lucide-react";

const TABS = ["Requirements", "Advisories", "News"] as const;

const TAB_CONTENT = {
  Requirements: [
    { icon: CheckCircle, text: "Valid passport (6+ months validity)", color: "text-green-500" },
    { icon: Info, text: "Tourist card required, available on arrival", color: "text-blue-500" },
    { icon: CheckCircle, text: "Travel medical insurance mandatory", color: "text-green-500" },
    { icon: XCircle, text: "US credit/debit cards not accepted", color: "text-red-500" },
  ],
  Advisories: [
    { icon: AlertTriangle, text: "Level 2. Exercise Increased Caution", color: "text-amber-500" },
    { icon: Shield, text: "Petty crime in tourist areas, keep valuables secure", color: "text-amber-500" },
    { icon: Info, text: "Limited internet & phone connectivity", color: "text-blue-500" },
    { icon: CheckCircle, text: "Healthcare available but bring prescriptions", color: "text-green-500" },
  ],
  News: [
    { icon: Newspaper, text: "Cuba eases tourist visa process for 2025 season", color: "text-primary" },
    { icon: Newspaper, text: "New direct flights from Toronto to Havana", color: "text-primary" },
    { icon: Newspaper, text: "Varadero beach ranked #3 in Caribbean", color: "text-primary" },
    { icon: Newspaper, text: "Hotel restoration boom in Old Havana district", color: "text-primary" },
  ],
};

interface PromoIntelSceneProps {
  visible: boolean;
}

const PromoIntelScene = ({ visible }: PromoIntelSceneProps) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!visible) {
      setActiveTab(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % TABS.length);
    }, 700);

    return () => clearInterval(interval);
  }, [visible]);

  const currentTab = TABS[activeTab] ?? TABS[0];
  const items = TAB_CONTENT[currentTab];

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-background transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div
        className={`max-w-2xl w-full mx-4 transition-all duration-400 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-card rounded-2xl p-6 shadow-lg">
          {/* Search bar */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <div className="w-full h-12 pl-12 pr-4 rounded-lg bg-muted/50 text-foreground text-base flex items-center font-medium">
              Cuba
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-muted/30 rounded-lg p-1">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  i === activeTab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-3 animate-fade-in" key={currentTab}>
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/20"
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${item.color}`} />
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoIntelScene;
