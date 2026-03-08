import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Search, MousePointerClick, Eye } from "lucide-react";

interface SearchItem { name: string; search_count: number; }
interface ClickItem { page: string; count: number; }
interface ViewItem { slug: string; view_count: number; }

const SiteActivityWidget = () => {
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [clicks, setClicks] = useState<ClickItem[]>([]);
  const [views, setViews] = useState<ViewItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [searchRes, clickRes, viewRes] = await Promise.all([
        supabase.from("search_suggestions").select("name, search_count").order("search_count", { ascending: false }).limit(10),
        supabase.from("affiliate_clicks").select("page"),
        supabase.from("review_views").select("slug, view_count").order("view_count", { ascending: false }).limit(10),
      ]);

      setSearches(searchRes.data || []);
      setViews(viewRes.data || []);

      // Group clicks by page
      const clickMap: Record<string, number> = {};
      (clickRes.data || []).forEach((c) => {
        clickMap[c.page] = (clickMap[c.page] || 0) + 1;
      });
      const sorted = Object.entries(clickMap)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setClicks(sorted);
    };
    fetchAll();
  }, []);

  const formatSlug = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4 text-sky-400" />
          Site Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="searches">
          <TabsList className="w-full h-8">
            <TabsTrigger value="searches" className="text-xs gap-1 flex-1"><Search className="h-3 w-3" /> Searches</TabsTrigger>
            <TabsTrigger value="clicks" className="text-xs gap-1 flex-1"><MousePointerClick className="h-3 w-3" /> Clicks</TabsTrigger>
            <TabsTrigger value="views" className="text-xs gap-1 flex-1"><Eye className="h-3 w-3" /> Views</TabsTrigger>
          </TabsList>

          <TabsContent value="searches" className="mt-3">
            {searches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No search data yet.</p>
            ) : (
              <div className="space-y-2">
                {searches.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate flex-1">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {s.name}
                    </span>
                    <span className="text-muted-foreground text-xs font-mono">{s.search_count}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="clicks" className="mt-3">
            {clicks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No click data yet.</p>
            ) : (
              <div className="space-y-2">
                {clicks.map((c, i) => (
                  <div key={c.page} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate flex-1">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {c.page}
                    </span>
                    <span className="text-muted-foreground text-xs font-mono">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="views" className="mt-3">
            {views.length === 0 ? (
              <p className="text-sm text-muted-foreground">No view data yet.</p>
            ) : (
              <div className="space-y-2">
                {views.map((v, i) => (
                  <div key={v.slug} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate flex-1">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {formatSlug(v.slug)}
                    </span>
                    <span className="text-muted-foreground text-xs font-mono">{v.view_count}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SiteActivityWidget;
