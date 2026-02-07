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
        const { data, error } = await supabase
          .from("search_suggestions")
          .select("id, name, property_type, search_count")
          .ilike("name", `%${query.trim()}%`)
          .order("search_count", { ascending: false })
          .limit(6);

        if (error) {
          console.error("Search suggestions error:", error);
          setSuggestions([]);
        } else {
          setSuggestions(data || []);
        }
      } catch (err) {
        console.error("Search suggestions fetch error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, isLoading };
}
