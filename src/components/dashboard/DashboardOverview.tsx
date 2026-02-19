import { useEffect, useState } from "react";
import { FileText, Calendar, Mail, DollarSign, AlertTriangle, Plus, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, isBefore, addDays, isToday } from "date-fns";
import type { DashboardTab } from "./DashboardSidebar";

interface DashboardOverviewProps {
  onNavigate: (tab: DashboardTab) => void;
}

const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const [stats, setStats] = useState({ quotes: 0, bookings: 0, emails: 0 });
  const [revenue, setRevenue] = useState({ totalQuoted: 0, totalBooked: 0 });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

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
      const { data } = await supabase.from("client_quotes").select("total_price, status");
      if (!data) return;
      let totalQuoted = 0, totalBooked = 0;
      data.forEach((q) => {
        const price = Number(q.total_price) || 0;
        totalQuoted += price;
        if (q.status === "booked") totalBooked += price;
      });
      setRevenue({ totalQuoted, totalBooked });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your overview.</p>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Today</span>
              <Badge variant="secondary" className="text-xs">{todayEvents.length}</Badge>
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

      {/* Revenue + Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate("quotes")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-lg font-bold text-foreground">${revenue.totalQuoted.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total Quoted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-emerald-500/30 transition-colors" onClick={() => onNavigate("quotes")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="h-4 w-4 text-emerald-400" /></div>
            <div>
              <p className="text-lg font-bold text-foreground">${revenue.totalBooked.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Booked Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate("quotes")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.quotes}</p>
              <p className="text-[10px] text-muted-foreground">Quotes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate("calendar")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Calendar className="h-4 w-4 text-emerald-400" /></div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.bookings}</p>
              <p className="text-[10px] text-muted-foreground">Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate("emails")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Mail className="h-4 w-4 text-amber-400" /></div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.emails}</p>
              <p className="text-[10px] text-muted-foreground">Emails</p>
            </div>
          </CardContent>
        </Card>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
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
