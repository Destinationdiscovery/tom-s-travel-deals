import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SocialVideoCard, { type SocialVideo } from "@/components/social/SocialVideoCard";
import { supabase } from "@/integrations/supabase/client";

const SocialVideosGallery = () => {
  const [videos, setVideos] = useState<SocialVideo[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("social_videos")
        .select("id, platform, video_url, embed_url, profile_url, thumbnail_url, caption")
        .eq("is_active", true)
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      setVideos((data as SocialVideo[]) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Travel videos from ReviewThenGo | TikTok, Instagram & YouTube"
        description="Short travel videos from ReviewThenGo. Watch honest, on-the-ground clips from real trips across the world."
        url="/videos"
        jsonLd={[{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: videos.map((v, i) => ({
            "@type": "ListItem", position: i + 1, name: v.caption ?? v.platform, url: v.video_url,
          })),
        }]}
      />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-6xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Travel videos</h1>
        <p className="text-muted-foreground mb-8">Short clips from our travels on TikTok, Instagram, and YouTube.</p>
        {videos.length === 0 ? (
          <p className="text-muted-foreground">No videos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {videos.map((v) => <SocialVideoCard key={v.id} video={v} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SocialVideosGallery;
