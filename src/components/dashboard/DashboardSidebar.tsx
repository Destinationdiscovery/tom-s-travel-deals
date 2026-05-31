import { LayoutDashboard, FileText, Calendar, Mail, ImageIcon, Users, ClipboardList, Menu, BookOpen, Star, MapPin, PanelTop, Luggage, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export type DashboardTab = "overview" | "quotes" | "calendar" | "emails" | "gear" | "clients" | "bookings" | "blog" | "featured-deals" | "reviews" | "banner-deals" | "compass";

interface TabItem {
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
}

interface TabSection {
  label: string;
  tabs: TabItem[];
}

const sections: TabSection[] = [
  {
    label: "AGENT HQ",
    tabs: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "CRM",
    tabs: [
      { id: "quotes", label: "Quote Builder", icon: FileText },
      { id: "clients", label: "Clients", icon: Users },
      { id: "bookings", label: "Bookings", icon: ClipboardList },
      { id: "calendar", label: "Calendar", icon: Calendar },
      { id: "emails", label: "Emails", icon: Mail },
    ],
  },
  {
    label: "SITE MANAGEMENT",
    tabs: [
      { id: "blog", label: "Content Studio", icon: BookOpen },
      { id: "featured-deals", label: "Featured Deals", icon: Star },
      { id: "banner-deals", label: "Banner Deals", icon: PanelTop },
      { id: "reviews", label: "Featured Reviews", icon: MapPin },
      { id: "gear", label: "Featured Gear", icon: Luggage },
    ],
  },
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
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 pt-4 pb-1.5">{section.label}</p>
          {section.tabs.map((tab) => (
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
        </div>
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
