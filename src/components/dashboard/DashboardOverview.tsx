import { useEffect, useState } from "react";
import { FileText, Calendar, Mail, DollarSign, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format, isBefore, addDays } from "date-fns";
import type { DashboardTab } from "./DashboardSidebar";

interface DashboardOverviewProps {
  onNavigate: (tab: DashboardTab) => void;
}

const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const [stats, setStats] = useState({ quotes: 0, bookings: 0, emails: 0 });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);

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

    fetchStats();
    fetchDeadlines();
  }, []);

  const eventColors: Record<string, string> = {
    booking: "text-emerald-400",
    final_payment: "text-amber-400",
    departure: "text-sky-400",
    return: "text-violet-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate("quotes")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.quotes}</p>
              <p className="text-xs text-muted-foreground">Total Quotes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate("calendar")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-emerald-500/10">
              <Calendar className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.bookings}</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate("emails")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <Mail className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.emails}</p>
              <p className="text-xs text-muted-foreground">Emails Sent</p>
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
                      {d.event_type.replace("_", " ")}
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
    </div>
  );
};

export default DashboardOverview;
