import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  embedUrl: string;
  videoUrl?: string;
  caption?: string | null;
  platform: string;
}

const SocialVideoModal = ({ open, onOpenChange, embedUrl, videoUrl, caption, platform }: Props) => {
  const [resolved, setResolved] = useState<string>(embedUrl);

  useEffect(() => {
    setResolved(embedUrl);
    if (!open || platform !== "tiktok") return;
    // Try to resolve numeric TikTok video id via oEmbed so short links (vm.tiktok.com/XXX) work.
    const src = videoUrl || embedUrl;
    const hasNumericId = /\/(embed|player)\/(v\d+\/)?(\d{6,})/.test(embedUrl);
    if (hasNumericId) return;
    (async () => {
      try {
        const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(src)}`);
        if (!r.ok) return;
        const j = await r.json();
        const id: string | undefined = j.embed_product_id || (j.html && (j.html.match(/data-video-id="(\d+)"/)?.[1]));
        if (id) setResolved(`https://www.tiktok.com/player/v1/${id}?music_info=1&description=1`);
      } catch {
        /* ignore */
      }
    })();
  }, [open, platform, embedUrl, videoUrl]);

  const isVertical = platform !== "youtube" || resolved.includes("shorts");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-0">
        <div className={isVertical ? "aspect-[9/16] w-full" : "aspect-video w-full"}>
          {open && (
            <iframe
              src={resolved}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={caption ?? "Social video"}
            />
          )}
        </div>
        {caption && <p className="text-sm text-white/90 p-3 bg-black">{caption}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default SocialVideoModal;
