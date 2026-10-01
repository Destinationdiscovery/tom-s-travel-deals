import { useState } from "react";
import { MediaPlayer } from "./MediaPlayer";
import { Photo } from "./Photo";
import { artClass, thumbSrc, type ShowcaseItem } from "@/lib/site-content";

/**
 * The placeholder art already draws its own play icon. A play button is added on top only when the card
 * has a video AND either an uploaded picture or no placeholder art, so the card never shows two.
 */
export function showsPlayButton(item: Pick<ShowcaseItem, "video_url" | "thumbnail_url" | "fallback_src">): boolean {
  return !!item.video_url && (!!item.thumbnail_url || !item.fallback_src);
}

export function ShowcaseMedia({ item, className = "thumb" }: { item: ShowcaseItem; className?: string }) {
  const [open, setOpen] = useState(false);
  const image = <Photo className={className} art={artClass(item)} src={thumbSrc(item)} focalX={item.focal_x} focalY={item.focal_y}>{showsPlayButton(item) && <div className="play" />}</Photo>;
  return <>
    {item.video_url ? <button type="button" className="media-trigger" aria-label={`Play ${item.title}`} onClick={() => setOpen(true)}>{image}</button> : image}
    {open && item.video_url && <MediaPlayer url={item.video_url} title={item.title} onClose={() => setOpen(false)} />}
  </>;
}
