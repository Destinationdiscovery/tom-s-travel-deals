import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, MousePointerClick, Eye, Users, Heart, Gauge, BarChart3, TrendingUp, RefreshCw, Clock, ArrowLeftRight, UserPlus, Wrench, FileText } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

interface SearchItem { name: string; search_count: number; }
interface ClickItem { page: string; count: number; }
interface ViewItem { slug: string; view_count: number; last_viewed_at?: string; }
interface PlatformItem { platform: string; count: number; }
interface ReactionItem { reaction: string; count: number; }
interface ReactionSlugItem { slug: string; count: number; }
interface SubscriberSource { source: string; count: number; }
interface VitalItem { metric_name: string; avg: number; page: string; }
interface DailyClick { date: string; count: number; }
interface DailyView { date: string; count: number; }

type TimeRange = "today" | "7d" | "30d" | "all";

const VITAL_THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
};

const vitalColor = (name: string, value: number) => {
  const t = VITAL_THRESHOLDS[name];
  if (!t) return "text-muted-foreground";
  if (value <= t.good) return "text-emerald-400";
  if (value <= t.poor) return "text-amber-400";
  return "text-rose-400";
};

const formatSlug = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const RANGE_LABELS: Record<TimeRange, string> = {
  today: "Today",
  "7d": "7 Days",
  "30d": "30 Days",
  all: "All Time",
};

const getStartDate = (range: TimeRange): string | null => {
  if (range === "all") return null;
  const now = new Date();
  if (range === "today") return startOfDay(now).toISOString();
  if (range === "7d") return subDays(startOfDay(now), 7).toISOString();
  return subDays(startOfDay(now), 30).toISOString();
};

const AUTO_REFRESH_MS = 60_000; // 60 seconds

const SiteAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [clicks, setClicks] = useState<ClickItem[]>([]);
  const [views, setViews] = useState<ViewItem[]>([]);
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [positions, setPositions] = useState<{ position: string; count: number }[]>([]);
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [uniquePages, setUniquePages] = useState(0);
  const [reactions, setReactions] = useState<ReactionItem[]>([]);
  const [reactionSlugs, setReactionSlugs] = useState<ReactionSlugItem[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [recentSubCount, setRecentSubCount] = useState(0);
  const [subSources, setSubSources] = useState<SubscriberSource[]>([]);
  const [subInterests, setSubInterests] = useState<{ interest: string; count: number }[]>([]);
  const [vitals, setVitals] = useState<VitalItem[]>([]);
  const [vitalAverages, setVitalAverages] = useState<{ name: string; avg: number }[]>([]);

  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalSearches, setTotalSearches] = useState(0);
  const [totalReactions, setTotalReactions] = useState(0);

  // Session metrics
  const [totalSessions, setTotalSessions] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);
  const [bounceRate, setBounceRate] = useState(0);

  // Registered users
  const [signupCount, setSignupCount] = useState(0);
  const [recentSignups, setRecentSignups] = useState(0);
  const [dailySignups, setDailySignups] = useState<{ date: string; count: number }[]>([]);

  // Tool searches
  const [toolTotals, setToolTotals] = useState<{ tool: string; hits: number; misses: number; total: number }[]>([]);
  const [totalToolSearches, setTotalToolSearches] = useState(0);
  const [totalCacheHits, setTotalCacheHits] = useState(0);
  const [toolDaily, setToolDaily] = useState<{ date: string; count: number }[]>([]);
  const [topToolQueries, setTopToolQueries] = useState<{ query: string; tool: string; count: number }[]>([]);

  // Review generations
  const [reviewGenCount, setReviewGenCount] = useState(0);
  const [recentReviewGens, setRecentReviewGens] = useState(0);
  const [dailyReviewGens, setDailyReviewGens] = useState<{ date: string; count: number }[]>([]);
  const [topGenerated, setTopGenerated] = useState<{ slug: string; property_name: string; created_at: string }[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const startDate = getStartDate(timeRange);

    // Build queries — apply date filter where possible
    let clickQuery = supabase.from("affiliate_clicks").select("platform, page, position, created_at");
    let reactionQuery = supabase.from("review_reactions").select("reaction, slug, created_at");
    let subQuery = supabase.from("subscribers").select("created_at, source_slug, interests");
    let vitalsQuery = supabase.from("web_vitals").select("metric_name, value, page, created_at");

    if (startDate) {
      clickQuery = clickQuery.gte("created_at", startDate);
      reactionQuery = reactionQuery.gte("created_at", startDate);
      subQuery = subQuery.gte("created_at", startDate);
      vitalsQuery = vitalsQuery.gte("created_at", startDate);
    }

    // Views: use page_view_events for time-filtered, review_views aggregate for "all"
    const viewPromise = startDate
      ? supabase.from("page_view_events" as any).select("slug, created_at").gte("created_at", startDate)
      : supabase.from("review_views").select("slug, view_count, last_viewed_at").order("view_count", { ascending: false }).limit(50);

    // Sessions query
    let sessionQuery = supabase.from("sessions" as any).select("page_count, duration_seconds, is_bounce, started_at");
    if (startDate) {
      sessionQuery = sessionQuery.gte("started_at", startDate);
    }

    // Profiles (registered users)
    let profilesQuery = supabase.from("profiles").select("id, created_at");
    if (startDate) profilesQuery = profilesQuery.gte("created_at", startDate);

    // Tool search events
    let toolEventsQuery = supabase.from("tool_search_events" as any).select("tool_name, query, cache_hit, created_at");
    if (startDate) toolEventsQuery = toolEventsQuery.gte("created_at", startDate);

    // Cached reviews (generations)
    let reviewGenQuery = supabase.from("cached_reviews").select("slug, property_name, created_at").order("created_at", { ascending: false });
    if (startDate) reviewGenQuery = reviewGenQuery.gte("created_at", startDate);

    const [searchRes, clickRes, viewRes, reactionRes, subRes, vitalsRes, sessionRes, profilesRes, toolEventsRes, reviewGenRes] = await Promise.all([
      supabase.from("search_suggestions").select("name, search_count").order("search_count", { ascending: false }).limit(20),
      clickQuery,
      viewPromise,
      reactionQuery,
      subQuery,
      vitalsQuery,
      sessionQuery,
      profilesQuery,
      toolEventsQuery,
      reviewGenQuery,
    ]);

    // Profiles processing
    const profileData = profilesRes.data || [];
    setSignupCount(profileData.length);
    const weekAgoForSignups = new Date(); weekAgoForSignups.setDate(weekAgoForSignups.getDate() - 7);
    setRecentSignups(profileData.filter((p: any) => new Date(p.created_at) > weekAgoForSignups).length);
    const signupDayMap: Record<string, number> = {};
    profileData.forEach((p: any) => {
      const day = p.created_at?.substring(0, 10);
      if (day) signupDayMap[day] = (signupDayMap[day] || 0) + 1;
    });
    setDailySignups(Object.entries(signupDayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)));

    // Tool events processing
    const toolEventData = ((toolEventsRes as any).data || []) as Array<{ tool_name: string; query: string; cache_hit: boolean; created_at: string }>;
    setTotalToolSearches(toolEventData.length);
    setTotalCacheHits(toolEventData.filter((e) => e.cache_hit).length);

    const toolMap: Record<string, { hits: number; misses: number }> = {};
    const toolDayMap: Record<string, number> = {};
    const queryMap: Record<string, { query: string; tool: string; count: number }> = {};
    toolEventData.forEach((e) => {
      if (!toolMap[e.tool_name]) toolMap[e.tool_name] = { hits: 0, misses: 0 };
      if (e.cache_hit) toolMap[e.tool_name].hits += 1;
      else toolMap[e.tool_name].misses += 1;
      const day = e.created_at?.substring(0, 10);
      if (day) toolDayMap[day] = (toolDayMap[day] || 0) + 1;
      if (e.query) {
        const k = `${e.tool_name}|${e.query.toLowerCase()}`;
        if (!queryMap[k]) queryMap[k] = { query: e.query, tool: e.tool_name, count: 0 };
        queryMap[k].count += 1;
      }
    });
    setToolTotals(
      Object.entries(toolMap)
        .map(([tool, v]) => ({ tool, hits: v.hits, misses: v.misses, total: v.hits + v.misses }))
        .sort((a, b) => b.total - a.total)
    );
    setToolDaily(Object.entries(toolDayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)));
    setTopToolQueries(Object.values(queryMap).sort((a, b) => b.count - a.count).slice(0, 15));

    // Review generations processing
    const reviewGenData = (reviewGenRes.data || []) as Array<{ slug: string; property_name: string; created_at: string }>;
    setReviewGenCount(reviewGenData.length);
    const weekAgoForReviews = new Date(); weekAgoForReviews.setDate(weekAgoForReviews.getDate() - 7);
    setRecentReviewGens(reviewGenData.filter((r) => new Date(r.created_at) > weekAgoForReviews).length);
    const reviewDayMap: Record<string, number> = {};
    reviewGenData.forEach((r) => {
      const day = r.created_at?.substring(0, 10);
      if (day) reviewDayMap[day] = (reviewDayMap[day] || 0) + 1;
    });
    setDailyReviewGens(Object.entries(reviewDayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)));
    setTopGenerated(reviewGenData.slice(0, 15));

    // Sessions
    const sessionData = (sessionRes as any).data || [];
    setTotalSessions(sessionData.length);
    if (sessionData.length > 0) {
      const totalDur = sessionData.reduce((s: number, r: any) => s + (r.duration_seconds || 0), 0);
      setAvgDuration(Math.round(totalDur / sessionData.length));
      const bounces = sessionData.filter((r: any) => r.is_bounce).length;
      setBounceRate(Math.round((bounces / sessionData.length) * 100));
    } else {
      setAvgDuration(0);
      setBounceRate(0);
    }

    // Searches (no created_at filter available — always show all)
    const searchData = searchRes.data || [];
    setSearches(searchData.slice(0, 15));
    setTotalSearches(searchData.reduce((s, item) => s + item.search_count, 0));

    // Views — aggregate from events when time-filtered
    const viewRaw = viewRes.data || [];
    if (startDate) {
      // Aggregate per-event rows into slug counts
      const slugMap: Record<string, number> = {};
      const viewDayMap: Record<string, number> = {};
      viewRaw.forEach((e: any) => {
        slugMap[e.slug] = (slugMap[e.slug] || 0) + 1;
        const day = e.created_at?.substring(0, 10);
        if (day) viewDayMap[day] = (viewDayMap[day] || 0) + 1;
      });
      const aggregated = Object.entries(slugMap)
        .map(([slug, view_count]) => ({ slug, view_count }))
        .sort((a, b) => b.view_count - a.view_count);
      setViews(aggregated.slice(0, 15));
      setTotalViews(viewRaw.length);
      setUniquePages(aggregated.length);
      setDailyViews(Object.entries(viewDayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)));
    } else {
      const viewData = viewRaw as ViewItem[];
      setViews(viewData.slice(0, 15));
      setTotalViews(viewData.reduce((s, item) => s + (item.view_count || 0), 0));
      setUniquePages(viewData.length);
      setDailyViews([]);
    }

    // Clicks
    const clickData = clickRes.data || [];
    setTotalClicks(clickData.length);

    const clickPageMap: Record<string, number> = {};
    clickData.forEach((c) => { clickPageMap[c.page] = (clickPageMap[c.page] || 0) + 1; });
    setClicks(Object.entries(clickPageMap).map(([page, count]) => ({ page, count })).sort((a, b) => b.count - a.count).slice(0, 15));

    const platMap: Record<string, number> = {};
    clickData.forEach((c) => { platMap[c.platform] = (platMap[c.platform] || 0) + 1; });
    setPlatforms(Object.entries(platMap).map(([platform, count]) => ({ platform, count })).sort((a, b) => b.count - a.count));

    const posMap: Record<string, number> = {};
    clickData.forEach((c) => { const p = c.position || "unknown"; posMap[p] = (posMap[p] || 0) + 1; });
    setPositions(Object.entries(posMap).map(([position, count]) => ({ position, count })).sort((a, b) => b.count - a.count));

    const dayMap: Record<string, number> = {};
    clickData.forEach((c) => {
      const day = c.created_at?.substring(0, 10);
      if (day) dayMap[day] = (dayMap[day] || 0) + 1;
    });
    setDailyClicks(Object.entries(dayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)));

    // Reactions
    const reactionData = reactionRes.data || [];
    setTotalReactions(reactionData.length);
    const rxMap: Record<string, number> = {};
    reactionData.forEach((r) => { rxMap[r.reaction] = (rxMap[r.reaction] || 0) + 1; });
    setReactions(Object.entries(rxMap).map(([reaction, count]) => ({ reaction, count })).sort((a, b) => b.count - a.count));

    const rxSlugMap: Record<string, number> = {};
    reactionData.forEach((r) => { rxSlugMap[r.slug] = (rxSlugMap[r.slug] || 0) + 1; });
    setReactionSlugs(Object.entries(rxSlugMap).map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count).slice(0, 10));

    // Subscribers
    const subData = subRes.data || [];
    setSubscriberCount(subData.length);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    setRecentSubCount(subData.filter((s) => new Date(s.created_at) > weekAgo).length);

    const srcMap: Record<string, number> = {};
    subData.forEach((s) => { const src = s.source_slug || "direct"; srcMap[src] = (srcMap[src] || 0) + 1; });
    setSubSources(Object.entries(srcMap).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 10));

    const intMap: Record<string, number> = {};
    subData.forEach((s) => { (s.interests || []).forEach((i: string) => { intMap[i] = (intMap[i] || 0) + 1; }); });
    setSubInterests(Object.entries(intMap).map(([interest, count]) => ({ interest, count })).sort((a, b) => b.count - a.count));

    // Web Vitals
    const vData = vitalsRes.data || [];
    const vPageMap: Record<string, Record<string, { sum: number; count: number }>> = {};
    vData.forEach((v) => {
      if (!vPageMap[v.page]) vPageMap[v.page] = {};
      if (!vPageMap[v.page][v.metric_name]) vPageMap[v.page][v.metric_name] = { sum: 0, count: 0 };
      vPageMap[v.page][v.metric_name].sum += Number(v.value);
      vPageMap[v.page][v.metric_name].count += 1;
    });
    const vItems: VitalItem[] = [];
    Object.entries(vPageMap).forEach(([page, metrics]) => {
      Object.entries(metrics).forEach(([metric_name, { sum, count }]) => {
        vItems.push({ metric_name, avg: Math.round((sum / count) * 100) / 100, page });
      });
    });
    setVitals(vItems);

    const overallMap: Record<string, { sum: number; count: number }> = {};
    vData.forEach((v) => {
      if (!overallMap[v.metric_name]) overallMap[v.metric_name] = { sum: 0, count: 0 };
      overallMap[v.metric_name].sum += Number(v.value);
      overallMap[v.metric_name].count += 1;
    });
    setVitalAverages(Object.entries(overallMap).map(([name, { sum, count }]) => ({
      name, avg: Math.round((sum / count) * 100) / 100,
    })));

    setLastRefresh(new Date());
    setLoading(false);
  }, [timeRange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(fetchAll, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const PLATFORM_COLORS = ["bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"];

  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const summaryCards = [
    { label: "Page Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Sessions", value: totalSessions.toLocaleString(), icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Avg Duration", value: formatDuration(avgDuration), icon: Clock, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Bounce Rate", value: `${bounceRate}%`, icon: ArrowLeftRight, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Registered Users", value: signupCount.toLocaleString(), icon: UserPlus, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Tool Searches", value: totalToolSearches.toLocaleString(), icon: Wrench, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
    { label: "Reviews Generated", value: reviewGenCount.toLocaleString(), icon: FileText, color: "text-lime-400", bg: "bg-lime-500/10" },
    { label: "Affiliate Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Searches", value: totalSearches.toLocaleString(), icon: Search, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Subscribers", value: subscriberCount.toLocaleString(), icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Reactions", value: totalReactions.toLocaleString(), icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  const ranges: TimeRange[] = ["today", "7d", "30d", "all"];

  return (
    <div className="space-y-4">
      {/* Header with time range + refresh */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">Site Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Buttons */}
          <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === r
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchAll}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            Updated {format(lastRefresh, "h:mm:ss a")}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {summaryCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{c.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="views">
            <TabsList className="w-full flex-wrap h-auto gap-1">
              <TabsTrigger value="views" className="text-xs gap-1"><Eye className="h-3 w-3" /> Views</TabsTrigger>
              <TabsTrigger value="users" className="text-xs gap-1"><UserPlus className="h-3 w-3" /> Users</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs gap-1"><Wrench className="h-3 w-3" /> Tools</TabsTrigger>
              <TabsTrigger value="reviews-gen" className="text-xs gap-1"><FileText className="h-3 w-3" /> Reviews</TabsTrigger>
              <TabsTrigger value="clicks" className="text-xs gap-1"><MousePointerClick className="h-3 w-3" /> Clicks</TabsTrigger>
              <TabsTrigger value="searches" className="text-xs gap-1"><Search className="h-3 w-3" /> Searches</TabsTrigger>
              <TabsTrigger value="platforms" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Platforms</TabsTrigger>
              <TabsTrigger value="reactions" className="text-xs gap-1"><Heart className="h-3 w-3" /> Reactions</TabsTrigger>
              <TabsTrigger value="subscribers" className="text-xs gap-1"><Users className="h-3 w-3" /> Subscribers</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs gap-1"><Gauge className="h-3 w-3" /> Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="views" className="mt-4 space-y-4">
              {views.length === 0 ? <p className="text-sm text-muted-foreground">No view data yet.</p> : (
                <>
                  {dailyViews.length > 1 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Daily View Trend</p>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyViews}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), "MMM d")} tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip labelFormatter={(d) => format(new Date(String(d)), "MMM d, yyyy")} />
                            <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={views.slice(0, 10)}>
                        <XAxis dataKey="slug" tick={false} />
                        <YAxis />
                        <Tooltip labelFormatter={(v) => formatSlug(String(v))} />
                        <Bar dataKey="view_count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {views.map((v, i) => (
                      <div key={v.slug} className="flex items-center justify-between text-sm">
                        <span className="text-foreground truncate flex-1">
                          <span className="text-muted-foreground mr-2">{i + 1}.</span>
                          {formatSlug(v.slug)}
                        </span>
                        <div className="flex items-center gap-3">
                          {v.last_viewed_at && (
                            <span className="text-muted-foreground text-xs">{format(new Date(v.last_viewed_at), "MMM d, h:mm a")}</span>
                          )}
                          <span className="text-muted-foreground text-xs font-mono w-12 text-right">{v.view_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Clicks Tab */}
            <TabsContent value="clicks" className="mt-4 space-y-4">
              {clicks.length === 0 ? <p className="text-sm text-muted-foreground">No click data for this period.</p> : (
                <>
                  {dailyClicks.length > 1 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Daily Click Trend</p>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyClicks}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), "MMM d")} tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip labelFormatter={(d) => format(new Date(String(d)), "MMM d, yyyy")} />
                            <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">By Page</p>
                      <div className="space-y-1.5">
                        {clicks.slice(0, 10).map((c, i) => (
                          <div key={c.page} className="flex items-center justify-between text-sm">
                            <span className="text-foreground truncate flex-1">
                              <span className="text-muted-foreground mr-2">{i + 1}.</span>{c.page}
                            </span>
                            <span className="text-muted-foreground text-xs font-mono">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">By Position</p>
                      <div className="space-y-1.5">
                        {positions.map((p, i) => (
                          <div key={p.position} className="flex items-center justify-between text-sm">
                            <span className="text-foreground truncate flex-1">
                              <span className="text-muted-foreground mr-2">{i + 1}.</span>{p.position}
                            </span>
                            <span className="text-muted-foreground text-xs font-mono">{p.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Searches Tab */}
            <TabsContent value="searches" className="mt-4">
              <p className="text-xs text-muted-foreground mb-3">{searches.length} unique search terms tracked</p>
              {searches.length === 0 ? <p className="text-sm text-muted-foreground">No search data yet.</p> : (
                <div className="space-y-2">
                  {searches.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate flex-1">
                        <span className="text-muted-foreground mr-2">{i + 1}.</span>{s.name}
                      </span>
                      <span className="text-muted-foreground text-xs font-mono">{s.search_count}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="mt-4">
              {platforms.length === 0 ? <p className="text-sm text-muted-foreground">No platform data for this period.</p> : (
                <div className="space-y-3">
                  {platforms.map((p, i) => {
                    const maxCount = platforms[0]?.count || 1;
                    const pct = Math.round((p.count / maxCount) * 100);
                    return (
                      <div key={p.platform} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground font-medium">{p.platform}</span>
                          <span className="text-muted-foreground text-xs font-mono">{p.count} clicks</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${PLATFORM_COLORS[i % PLATFORM_COLORS.length]}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Reactions Tab */}
            <TabsContent value="reactions" className="mt-4">
              {reactions.length === 0 ? <p className="text-sm text-muted-foreground">No reaction data for this period.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">By Type</p>
                    <div className="space-y-2">
                      {reactions.map((r) => (
                        <div key={r.reaction} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{r.reaction}</span>
                          <span className="text-muted-foreground text-xs font-mono">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Most Engaged Properties</p>
                    <div className="space-y-2">
                      {reactionSlugs.map((r, i) => (
                        <div key={r.slug} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate flex-1">
                            <span className="text-muted-foreground mr-2">{i + 1}.</span>{formatSlug(r.slug)}
                          </span>
                          <span className="text-muted-foreground text-xs font-mono">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Subscribers Tab */}
            <TabsContent value="subscribers" className="mt-4">
              <div className="flex gap-4 mb-4">
                <div className="text-sm"><span className="font-bold text-foreground">{subscriberCount}</span> <span className="text-muted-foreground">in period</span></div>
                <div className="text-sm"><span className="font-bold text-emerald-400">{recentSubCount}</span> <span className="text-muted-foreground">last 7 days</span></div>
              </div>
              {subscriberCount === 0 ? <p className="text-sm text-muted-foreground">No subscribers in this period.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Signup Source</p>
                    <div className="space-y-1.5">
                      {subSources.map((s, i) => (
                        <div key={s.source} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate flex-1">
                            <span className="text-muted-foreground mr-2">{i + 1}.</span>{s.source}
                          </span>
                          <span className="text-muted-foreground text-xs font-mono">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Interests</p>
                    <div className="space-y-1.5">
                      {subInterests.map((int) => (
                        <div key={int.interest} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{int.interest}</span>
                          <span className="text-muted-foreground text-xs font-mono">{int.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="mt-4 space-y-4">
              {vitalAverages.length === 0 ? <p className="text-sm text-muted-foreground">No performance data for this period.</p> : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Overall Averages</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {vitalAverages.map((v) => (
                        <Card key={v.name}>
                          <CardContent className="p-3 text-center">
                            <p className="text-xs text-muted-foreground uppercase">{v.name}</p>
                            <p className={`text-xl font-bold ${vitalColor(v.name, v.avg)}`}>
                              {v.name === "CLS" ? v.avg.toFixed(3) : `${Math.round(v.avg)}ms`}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">By Page</p>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {(() => {
                        const pages = [...new Set(vitals.map((v) => v.page))];
                        return pages.map((page) => {
                          const pageVitals = vitals.filter((v) => v.page === page);
                          return (
                            <div key={page} className="flex items-center gap-3 text-sm py-1 border-b border-border/50">
                              <span className="text-foreground truncate flex-1 min-w-0">{page}</span>
                              {pageVitals.map((pv) => (
                                <span key={pv.metric_name} className={`text-xs font-mono ${vitalColor(pv.metric_name, pv.avg)}`}>
                                  {pv.metric_name}: {pv.metric_name === "CLS" ? pv.avg.toFixed(3) : `${Math.round(pv.avg)}`}
                                </span>
                              ))}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-4 space-y-4">
              <div className="flex gap-4">
                <div className="text-sm"><span className="font-bold text-foreground">{signupCount}</span> <span className="text-muted-foreground">in period</span></div>
                <div className="text-sm"><span className="font-bold text-emerald-400">{recentSignups}</span> <span className="text-muted-foreground">last 7 days</span></div>
              </div>
              {dailySignups.length > 1 ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Daily Signup Trend</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailySignups}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), "MMM d")} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip labelFormatter={(d) => format(new Date(String(d)), "MMM d, yyyy")} />
                        <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : signupCount === 0 ? (
                <p className="text-sm text-muted-foreground">No signups in this period.</p>
              ) : null}
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="mt-4 space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="text-sm"><span className="font-bold text-foreground">{totalToolSearches}</span> <span className="text-muted-foreground">total searches</span></div>
                <div className="text-sm"><span className="font-bold text-emerald-400">{totalCacheHits}</span> <span className="text-muted-foreground">cache hits ({totalToolSearches > 0 ? Math.round((totalCacheHits / totalToolSearches) * 100) : 0}%)</span></div>
              </div>
              {toolTotals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tool searches in this period.</p>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Searches per Tool (cache hits vs misses)</p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={toolTotals}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="tool" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="hits" stackId="a" fill="hsl(var(--primary))" name="Cache hits" />
                          <Bar dataKey="misses" stackId="a" fill="hsl(var(--destructive))" name="API calls" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {toolDaily.length > 1 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Daily Tool Search Trend</p>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={toolDaily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), "MMM d")} tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip labelFormatter={(d) => format(new Date(String(d)), "MMM d, yyyy")} />
                            <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Per-tool breakdown</p>
                      <div className="space-y-1.5">
                        {toolTotals.map((t) => (
                          <div key={t.tool} className="flex items-center justify-between text-sm border-b border-border/40 py-1">
                            <span className="text-foreground font-medium">{t.tool}</span>
                            <span className="text-xs font-mono text-muted-foreground">
                              <span className="text-emerald-400">{t.hits}</span> hits / <span className="text-rose-400">{t.misses}</span> calls
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Top queries</p>
                      <div className="space-y-1.5">
                        {topToolQueries.map((q, i) => (
                          <div key={`${q.tool}-${q.query}-${i}`} className="flex items-center justify-between text-sm">
                            <span className="text-foreground truncate flex-1">
                              <span className="text-muted-foreground mr-2">{i + 1}.</span>
                              <Badge variant="outline" className="mr-1 text-[10px]">{q.tool}</Badge>
                              {q.query}
                            </span>
                            <span className="text-muted-foreground text-xs font-mono">{q.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Reviews Generated Tab */}
            <TabsContent value="reviews-gen" className="mt-4 space-y-4">
              <div className="flex gap-4">
                <div className="text-sm"><span className="font-bold text-foreground">{reviewGenCount}</span> <span className="text-muted-foreground">generated in period</span></div>
                <div className="text-sm"><span className="font-bold text-emerald-400">{recentReviewGens}</span> <span className="text-muted-foreground">last 7 days</span></div>
              </div>
              {reviewGenCount === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews generated in this period.</p>
              ) : (
                <>
                  {dailyReviewGens.length > 1 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Daily Generation Trend</p>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyReviewGens}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), "MMM d")} tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip labelFormatter={(d) => format(new Date(String(d)), "MMM d, yyyy")} />
                            <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Most recent generations</p>
                    <div className="space-y-1.5">
                      {topGenerated.map((r, i) => (
                        <div key={r.slug} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate flex-1">
                            <span className="text-muted-foreground mr-2">{i + 1}.</span>
                            {r.property_name || formatSlug(r.slug)}
                          </span>
                          <span className="text-muted-foreground text-xs">{format(new Date(r.created_at), "MMM d, h:mm a")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAnalyticsDashboard;
