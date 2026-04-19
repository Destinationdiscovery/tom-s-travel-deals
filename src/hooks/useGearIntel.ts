import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { detectCountry } from "@/components/AffiliateLinks";

export type GearIntelType = "must-haves" | "review";

export interface GearItem {
  name: string;
  brand: string;
  priceRange: string;
  reason: string;
  category: string;
  amazonUrl: string;
  detailPageUrl?: string;
  imageUrl?: string;
}

export interface GearIntelData {
  items: GearItem[];
  citations?: string[];
  narrative?: string;
}

export interface GearReviewData {
  productName: string;
  brand: string;
  priceRange: string;
  overallRating: number;
  imageUrl?: string | null;
  ratings: Record<string, number>;
  summary: string;
  reviewParagraphs: string[];
  pros: string[];
  cons: string[];
  bestFor: string[];
  citations?: string[];
  amazonUrl: string;
}

export function useGearIntel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packingData, setPackingData] = useState<GearIntelData | null>(null);
  const [reviewData, setReviewData] = useState<GearReviewData | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchPackingList = async (query: string) => {
    setPackingData(null);
    setLoading(true);
    setError(null);

    try {
      const country = detectCountry();
      const { data, error: fnError } = await supabase.functions.invoke("travel-gear-intel", {
        body: { type: "must-haves", query, country },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const result = data?.data;
      if (!result) throw new Error("No data returned");

      setPackingData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReview = async (productName: string) => {
    setReviewLoading(true);
    setError(null);

    try {
      const country = detectCountry();
      const { data, error: fnError } = await supabase.functions.invoke("travel-gear-intel", {
        body: { type: "review", query: productName, country },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const result = data?.data;
      if (!result) throw new Error("No data returned");

      setReviewData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setReviewLoading(false);
    }
  };

  const clearReview = () => setReviewData(null);

  const clearAll = () => {
    setPackingData(null);
    setReviewData(null);
    setError(null);
  };

  return { loading, error, packingData, reviewData, reviewLoading, fetchPackingList, fetchProductReview, clearReview, clearAll };
}
