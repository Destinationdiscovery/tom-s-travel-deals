import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Play, Luggage, Package, ArrowRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SocialVideoModal from "@/components/social/SocialVideoModal";
import { deriveEmbedUrl, type SocialPlatform } from "@/lib/socialEmbed";

interface TripPreview { public_slug: string; trip_name: string; cover_image_url: string | null }
interface VideoPreview {
  id: string; platform: SocialPlatform; video_url: string;
  embed_url: string | null; thumbnail_url: string | null; caption: string | null;
}
interface ListPreview { slug: string; title: string; cover_image_url: string | null }
interface GearPreview { slug: string; product_name: string; hero_image_url: string | null; rating: number | null }

const CardShell = ({
  to, onClick, cover, badge, cardTitle, title, subtitle, seeAllTo, seeAllLabel, icon: Icon,
}: {
  to?: string; onClick?: () => void; cover: React.ReactNode; badge?: string;
  cardTitle: string; title: string; subtitle: string; seeAllTo: string; seeAllLabel: string;
  icon: React.ElementType;
}) => {
  const Wrapper: any = to ? Link : "button";
  const wrapProps = to ? { to } : { onClick, type: "button" as const };
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
        {cardTitle}
      </p>
      <Wrapper
        {...wrapProps}
        className="group block bg-card rounded-2xl overflow-hidden border border-border shadow-soft hover:shadow-lg transition-shadow text-left w-full"
      >
        <div className="aspect-[4/3] bg-muted overflow-hidden relative">
          {cover}
          {badge && (
            <span className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{subtitle}</p>
        </div>
      </Wrapper>
      <Link
        to={seeAllTo}
        className="mt-2 inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
      >
        {seeAllLabel} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
};

const PlaceholderCover = ({ icon: Icon }: { icon: React.ElementType }) => (
  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
    <Icon className="h-10 w-10 text-primary/40" />
  </div>
);

const DiscoveryHub = () => {
  const [trip, setTrip] = useState<TripPreview | null>(null);
  const [video, setVideo] = useState<VideoPreview | null>(null);
  const [list, setList] = useState<ListPreview | null>(null);
  const [gear, setGear] = useState<GearPreview | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [tripRes, videoFeatured, listRes, gearRes] = await Promise.all([
        (supabase as any).rpc("list_public_trips", { _limit: 1, _offset: 0, _destination: null }),
        (supabase as any).from("social_videos").select("id, platform, video_url, embed_url, thumbnail_url, caption")
          .eq("is_active", true).eq("is_featured", true).limit(1).maybeSingle(),
        (supabase as any).from("featured_packing_lists").select("slug, title, cover_image_url")
          .eq("is_published", true).order("published_at", { ascending: false }).limit(1).maybeSingle(),
        (supabase as any).from("featured_gear_reviews").select("slug, product_name, hero_image_url, rating")
          .eq("is_published", true).order("published_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setTrip((tripRes.data as TripPreview[] | null)?.[0] ?? null);
      let v = videoFeatured.data as VideoPreview | null;
      if (!v) {
        // fallback to latest active
        const { data: latest } = await (supabase as any).from("social_videos")
          .select("id, platform, video_url, embed_url, thumbnail_url, caption")
          .eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
        v = latest as VideoPreview | null;
      }
      setVideo(v);
      setList(listRes.data as ListPreview | null);
      setGear(gearRes.data as GearPreview | null);
    })();
  }, []);

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">Explore real trips, gear &amp; more</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything I use on the road: full trip plans, packing lists, gear reviews, and short videos from my travels.
          </p>
        </div>

        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          <CardShell
            to="/trips"
            icon={MapPin}
            title={trip?.trip_name ?? "Real trips"}
            subtitle="Actual itineraries, real hotels, honest stay reviews."
            seeAllTo="/trips"
            seeAllLabel="View all trips"
            cover={
              trip?.cover_image_url ? (
                <img src={trip.cover_image_url} alt={trip.trip_name} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : <PlaceholderCover icon={MapPin} />
            }
          />

          <CardShell
            onClick={() => video && setVideoOpen(true)}
            to={video ? undefined : "/videos"}
            icon={Play}
            badge={video ? "Latest video" : undefined}
            title={video?.caption ?? "Watch real trips"}
            subtitle="Short videos from my travels on TikTok, Instagram, and YouTube."
            seeAllTo="/videos"
            seeAllLabel="View all videos"
            cover={
              video?.thumbnail_url ? (
                <>
                  <img src={video.thumbnail_url} alt={video.caption ?? "video"} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-white/90 p-3 shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 text-black fill-black" />
                    </div>
                  </div>
                </>
              ) : <PlaceholderCover icon={Play} />
            }
          />

          <CardShell
            to={list ? `/packing-lists/${list.slug}` : "/packing-lists"}
            icon={Package}
            title={list?.title ?? "Featured packing lists"}
            subtitle="Curated lists with Amazon-linked items for every kind of trip."
            seeAllTo="/packing-lists"
            seeAllLabel="See all packing lists"
            cover={
              list?.cover_image_url ? (
                <img src={list.cover_image_url} alt={list.title} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : <PlaceholderCover icon={Package} />
            }
          />

          <CardShell
            to={gear ? `/gear-reviews/${gear.slug}` : "/gear-reviews"}
            icon={Luggage}
            title={gear?.product_name ?? "Travel gear I trust"}
            subtitle="Single-product reviews with pros, cons, and honest ratings."
            seeAllTo="/gear-reviews"
            seeAllLabel="See all gear"
            badge={gear?.rating ? `${gear.rating.toFixed(1)} ★` : undefined}
            cover={
              gear?.hero_image_url ? (
                <img src={gear.hero_image_url} alt={gear.product_name} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : <PlaceholderCover icon={Star} />
            }
          />
        </div>
      </div>

      {video && (
        <SocialVideoModal
          open={videoOpen}
          onOpenChange={setVideoOpen}
          embedUrl={video.embed_url || deriveEmbedUrl(video.platform, video.video_url)}
          videoUrl={video.video_url}
          caption={video.caption}
          platform={video.platform}
        />
      )}
    </section>
  );
};

export default DiscoveryHub;
