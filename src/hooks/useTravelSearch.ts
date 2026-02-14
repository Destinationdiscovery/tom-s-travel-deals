import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  name: string;
  location: string;
  type: string;
  rating: number;
  description: string;
  bestFor: string[];
  priceRange: string;
}

export interface SearchActivity {
  name: string;
  location: string;
  category: string;
  rating: number;
  description: string;
  bestFor: string[];
  priceRange: string;
}

export function useTravelSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activities, setActivities] = useState<SearchActivity[]>([]);
  const [citations, setCitations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setActivities([]);
    setCitations([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("travel-search", {
        body: { query },
      });

      if (fnError) throw new Error(fnError.message || "Search failed");
      if (data?.error) throw new Error(data.error);

      setResults(data.results || []);
      setActivities(data.activities || []);
      setCitations(data.citations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setActivities([]);
    setCitations([]);
    setError(null);
  };

  return { results, activities, citations, isLoading, error, search, clearResults };
}
