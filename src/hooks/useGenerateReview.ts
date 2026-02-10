import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThingToDo {
  name: string;
  description: string;
  category: string;
  rating?: number;
  photoReference?: string;
}

export interface ReviewData {
  propertyName: string;
  location: string;
  propertyType: string;
  overallRating: number;
  ratings: Record<string, number>;
  summary: string;
  reviewParagraphs: string[];
  tips: string[];
  bestFor: string[];
  citations?: string[];
  thingsToDo?: ThingToDo[];
  photoReferences?: string[];
}

export interface CachedReview {
  id?: string;
  property_name: string;
  slug: string;
  location: string | null;
  property_type: string | null;
  review_data: ReviewData;
  created_at?: string;
}

export function useGenerateReview() {
  const [review, setReview] = useState<CachedReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReview = async (propertyName: string) => {
    setIsLoading(true);
    setError(null);
    setReview(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-review", {
        body: { propertyName },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to generate review");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.review) {
        setReview(data.review);
      } else {
        throw new Error("No review data received");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Generate review error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearReview = () => {
    setReview(null);
    setError(null);
  };

  return { review, isLoading, error, generateReview, clearReview };
}
