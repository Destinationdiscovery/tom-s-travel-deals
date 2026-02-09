import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "rtg_saved_reviews";
const MAX_SAVED = 5;

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
  // Dispatch so other hook instances react
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function useSavedReviews() {
  const [savedReviews, setSavedReviews] = useState<SavedReview[]>(readFromStorage);

  // Sync across components / tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setSavedReviews(readFromStorage());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addReview = useCallback((review: SavedReview): boolean => {
    const current = readFromStorage();
    if (current.length >= MAX_SAVED) return false;
    if (current.some((r) => r.slug === review.slug)) return false;
    const next = [...current, { ...review, savedAt: new Date().toISOString() }];
    writeToStorage(next);
    setSavedReviews(next);
    return true;
  }, []);

  const removeReview = useCallback((slug: string) => {
    const current = readFromStorage();
    const next = current.filter((r) => r.slug !== slug);
    writeToStorage(next);
    setSavedReviews(next);
  }, []);

  const clearAll = useCallback(() => {
    writeToStorage([]);
    setSavedReviews([]);
  }, []);

  const isSaved = useCallback(
    (slug: string) => savedReviews.some((r) => r.slug === slug),
    [savedReviews]
  );

  const canAddMore = savedReviews.length < MAX_SAVED;

  return { savedReviews, addReview, removeReview, clearAll, isSaved, canAddMore, count: savedReviews.length };
}
