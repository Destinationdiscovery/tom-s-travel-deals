import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SocialVideoCard, { type SocialVideo } from "./SocialVideoCard";

interface Props {
  title?: string;
  subtitle?: string;
  reviewSlug?: string;
  limit?: number;
  hideWhenEmpty?: boolean;
}

const SocialVideoRow = ({
  title = "Watch real trips",
  subtitle,
  reviewSlug,
  limit = 12,
  hideWhenEmpty = true,
}: Props) => {
  const [videos, setVideos] = useState<SocialVideo[] | null>(null);

  useEffect(() => {
    (async () => {
      let q = (supabase as any)
        .from("social_videos")
        .select("id, platform, video_url, embed_url, profile_url, thumbnail_url, caption")
        .eq("is_active", true)
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      if (reviewSlug) q = q.eq("review_slug", reviewSlug);
      const { data } = await q;
      setVideos((data as SocialVideo[]) ?? []);
    })();
  }, [reviewSlug, limit]);

  if (videos === null) return null;
  if (videos.length === 0 && hideWhenEmpty) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory">
          {videos.map((v) => (
            <div key={v.id} className="snap-start">
              <SocialVideoCard video={v} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialVideoRow;
