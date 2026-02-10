import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks that the logged-in user viewed a review.
 * No-ops for anonymous users.
 */
export function useReviewHistory(slug: string | undefined, propertyName?: string, location?: string | null) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !slug) return;

    const track = async () => {
      const { error } = await supabase
        .from("user_review_history")
        .upsert(
          {
            user_id: user.id,
            slug,
            property_name: propertyName ?? slug,
            location: location ?? null,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,slug" }
        );

      if (error) console.error("Failed to track review history:", error);
    };

    track();
  }, [user, slug, propertyName, location]);
}
