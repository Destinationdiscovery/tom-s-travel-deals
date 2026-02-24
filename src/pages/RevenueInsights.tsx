import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, MousePointerClick, Globe, BarChart3 } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8884d8", "#82ca9d", "#ffc658"];

interface ClickRow {
  id: string;
  platform: string;
  page: string;
  position: string | null;
  created_at: string;
}

interface VitalRow {
  metric_name: string;
  value: number;
  page: string;
  created_at: string;
}

const RevenueInsights = () => {
  const { isAdmin } = useAuth();
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [vitals, setVitals] = useState<VitalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      const [clicksRes, vitalsRes] = await Promise.all([
        supabase.from("affiliate_clicks").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("web_vitals").select("*").order("created_at", { ascending: false }).limit(500),
      ]);
      if (clicksRes.data) setClicks(clicksRes.data as ClickRow[]);
      if (vitalsRes.data) setVitals(vitalsRes.data as VitalRow[]);
      setLoading(false);
    };
    fetchData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-4">Admin privileges required.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Platform breakdown
  const platformCounts: Record<string, number> = {};
  clicks.forEach((c) => { platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1; });
  const platformData = Object.entries(platformCounts).map(([name, value]) => ({ name, value }));

  // Page breakdown (top 10)
  const pageCounts: Record<string, number> = {};
  clicks.forEach((c) => { pageCounts[c.page] = (pageCounts[c.page] || 0) + 1; });
  const pageData = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 25) + "…" : name, value }));

  // Daily trend
  const dailyCounts: Record<string, number> = {};
  clicks.forEach((c) => {
    const day = c.created_at.slice(0, 10);
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, count]) => ({ date: date.slice(5), count }));

  // Position breakdown
  const posCounts: Record<string, number> = {};
  clicks.forEach((c) => { if (c.position) posCounts[c.position] = (posCounts[c.position] || 0) + 1; });
  const posData = Object.entries(posCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Vitals averages
  const vitalAverages: Record<string, { total: number; count: number }> = {};
  vitals.forEach((v) => {
    if (!vitalAverages[v.metric_name]) vitalAverages[v.metric_name] = { total: 0, count: 0 };
    vitalAverages[v.metric_name].total += v.value;
    vitalAverages[v.metric_name].count += 1;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Revenue Insights" description="Admin revenue dashboard" />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Revenue Insights</h1>
          <p className="text-muted-foreground mb-8">Affiliate click tracking & performance metrics</p>

          {loading ? (
            <p className="text-muted-foreground">Loading data...</p>
          ) : (
            <div className="space-y-8">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-5 shadow-soft">
                  <MousePointerClick className="h-5 w-5 text-secondary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{clicks.length}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
                <div className="bg-card rounded-xl p-5 shadow-soft">
                  <Globe className="h-5 w-5 text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{Object.keys(platformCounts).length}</p>
                  <p className="text-xs text-muted-foreground">Platforms</p>
                </div>
                <div className="bg-card rounded-xl p-5 shadow-soft">
                  <BarChart3 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-2xl font-bold text-foreground">{Object.keys(pageCounts).length}</p>
                  <p className="text-xs text-muted-foreground">Pages with Clicks</p>
                </div>
                <div className="bg-card rounded-xl p-5 shadow-soft">
                  <TrendingUp className="h-5 w-5 text-secondary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{dailyData.length > 0 ? dailyData[dailyData.length - 1].count : 0}</p>
                  <p className="text-xs text-muted-foreground">Today's Clicks</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Platform pie */}
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h3 className="font-display font-semibold text-foreground mb-4">Clicks by Platform</h3>
                  {platformData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`}>
                          {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-muted-foreground">No data yet</p>}
                </div>

                {/* Page bar */}
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h3 className="font-display font-semibold text-foreground mb-4">Clicks by Page</h3>
                  {pageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={pageData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-muted-foreground">No data yet</p>}
                </div>
              </div>

              {/* Daily trend */}
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="font-display font-semibold text-foreground mb-4">Daily Click Trend (Last 30 Days)</h3>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">No data yet</p>}
              </div>

              {/* Top positions */}
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="font-display font-semibold text-foreground mb-4">Top Performing Positions</h3>
                {posData.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {posData.map(([pos, count]) => (
                      <div key={pos} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-foreground">{pos}</p>
                        <p className="text-lg font-bold text-primary">{count}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No data yet</p>}
              </div>

              {/* Web Vitals */}
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="font-display font-semibold text-foreground mb-4">Web Vitals (Averages)</h3>
                {Object.keys(vitalAverages).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(vitalAverages).map(([name, data]) => {
                      const avg = Math.round((data.total / data.count) * 10) / 10;
                      const unit = name === "CLS" ? "" : "ms";
                      return (
                        <div key={name} className="bg-muted/50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{name}</p>
                          <p className="text-2xl font-bold text-foreground">{avg}{unit}</p>
                          <p className="text-xs text-muted-foreground">{data.count} samples</p>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No vitals data yet. Data is collected from production visits.</p>}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RevenueInsights;
