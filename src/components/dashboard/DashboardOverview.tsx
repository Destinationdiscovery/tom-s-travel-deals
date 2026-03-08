import { useEffect, useState } from "react";
import { openExternal } from "@/lib/openExternal";
import { openOutlookInbox } from "@/lib/openWorkOutlook";
import { FileText, Calendar, Mail, DollarSign, AlertTriangle, Plus, TrendingUp, Clock, X, Search, Globe, Loader2, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format, isBefore, addDays } from "date-fns";
import type { DashboardTab } from "./DashboardSidebar";
import DashboardFunnel from "./DashboardFunnel";
import RevenueChart from "./RevenueChart";
import QuickLinksManager from "./QuickLinksManager";
import AgentPinboard from "./AgentPinboard";
import SiteActivityWidget from "./SiteActivityWidget";
import ClientInsights from "./ClientInsights";
import DashboardSearchChat from "./DashboardSearchChat";
import { useTravelIntel, type IntelType } from "@/hooks/useTravelIntel";
import { RequirementsResult, AdvisoriesResult, NewsResult, IntelLoading } from "@/components/intel/IntelResults";

interface DashboardOverviewProps {
  onNavigate: (tab: DashboardTab) => void;
}

const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const [stats, setStats] = useState({ quotes: 0, bookings: 0, emails: 0 });
  const [revenue, setRevenue] = useState({ totalQuoted: 0, totalBooked: 0, totalCommission: 0 });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());

  // Travel Intel state
  const [intelDest, setIntelDest] = useState("");
  const [intelType, setIntelType] = useState<IntelType>("requirements");
  const [intelCitizenship, setIntelCitizenship] = useState("Canada");
  const { loading: intelLoading, error: intelError, requirementsData, advisoriesData, newsData, fetchIntel, clearAll: clearIntel } = useTravelIntel();

  const dismissCard = (id: string) => setDismissedCards(prev => new Set(prev).add(id));

  const handleIntelSearch = () => {
    if (!intelDest.trim()) return;
    fetchIntel(intelType, intelDest.trim(), intelType === "requirements" ? intelCitizenship : undefined);
  };

  useEffect(() => {
    const fetchStats = async () => {
      const [quotesRes, bookingsRes, emailsRes] = await Promise.all([
        supabase.from("client_quotes").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("email_log").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        quotes: quotesRes.count || 0,
        bookings: bookingsRes.count || 0,
        emails: emailsRes.count || 0,
      });
    };

    const fetchRevenue = async () => {
      const [quotesRes, bookingDetailsRes] = await Promise.all([
        supabase.from("client_quotes").select("total_price, status"),
        supabase.from("booking_details").select("total_value, commission"),
      ]);
      let totalQuoted = 0, totalBooked = 0, totalCommission = 0;
      (quotesRes.data || []).forEach((q) => {
        const price = Number(q.total_price) || 0;
        totalQuoted += price;
        if (q.status === "booked") totalBooked += price;
      });
      (bookingDetailsRes.data || []).forEach((b: any) => {
        const val = Number(b.total_value) || 0;
        if (val > 0) totalBooked += val;
        totalCommission += Number(b.commission) || 0;
      });
      setRevenue({ totalQuoted, totalBooked, totalCommission });
    };

    const fetchDeadlines = async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const twoWeeks = format(addDays(new Date(), 14), "yyyy-MM-dd");
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .gte("event_date", today)
        .lte("event_date", twoWeeks)
        .eq("is_completed", false)
        .order("event_date", { ascending: true })
        .limit(5);
      setUpcomingDeadlines(data || []);
    };

    const fetchTodayEvents = async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("event_date", today)
        .order("created_at", { ascending: false });
      setTodayEvents(data || []);
    };

    const fetchRecentActivity = async () => {
      const [quotes, bookings, emails] = await Promise.all([
        supabase.from("client_quotes").select("id, client_name, resort_name, created_at, status").order("created_at", { ascending: false }).limit(3),
        supabase.from("bookings").select("id, client_name, title, created_at, event_type").order("created_at", { ascending: false }).limit(3),
        supabase.from("email_log").select("id, client_name, subject, created_at, email_type").order("created_at", { ascending: false }).limit(3),
      ]);
      const items: any[] = [];
      (quotes.data || []).forEach((q) => items.push({ ...q, _type: "quote", _time: q.created_at }));
      (bookings.data || []).forEach((b) => items.push({ ...b, _type: "booking", _time: b.created_at }));
      (emails.data || []).forEach((e) => items.push({ ...e, _type: "email", _time: e.created_at }));
      items.sort((a, b) => new Date(b._time).getTime() - new Date(a._time).getTime());
      setRecentActivity(items.slice(0, 5));
    };

    fetchStats();
    fetchRevenue();
    fetchDeadlines();
    fetchTodayEvents();
    fetchRecentActivity();
  }, []);

  const eventColors: Record<string, string> = {
    booking: "text-emerald-400",
    final_payment: "text-amber-400",
    departure: "text-sky-400",
    return: "text-violet-400",
    deposit_due: "text-rose-400",
    trip_start: "text-cyan-400",
    trip_end: "text-indigo-400",
  };

  const eventBgColors: Record<string, string> = {
    booking: "bg-emerald-500",
    final_payment: "bg-amber-500",
    departure: "bg-sky-500",
    return: "bg-violet-500",
    deposit_due: "bg-rose-500",
    trip_start: "bg-cyan-500",
    trip_end: "bg-indigo-500",
  };

  const activityIcon = (type: string) => {
    if (type === "quote") return <FileText className="h-3.5 w-3.5 text-primary" />;
    if (type === "booking") return <Calendar className="h-3.5 w-3.5 text-emerald-400" />;
    return <Mail className="h-3.5 w-3.5 text-amber-400" />;
  };

  const activityLabel = (item: any) => {
    if (item._type === "quote") return `Quote created for ${item.client_name} — ${item.resort_name}`;
    if (item._type === "booking") return `Booking added: ${item.title}`;
    return `Email sent to ${item.client_name}: ${item.subject}`;
  };

  const statCards = [
    { label: "Total Quoted", value: `$${revenue.totalQuoted.toLocaleString()}`, icon: DollarSign, accent: "border-l-primary", iconBg: "bg-primary/10", iconColor: "text-primary", tab: "quotes" as DashboardTab },
    { label: "Booked Revenue", value: `$${revenue.totalBooked.toLocaleString()}`, icon: TrendingUp, accent: "border-l-emerald-500", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", tab: "quotes" as DashboardTab },
    { label: "Commission", value: `$${revenue.totalCommission.toLocaleString()}`, icon: Wallet, accent: "border-l-orange-500", iconBg: "bg-orange-500/10", iconColor: "text-orange-400", tab: "calendar" as DashboardTab },
    { label: "Quotes", value: stats.quotes, icon: FileText, accent: "border-l-sky-500", iconBg: "bg-sky-500/10", iconColor: "text-sky-400", tab: "quotes" as DashboardTab },
    { label: "Bookings", value: stats.bookings, icon: Calendar, accent: "border-l-violet-500", iconBg: "bg-violet-500/10", iconColor: "text-violet-400", tab: "calendar" as DashboardTab },
    { label: "Emails", value: stats.emails, icon: Mail, accent: "border-l-amber-500", iconBg: "bg-amber-500/10", iconColor: "text-amber-400", tab: "emails" as DashboardTab },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your overview.</p>
      </div>

      {/* Today's Events */}
      {!dismissedCards.has("today") && todayEvents.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Today</span>
              <Badge variant="secondary" className="text-xs">{todayEvents.length}</Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => dismissCard("today")}><X className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="space-y-1.5">
              {todayEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${eventBgColors[e.event_type] || "bg-muted"}`} />
                  <span className="text-foreground">{e.title}</span>
                  <span className={`text-xs uppercase font-medium ${eventColors[e.event_type] || "text-muted-foreground"}`}>
                    {e.event_type.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat Cards with accent borders */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${card.accent}`}
            onClick={() => onNavigate(card.tab)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground tracking-tight">{card.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Urgent Deadlines */}
      {(() => {
        const urgentDeadlines = upcomingDeadlines.filter((d) => {
          const eventDate = new Date(d.event_date);
          return isBefore(eventDate, addDays(new Date(), 3));
        });
        if (urgentDeadlines.length === 0 || dismissedCards.has("urgent")) return null;
        return (
          <Card className="border-rose-500/30 bg-rose-500/5 border-l-4 border-l-rose-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span className="text-sm font-semibold text-foreground">Urgent - Due Within 3 Days</span>
                  <Badge variant="destructive" className="text-xs">{urgentDeadlines.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={openOutlookInbox}>
                    <Mail className="h-3 w-3" /> Open Outlook Web
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dismissCard("urgent")}><X className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="space-y-1.5">
                {urgentDeadlines.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium uppercase ${eventColors[d.event_type] || "text-muted-foreground"}`}>{d.event_type.replace(/_/g, " ")}</span>
                      <span className="text-foreground">{d.title}</span>
                      {d.client_name && <span className="text-xs text-muted-foreground">- {d.client_name}</span>}
                    </div>
                    <span className="text-muted-foreground">{format(new Date(d.event_date), "MMM d")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => onNavigate("quotes")} className="gap-2">
          <Plus className="h-4 w-4" /> New Quote
        </Button>
        <Button variant="outline" onClick={() => onNavigate("calendar")} className="gap-2">
          <Calendar className="h-4 w-4" /> Add Booking
        </Button>
        <Button variant="outline" onClick={() => onNavigate("emails")} className="gap-2">
          <Mail className="h-4 w-4" /> Compose Email
        </Button>
      </div>

      {/* Quick Links (DB-backed) */}
      <QuickLinksManager />

      {/* Quick Intel Lookup */}
      <Card className="border-l-4 border-l-cyan-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10">
              <Globe className="h-4 w-4 text-cyan-400" />
            </div>
            Quick Intel Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input
              value={intelDest}
              onChange={(e) => setIntelDest(e.target.value)}
              placeholder="Enter destination (e.g. Cuba, Japan)..."
              className="flex-1 min-w-[200px]"
              onKeyDown={(e) => e.key === "Enter" && handleIntelSearch()}
            />
            <Select value={intelType} onValueChange={(v) => { setIntelType(v as IntelType); clearIntel(); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requirements">Requirements</SelectItem>
                <SelectItem value="advisories">Advisories</SelectItem>
                <SelectItem value="news">News</SelectItem>
              </SelectContent>
            </Select>
            {intelType === "requirements" && (
              <Input
                value={intelCitizenship}
                onChange={(e) => setIntelCitizenship(e.target.value)}
                placeholder="Citizenship"
                className="w-[120px]"
              />
            )}
            <Button onClick={handleIntelSearch} disabled={intelLoading || !intelDest.trim()} className="gap-2">
              {intelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {intelLoading && <IntelLoading type={intelType} />}
          {intelError && <p className="text-sm text-destructive">{intelError}</p>}
          {requirementsData && intelType === "requirements" && <RequirementsResult data={requirementsData} />}
          {advisoriesData && intelType === "advisories" && <AdvisoriesResult data={advisoriesData} />}
          {newsData && intelType === "news" && <NewsResult data={newsData} />}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <DashboardFunnel />
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientInsights />
        <SiteActivityWidget />
      </div>

      {/* Intel Pinboard + Deadlines + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentPinboard />

        {/* Upcoming Deadlines */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deadlines in the next 2 weeks.</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium uppercase ${eventColors[d.event_type] || "text-muted-foreground"}`}>
                        {d.event_type.replace(/_/g, " ")}
                      </span>
                      <span className="text-foreground">{d.title}</span>
                    </div>
                    <span className="text-muted-foreground">{format(new Date(d.event_date), "MMM d")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div key={`${item._type}-${item.id}`} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5">{activityIcon(item._type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">{activityLabel(item)}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(item._time), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
