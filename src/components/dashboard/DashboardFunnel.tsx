import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch } from "lucide-react";

interface FunnelStage {
  label: string;
  count: number;
  color: string;
}

const DashboardFunnel = () => {
  const [stages, setStages] = useState<FunnelStage[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [quotesRes, bookingsRes] = await Promise.all([
        supabase.from("client_quotes").select("status"),
        supabase.from("bookings").select("event_type, event_date"),
      ]);

      const quotes = quotesRes.data || [];
      const bookings = bookingsRes.data || [];

      const total = quotes.length;
      const sent = quotes.filter((q) => q.status === "sent" || q.status === "accepted" || q.status === "booked").length;
      const booked = quotes.filter((q) => q.status === "booked").length;
      const departed = bookings.filter(
        (b) => b.event_type === "trip_start" && new Date(b.event_date) < new Date()
      ).length;

      setStages([
        { label: "Quotes", count: total, color: "bg-primary" },
        { label: "Sent", count: sent, color: "bg-sky-500" },
        { label: "Booked", count: booked, color: "bg-emerald-500" },
        { label: "Departed", count: departed, color: "bg-violet-500" },
      ]);
    };
    fetch();
  }, []);

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const pct = Math.round((stage.count / maxCount) * 100);
            const conversionPct = i > 0 && stages[i - 1].count > 0
              ? Math.round((stage.count / stages[i - 1].count) * 100)
              : null;
            return (
              <div key={stage.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-foreground">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{stage.count}</span>
                    {conversionPct !== null && (
                      <span className="text-xs text-muted-foreground">({conversionPct}%)</span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardFunnel;
