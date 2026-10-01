import { useEffect, useRef, useState } from "react";
import { MediaPlayer } from "./MediaPlayer";
import { mediaUrl, type ShowcaseItem } from "@/lib/site-content";

const CSS = `
.gal-chips{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 22px}
.gal-chip{border:1px solid var(--line);border-radius:999px;padding:8px 16px;font-size:13px;color:var(--mute);cursor:pointer;background:transparent;font-family:'Inter',sans-serif}
.gal-chip[aria-pressed="true"]{border-color:var(--rec);color:var(--chalk)}
.gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
.gal-grid.is-tall{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.gal-item{margin:0}
.gal-tile{position:relative;display:block;width:100%;padding:0;border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:var(--deep);cursor:pointer;aspect-ratio:4/3;transition:transform .2s ease,border-color .2s ease}
.gal-grid.is-tall .gal-tile{aspect-ratio:3/4}
.gal-tile:hover{transform:translateY(-4px);border-color:var(--rec)}
.gal-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.gal-cap{padding:10px 2px 0;display:flex;justify-content:space-between;gap:12px;align-items:baseline}
.gal-cap b{font-family:'Anton',sans-serif;font-weight:400;font-size:16px;text-transform:uppercase;color:var(--chalk)}
.gal-cap span{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--mute);white-space:nowrap}
.gal-frame{display:grid;place-items:center;background:var(--ink);max-height:78vh}
.gal-frame img{display:block;max-width:100%;max-height:78vh;object-fit:contain}
`;

function ImageLightbox({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div className="media-dialog" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="media-dialog-panel">
        <div className="media-dialog-head">
          <h2>{title}</h2>
          <button ref={closeRef} type="button" className="media-close" aria-label="Close picture" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="gal-frame">
          <img src={src} alt={title} />
        </div>
      </div>
    </div>
  );
}

/**
 * A grid of real uploads. An item with no picture and no video is skipped, so the page never
 * shows an empty slot. Tags become filter buttons when there is more than one.
 */
export function GalleryGrid({ items, aspect, filters = true }: { items: ShowcaseItem[]; aspect: "wide" | "tall"; filters?: boolean }) {
  const [tag, setTag] = useState("All");
  const [photo, setPhoto] = useState<{ src: string; title: string } | null>(null);
  const [video, setVideo] = useState<{ url: string; title: string } | null>(null);

  const shown = items.filter((i) => i.thumbnail_url || i.video_url);
  const tags = Array.from(new Set(shown.map((i) => (i.tag ?? "").trim()).filter(Boolean)));
  const visible = tag === "All" ? shown : shown.filter((i) => (i.tag ?? "").trim() === tag);

  if (!shown.length) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {filters && tags.length > 1 && (
        <div className="gal-chips" role="group" aria-label="Filter by type">
          {["All", ...tags].map((t) => (
            <button key={t} type="button" className="gal-chip" aria-pressed={tag === t} onClick={() => setTag(t)}>
              {t}
            </button>
          ))}
        </div>
      )}
      <div className={`gal-grid${aspect === "tall" ? " is-tall" : ""}`}>
        {visible.map((item) => {
          const src = mediaUrl(item.thumbnail_url);
          const title = item.title || "Gallery";
          return (
            <figure className="gal-item" key={item.id}>
              <button
                type="button"
                className="gal-tile"
                aria-label={item.video_url ? `Play ${title}` : `Enlarge ${title}`}
                onClick={() => (item.video_url ? setVideo({ url: item.video_url, title }) : src && setPhoto({ src, title }))}
              >
                {src && <img src={src} alt="" loading="lazy" style={{ objectPosition: `${item.focal_x ?? 50}% ${item.focal_y ?? 50}%` }} />}
                {item.video_url && (
                  <div className="play" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
                )}
              </button>
              {(item.title || item.tag) && (
                <figcaption className="gal-cap">
                  <b>{item.title}</b>
                  {item.tag && <span>{item.tag}</span>}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
      {photo && <ImageLightbox src={photo.src} title={photo.title} onClose={() => setPhoto(null)} />}
      {video && <MediaPlayer url={video.url} title={video.title} onClose={() => setVideo(null)} />}
    </>
  );
}
