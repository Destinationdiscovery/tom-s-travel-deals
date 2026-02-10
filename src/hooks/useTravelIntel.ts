import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type IntelType = "requirements" | "advisories" | "news";

export interface RequirementsData {
  visaRequired: boolean;
  visaTypes: string[];
  documents: string[];
  healthRequirements: string[];
  customsRules: string[];
  localLaws: string[];
  importantNotes: string[];
  citations?: string[];
}

export interface Advisory {
  source: string;
  level: string;
  summary: string;
  details: string;
}

export interface AdvisoriesData {
  advisoryLevel: number;
  advisories: Advisory[];
  healthAlerts: string[];
  safetyTips: string[];
  citations?: string[];
}

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  date: string;
  category: string;
}

export interface NewsData {
  articles: NewsArticle[];
  citations?: string[];
}

export function useTravelIntel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirementsData, setRequirementsData] = useState<RequirementsData | null>(null);
  const [advisoriesData, setAdvisoriesData] = useState<AdvisoriesData | null>(null);
  const [newsData, setNewsData] = useState<NewsData | null>(null);

  const fetchIntel = async (type: IntelType, destination: string, citizenship?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("travel-intel", {
        body: { type, destination, citizenship: citizenship || "" },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const result = data?.data;
      if (!result) throw new Error("No data returned");

      if (type === "requirements") setRequirementsData(result);
      else if (type === "advisories") setAdvisoriesData(result);
      else if (type === "news") setNewsData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, requirementsData, advisoriesData, newsData, fetchIntel };
}
