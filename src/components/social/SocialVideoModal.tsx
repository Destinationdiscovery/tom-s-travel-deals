import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  embedUrl: string;
  caption?: string | null;
  platform: string;
}

const SocialVideoModal = ({ open, onOpenChange, embedUrl, caption, platform }: Props) => {
  // TikTok/Instagram/YouTube all embed in 9:16-ish for reels/shorts; YT long-form is 16:9.
  const isVertical = platform !== "youtube" || embedUrl.includes("shorts");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-0">
        <div className={isVertical ? "aspect-[9/16] w-full" : "aspect-video w-full"}>
          {open && (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={caption ?? "Social video"}
            />
          )}
        </div>
        {caption && (
          <p className="text-sm text-white/90 p-3 bg-black">{caption}</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SocialVideoModal;
