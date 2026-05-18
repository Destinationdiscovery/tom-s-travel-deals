import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface ActiveTrip {
  slug: string;
  name: string;
}

/**
 * Returns the user's most-recently-updated trip, or null. Fetched once per
 * auth change and cached in module state so route changes do not refetch.
 */
let cache: { userId: string | null; trip: ActiveTrip | null } | null = null;

export function useActiveTrip(): ActiveTrip | null {
  const { user } = useAuth();
  const [trip, setTrip] = useState<ActiveTrip | null>(
    cache && cache.userId === (user?.id ?? null) ? cache.trip : null
  );

  useEffect(() => {
    if (!user) {
      cache = { userId: null, trip: null };
      setTrip(null);
      return;
    }
    if (cache && cache.userId === user.id) {
      setTrip(cache.trip);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("trips")
        .select("slug,name")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const next = data ? { slug: data.slug as string, name: data.name as string } : null;
      cache = { userId: user.id, trip: next };
      if (!cancelled) setTrip(next);
    })();
    return () => { cancelled = true; };
  }, [user]);

  return trip;
}
