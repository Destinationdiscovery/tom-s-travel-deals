import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PageType = "destination" | "gear" | "compass";

export function useCommentCounts(pageType: PageType, slugs: string[]) {
  return useQuery({
    queryKey: ["comment-counts", pageType, slugs],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("comments")
        .select("page_slug")
        .eq("page_type", pageType)
        .eq("is_hidden", false)
        .in("page_slug", slugs);

      if (error) throw error;

      // Count occurrences per slug
      const counts: Record<string, number> = {};
      slugs.forEach(slug => counts[slug] = 0);
      data?.forEach(row => {
        counts[row.page_slug] = (counts[row.page_slug] || 0) + 1;
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
