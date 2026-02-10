import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "rtg_saved_reviews";
const MAX_SAVED_ANON = 5;

export interface SavedReview {
  slug: string;
  propertyName: string;
  location: string | null;
  overallRating: number;
  ratings: Record<string, number>;
  summary: string;
  bestFor: string[];
  savedAt: string;
}

/* ─── localStorage helpers (anonymous) ─── */

function readFromStorage(): SavedReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(reviews: SavedReview[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

/* ─── Hook ─── */

export function useSavedReviews() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [savedReviews, setSavedReviews] = useState<SavedReview[]>(readFromStorage);
  const [dbLoading, setDbLoading] = useState(false);

  // Fetch from DB when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setSavedReviews(readFromStorage());
      return;
    }

    const fetchFromDb = async () => {
      setDbLoading(true);
      const { data } = await supabase
        .from("user_saved_reviews")
        .select("slug, property_name, location, overall_rating, ratings, summary, best_for, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (data) {
        const mapped: SavedReview[] = data.map((r: any) => ({
          slug: r.slug,
          propertyName: r.property_name,
          location: r.location,
          overallRating: r.overall_rating,
          ratings: (r.ratings ?? {}) as Record<string, number>,
          summary: r.summary ?? "",
          bestFor: r.best_for ?? [],
          savedAt: r.created_at,
        }));
        setSavedReviews(mapped);
      }
      setDbLoading(false);
    };

    fetchFromDb();
  }, [isAuthenticated, user]);

  // Migrate localStorage to DB on first sign-in
  useEffect(() => {
    if (!isAuthenticated) return;
    const local = readFromStorage();
    if (local.length === 0) return;

    const migrate = async () => {
      for (const r of local) {
        await supabase.from("user_saved_reviews").upsert(
          {
            user_id: user!.id,
            slug: r.slug,
            property_name: r.propertyName,
            location: r.location,
            overall_rating: r.overallRating,
            ratings: r.ratings,
            summary: r.summary,
            best_for: r.bestFor,
          },
          { onConflict: "user_id,slug" }
        );
      }
      localStorage.removeItem(STORAGE_KEY);
      // Re-fetch
      const { data } = await supabase
        .from("user_saved_reviews")
        .select("slug, property_name, location, overall_rating, ratings, summary, best_for, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (data) {
        setSavedReviews(data.map((r: any) => ({
          slug: r.slug,
          propertyName: r.property_name,
          location: r.location,
          overallRating: r.overall_rating,
          ratings: (r.ratings ?? {}) as Record<string, number>,
          summary: r.summary ?? "",
          bestFor: r.best_for ?? [],
          savedAt: r.created_at,
        })));
      }
    };

    migrate();
  }, [isAuthenticated]);

  // Sync localStorage across tabs (anonymous only)
  useEffect(() => {
    if (isAuthenticated) return;
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setSavedReviews(readFromStorage());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [isAuthenticated]);

  const addReview = useCallback(
    async (review: SavedReview): Promise<boolean> => {
      if (isAuthenticated) {
        const { error } = await supabase.from("user_saved_reviews").upsert(
          {
            user_id: user!.id,
            slug: review.slug,
            property_name: review.propertyName,
            location: review.location,
            overall_rating: review.overallRating,
            ratings: review.ratings,
            summary: review.summary,
            best_for: review.bestFor,
          },
          { onConflict: "user_id,slug" }
        );
        if (error) return false;
        setSavedReviews((prev) => {
          if (prev.some((r) => r.slug === review.slug)) return prev;
          return [...prev, { ...review, savedAt: new Date().toISOString() }];
        });
        return true;
      }

      // Anonymous
      const current = readFromStorage();
      if (current.length >= MAX_SAVED_ANON) return false;
      if (current.some((r) => r.slug === review.slug)) return false;
      const next = [...current, { ...review, savedAt: new Date().toISOString() }];
      writeToStorage(next);
      setSavedReviews(next);
      return true;
    },
    [isAuthenticated, user]
  );

  const removeReview = useCallback(
    async (slug: string) => {
      if (isAuthenticated) {
        await supabase.from("user_saved_reviews").delete().eq("user_id", user!.id).eq("slug", slug);
        setSavedReviews((prev) => prev.filter((r) => r.slug !== slug));
        return;
      }
      const current = readFromStorage();
      const next = current.filter((r) => r.slug !== slug);
      writeToStorage(next);
      setSavedReviews(next);
    },
    [isAuthenticated, user]
  );

  const clearAll = useCallback(async () => {
    if (isAuthenticated) {
      await supabase.from("user_saved_reviews").delete().eq("user_id", user!.id);
      setSavedReviews([]);
      return;
    }
    writeToStorage([]);
    setSavedReviews([]);
  }, [isAuthenticated, user]);

  const isSaved = useCallback(
    (slug: string) => savedReviews.some((r) => r.slug === slug),
    [savedReviews]
  );

  const canAddMore = isAuthenticated || savedReviews.length < MAX_SAVED_ANON;

  return {
    savedReviews,
    addReview,
    removeReview,
    clearAll,
    isSaved,
    canAddMore,
    count: savedReviews.length,
    isAuthenticated,
    dbLoading,
  };
}
