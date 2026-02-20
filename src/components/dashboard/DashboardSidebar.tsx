import { LayoutDashboard, FileText, Calendar, Mail, ImageIcon, Users, Megaphone, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardTab = "overview" | "quotes" | "calendar" | "emails" | "gear" | "clients" | "deals" | "bookings";

const tabs = [
  { id: "overview" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "quotes" as const, label: "Quote Builder", icon: FileText },
  { id: "clients" as const, label: "Clients", icon: Users },
  { id: "bookings" as const, label: "Bookings", icon: ClipboardList },
  { id: "calendar" as const, label: "Calendar", icon: Calendar },
  { id: "emails" as const, label: "Emails", icon: Mail },
  { id: "deals" as const, label: "Deal Maker", icon: Megaphone },
  { id: "gear" as const, label: "Gear Images", icon: ImageIcon },
];

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <h2 className="font-display text-lg font-bold text-foreground mb-1">Agent HQ</h2>
        <p className="text-xs text-muted-foreground">Travel Agent Dashboard</p>
      </div>
      <nav className="px-2 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
