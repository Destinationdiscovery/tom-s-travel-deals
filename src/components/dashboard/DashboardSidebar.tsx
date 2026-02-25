import { LayoutDashboard, FileText, Calendar, Mail, ImageIcon, Users, Megaphone, ClipboardList, Menu, TrendingUp, BookOpen, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export type DashboardTab = "overview" | "quotes" | "calendar" | "emails" | "gear" | "clients" | "deals" | "bookings" | "revenue" | "blog" | "featured-deals";

const tabs = [
  { id: "overview" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "quotes" as const, label: "Quote Builder", icon: FileText },
  { id: "clients" as const, label: "Clients", icon: Users },
  { id: "bookings" as const, label: "Bookings", icon: ClipboardList },
  { id: "calendar" as const, label: "Calendar", icon: Calendar },
  { id: "emails" as const, label: "Emails", icon: Mail },
  { id: "deals" as const, label: "Deal Maker", icon: Megaphone },
  { id: "featured-deals" as const, label: "Featured Deals", icon: Star },
  { id: "blog" as const, label: "Blog", icon: BookOpen },
  { id: "gear" as const, label: "Featured Gear", icon: ImageIcon },
  { id: "revenue" as const, label: "Revenue", icon: TrendingUp },
];

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SidebarContent = ({ activeTab, onTabChange, onSelect }: { activeTab: DashboardTab; onTabChange: (tab: DashboardTab) => void; onSelect?: () => void }) => (
  <>
    <div className="p-4">
      <h2 className="font-display text-lg font-bold text-foreground mb-1">Agent HQ</h2>
      <p className="text-xs text-muted-foreground">Travel Agent Dashboard</p>
    </div>
    <nav className="px-2 space-y-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => { onTabChange(tab.id); onSelect?.(); }}
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
  </>
);

const DashboardSidebar = ({ activeTab, onTabChange, open, onOpenChange }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button className="fixed top-20 left-3 z-40 p-2 rounded-lg bg-card border border-border shadow-md">
            <Menu className="h-5 w-5 text-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0">
          <SidebarContent activeTab={activeTab} onTabChange={onTabChange} onSelect={() => onOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)]">
      <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
    </aside>
  );
};

export default DashboardSidebar;
