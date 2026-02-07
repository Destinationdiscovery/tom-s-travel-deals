import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchSuggestion {
  id: string;
  name: string;
  property_type: string | null;
  search_count: number;
}

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchTerm = `%${query.trim()}%`;

        // Query both tables in parallel
        const [suggestionsRes, reviewsRes] = await Promise.all([
          supabase
            .from("search_suggestions")
            .select("id, name, property_type, search_count")
            .ilike("name", searchTerm)
            .order("search_count", { ascending: false })
            .limit(6),
          supabase
            .from("cached_reviews")
            .select("id, property_name, property_type")
            .ilike("property_name", searchTerm)
            .limit(6),
        ]);

        // Start with search_suggestions results
        const merged: SearchSuggestion[] = [];
        const seenNames = new Set<string>();

        if (suggestionsRes.data) {
          for (const s of suggestionsRes.data) {
            const key = s.name.toLowerCase();
            if (!seenNames.has(key)) {
              seenNames.add(key);
              merged.push(s);
            }
          }
        }

        // Add cached_reviews results that aren't already present
        if (reviewsRes.data) {
          for (const r of reviewsRes.data) {
            const key = r.property_name.toLowerCase();
            if (!seenNames.has(key)) {
              seenNames.add(key);
              merged.push({
                id: r.id,
                name: r.property_name,
                property_type: r.property_type,
                search_count: 0,
              });
            }
          }
        }

        setSuggestions(merged.slice(0, 6));
      } catch (err) {
        console.error("Search suggestions fetch error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, isLoading };
}
