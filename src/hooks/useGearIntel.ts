import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { detectCountry } from "@/components/AffiliateLinks";

export type GearIntelType = "trending" | "must-haves";

export interface GearItem {
  name: string;
  brand: string;
  priceRange: string;
  reason: string;
  category: string;
  amazonUrl: string;
}

export interface GearIntelData {
  items: GearItem[];
  citations?: string[];
}

export function useGearIntel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingData, setTrendingData] = useState<GearIntelData | null>(null);
  const [mustHavesData, setMustHavesData] = useState<GearIntelData | null>(null);

  const fetchGearIntel = async (type: GearIntelType, query: string) => {
    setLoading(true);
    setError(null);

    try {
      const country = detectCountry();
      const { data, error: fnError } = await supabase.functions.invoke("travel-gear-intel", {
        body: { type, query, country },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const result = data?.data;
      if (!result) throw new Error("No data returned");

      if (type === "trending") setTrendingData(result);
      else setMustHavesData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, trendingData, mustHavesData, fetchGearIntel };
}
