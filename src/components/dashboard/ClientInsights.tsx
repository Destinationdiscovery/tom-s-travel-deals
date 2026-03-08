import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, RefreshCcw } from "lucide-react";

interface RepeatClient {
  name: string;
  count: number;
}

const ClientInsights = () => {
  const [totalClients, setTotalClients] = useState(0);
  const [repeatRate, setRepeatRate] = useState(0);
  const [topRepeat, setTopRepeat] = useState<RepeatClient[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("client_quotes").select("client_name");
      if (!data) return;

      const counts: Record<string, number> = {};
      data.forEach((q) => {
        const name = q.client_name?.trim().toLowerCase();
        if (name) counts[name] = (counts[name] || 0) + 1;
      });

      const names = Object.keys(counts);
      const repeats = names.filter((n) => counts[n] > 1);
      setTotalClients(names.length);
      setRepeatRate(names.length > 0 ? Math.round((repeats.length / names.length) * 100) : 0);

      const sorted = repeats
        .map((name) => ({
          name: data.find((q) => q.client_name?.trim().toLowerCase() === name)?.client_name || name,
          count: counts[name],
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopRepeat(sorted);
    };
    fetch();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-violet-400" />
          Client Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <div>
            <p className="text-2xl font-bold text-foreground">{totalClients}</p>
            <p className="text-[10px] text-muted-foreground">Unique Clients</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${repeatRate}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{repeatRate}%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Repeat</p>
              <p className="text-[10px] text-muted-foreground">Client Rate</p>
            </div>
          </div>
        </div>

        {topRepeat.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <RefreshCcw className="h-3 w-3" /> Top Repeat Clients
            </p>
            <div className="space-y-1.5">
              {topRepeat.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate">{c.name}</span>
                  <span className="text-muted-foreground text-xs font-mono">{c.count} quotes</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientInsights;
