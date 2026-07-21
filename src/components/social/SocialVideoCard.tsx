import { useState } from "react";
import { Play, Instagram, Youtube, Music2 } from "lucide-react";
import SocialVideoModal from "./SocialVideoModal";
import { deriveEmbedUrl, type SocialPlatform } from "@/lib/socialEmbed";

export interface SocialVideo {
  id: string;
  platform: SocialPlatform;
  video_url: string;
  embed_url: string | null;
  profile_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
}

const platformIcon = (p: string) => {
  if (p === "instagram") return Instagram;
  if (p === "youtube") return Youtube;
  return Music2; // TikTok
};

const platformLabel = (p: string) =>
  p === "tiktok" ? "TikTok" : p === "instagram" ? "Instagram" : "YouTube";

const SocialVideoCard = ({ video }: { video: SocialVideo }) => {
  const [open, setOpen] = useState(false);
  const Icon = platformIcon(video.platform);
  const embed = video.embed_url || deriveEmbedUrl(video.platform, video.video_url);

  return (
    <>
      <div className="relative shrink-0 w-40 sm:w-48 aspect-[9/16] rounded-xl overflow-hidden border border-border bg-muted group">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 w-full h-full"
          aria-label={`Play ${platformLabel(video.platform)} video`}
        >
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.caption ?? `${platformLabel(video.platform)} video`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Icon className="h-10 w-10 text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/90 p-3 shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 text-black fill-black" />
            </div>
          </div>
          {video.caption && (
            <p className="absolute bottom-2 left-2 right-2 text-xs text-white line-clamp-2 font-medium drop-shadow">
              {video.caption}
            </p>
          )}
        </button>
        {video.profile_url && (
          <a
            href={video.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 backdrop-blur-sm z-10"
            aria-label={`Open ${platformLabel(video.platform)} profile`}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <SocialVideoModal
        open={open}
        onOpenChange={setOpen}
        embedUrl={embed}
        caption={video.caption}
        platform={video.platform}
      />
    </>
  );
};

export default SocialVideoCard;
