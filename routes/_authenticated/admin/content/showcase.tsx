import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { deleteShowcaseItem, reorderShowcase, saveShowcaseItem } from "@/lib/admin-content.functions";
import { useAdminContent } from "@/lib/use-admin-content";
import { ImageUploader } from "@/components/ImageUploader";
import { VideoUploader } from "@/components/VideoUploader";
import { AdminSlotStyles } from "@/components/AdminSlotStyles";
import { Photo } from "@/components/Photo";
import { SaveNote, type SaveNoteState } from "@/components/SaveNote";
import { showsPlayButton } from "@/components/ShowcaseMedia";
import { SHOWCASE_SECTIONS, mediaUrl, type ShowcaseItem } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/content/showcase")({
  component: ShowcaseScreen,
});

interface Item {
  id?: string;
  section: string;
  title: string;
  tag: string;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  sport: string | null;
  sort_order: number;
  published: boolean;
  focal_x: number;
  focal_y: number;
}

/** Fields the database row carries but the edit form does not change. */
type ItemExtras = { fallback_art?: string | null; fallback_src?: string | null; meta?: ShowcaseItem["meta"] };

const GENERIC_ART = "/art/0202d222.svg";

function placeholderFor(it: Item): string {
  return (it as Item & ItemExtras).fallback_src ?? GENERIC_ART;
}

/** Draws one example the way the public page draws it, using the same classes. */
function CardMock({ it, shape }: { it: Item; shape: string }) {
  const extra = it as Item & ItemExtras;
  const art = extra.fallback_art ?? "art-box";
  const src = mediaUrl(it.thumbnail_url) ?? placeholderFor(it);
  const focal = { objectPosition: `${it.focal_x ?? 50}% ${it.focal_y ?? 50}%` };
  const title = it.title || "Untitled";
  const play = showsPlayButton({ video_url: it.video_url, thumbnail_url: it.thumbnail_url, fallback_src: extra.fallback_src ?? null }) ? (
    <div className="play" />
  ) : null;

  if (shape === "tile" || shape === "tile-tall") {
    const tall = shape === "tile-tall";
    const uploaded = mediaUrl(it.thumbnail_url);
    return (
      <div className="adm-mock" style={{ maxWidth: tall ? 240 : 360 }}>
        <div
          style={{
            position: "relative",
            aspectRatio: tall ? "3 / 4" : "4 / 3",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            background: "var(--deep)",
            display: "grid",
            placeItems: "center",
            padding: 14,
            textAlign: "center",
          }}
        >
          {uploaded ? (
            <img src={uploaded} alt="" style={{ ...focal, position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span className="adm-hint" style={{ margin: 0 }}>
              No picture yet. It will not show on the site until you add one.
            </span>
          )}
          {it.video_url && (
            <div className="play" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          )}
        </div>
        {(it.title || it.tag) && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingTop: 10 }}>
            <b style={{ fontFamily: "'Anton',sans-serif", fontWeight: 400, fontSize: 16, textTransform: "uppercase", color: "var(--chalk)" }}>{it.title}</b>
            <span className="tc">{it.tag}</span>
          </div>
        )}
      </div>
    );
  }

  if (shape === "service") {
    return (
      <div className="adm-mock" style={{ maxWidth: 440 }}>
        <div className="pcard adm-static">
          <Photo className="pmedia" art={art} src={src} focalX={it.focal_x} focalY={it.focal_y} />
          <div className="pbody">
            <span className="ptag">{it.tag}</span>
            <h3>{title}</h3>
            <p>{it.description}</p>
          </div>
        </div>
      </div>
    );
  }

  if (shape === "reel-wide") {
    return (
      <div className="adm-mock" style={{ maxWidth: 480 }}>
        <div className="reels two-up adm-reel-wrap adm-static">
          <div className="reel">
            <Photo className="thumb" art={art} src={src} focalX={it.focal_x} focalY={it.focal_y}>
              {play}
            </Photo>
            <div className="meta">
              <div style={{ width: "100%" }}>
                <div className="row">
                  <b>{title}</b>
                  {it.tag && <span className="tag2">{it.tag}</span>}
                </div>
                <p>{it.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-mock" style={{ maxWidth: 380 }}>
      <div className="reels adm-reel-wrap adm-static">
        <div className="reel">
          <Photo className="thumb" art={art} src={src} focalX={it.focal_x} focalY={it.focal_y}>
            {play}
          </Photo>
          <div className="meta">
            <b>{title}</b>
            <span>{it.tag}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcaseScreen() {
  const { data, isLoading } = useAdminContent();
  const qc = useQueryClient();
  const save = useServerFn(saveShowcaseItem);
  const remove = useServerFn(deleteShowcaseItem);
  const reorder = useServerFn(reorderShowcase);

  const [section, setSection] = useState<string>(SHOWCASE_SECTIONS[0].section);
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState<SaveNoteState>(null);

  useEffect(() => {
    if (data) setItems(data.showcase.filter((s: any) => s.section === section).map((s: any) => ({ ...s })));
  }, [data, section]);

  const current = SHOWCASE_SECTIONS.find((s) => s.section === section) ?? SHOWCASE_SECTIONS[0];
  const isTile = current.shape === "tile" || current.shape === "tile-tall";

  function patch(i: number, p: Partial<Item>) {
    setItems((prev) => prev.map((d, j) => (j === i ? { ...d, ...p } : d)));
  }

  async function saveOne(i: number) {
    setMsg("");
    setNote(null);
    const it = items[i];
    if (!it) return;
    const noteId = it.id ?? `new-${i}`;
    try {
      await save({ data: { ...it, section, sort_order: i + 1 } });
      setNote({ id: noteId, ok: true, text: "Saved." });
      await qc.invalidateQueries({ queryKey: ["admin", "content"] });
    } catch (e) {
      setNote({ id: noteId, ok: false, text: e instanceof Error ? e.message : "Could not save." });
    }
  }

  async function del(i: number) {
    const it = items[i];
    if (!it) return;
    if (!it.id) {
      setItems((prev) => prev.filter((_, j) => j !== i));
      return;
    }
    if (!window.confirm(`Delete "${it.title}"? This cannot be undone.`)) return;
    await remove({ data: { id: it.id } });
    await qc.invalidateQueries({ queryKey: ["admin", "content"] });
    setMsg("Deleted.");
  }

  async function move(i: number, dir: -1 | 1) {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    const currentItem = next[i];
    const targetItem = next[j];
    if (!currentItem || !targetItem) return;
    [next[i], next[j]] = [targetItem, currentItem];
    setItems(next);
    await reorder({ data: { ids: next.flatMap((d) => d.id ? [d.id] : []) } });
    await qc.invalidateQueries({ queryKey: ["admin", "content"] });
  }

  if (isLoading) return <p className="adm-empty">Loading.</p>;

  return (
    <>
      <AdminSlotStyles />
      <div className="adm-detail-head">
        <h2>Examples</h2>
        <a className="linky" href={current.page} target="_blank" rel="noreferrer">
          View on the site
        </a>
      </div>

      <div className="adm-filters">
        <select className="inp" value={section} onChange={(e) => setSection(e.target.value)}>
          {SHOWCASE_SECTIONS.map((s) => (
            <option key={s.section} value={s.section}>
              {s.pageName}: {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="adm-where">
        <b>Shows on the site at</b>
        {current.pageName}, {current.where}, under the heading &ldquo;{current.label}&rdquo;
        <span>{current.note}</span>
      </div>

      {msg && <p className="adm-msg">{msg}</p>}

      {items.map((it, i) => (
        <section className="adm-card adm-showcase-card" key={it.id ?? `new-${i}`}>
          <div className="adm-slot-head">
            <div>
              <span className="adm-slot-kicker">
                {current.pageName}: {current.where}
              </span>
              <h4 className="adm-slot-title">
                Card {i + 1}: {it.title || "Untitled"}
              </h4>
            </div>
          </div>
          <span className="adm-mock-cap">How this card looks on the site</span>
          <CardMock it={it} shape={current.shape} />
          <div className="adm-inline" style={{ marginTop: 18 }}>
            <label className="field">
              <span>{isTile ? "Caption (optional)" : "Title"}</span>
              <input className="inp" value={it.title} onChange={(e) => patch(i, { title: e.target.value })} />
            </label>
            <label className="field">
              <span>{isTile ? "Tag (groups the filter buttons, for example Game photo, Clip, Player card)" : "Tag or length"}</span>
              <input className="inp" value={it.tag ?? ""} onChange={(e) => patch(i, { tag: e.target.value })} />
            </label>
          </div>
          {!isTile && (
            <label className="field">
              <span>Description</span>
              <textarea
                className="inp"
                rows={3}
                value={it.description ?? ""}
                onChange={(e) => patch(i, { description: e.target.value })}
              />
            </label>
          )}
          <div className="adm-inline">
            <label className="field">
              <span>Video link (YouTube, Vimeo or a direct file link)</span>
              <input
                className="inp"
                value={it.video_url ?? ""}
                onChange={(e) => patch(i, { video_url: e.target.value || null })}
                placeholder="https://"
              />
            </label>
            {!isTile && (
              <label className="field">
                <span>Sport</span>
                <input
                  className="inp"
                  value={it.sport ?? ""}
                  onChange={(e) => patch(i, { sport: e.target.value || null })}
                />
              </label>
            )}
          </div>
          <VideoUploader
            label="Or upload a video file instead"
            hint="Visitors click the card and the video opens in a pop-up. Use either the link above or a file, not both: whichever you set last is used. MP4, WebM or MOV, up to 250MB."
            value={it.video_url && !it.video_url.startsWith("http") ? it.video_url : null}
            onChange={(v) => patch(i, { video_url: v })}
          />
          <ImageUploader
            label={isTile ? "Picture" : "Card picture (top of the card)"}
            value={it.thumbnail_url}
            onChange={(v) => patch(i, { thumbnail_url: v })}
            focalX={it.focal_x ?? 50}
            focalY={it.focal_y ?? 50}
            onFocalChange={(x, y) => patch(i, { focal_x: x, focal_y: y })}
            previewClassName={current.shape === "tile-tall" ? "is-tall" : "is-wide"}
            fallbackSrc={isTile ? null : placeholderFor(it)}
          />
          <label className="adm-check">
            <input type="checkbox" checked={it.published} onChange={(e) => patch(i, { published: e.target.checked })} />
            <span>Show on the site</span>
          </label>
          <div className="adm-inline">
            <span style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn btn-rec" type="button" onClick={() => void saveOne(i)}>
                Save
              </button>
              <SaveNote note={note} id={it.id ?? `new-${i}`} />
            </span>
            <button className="linky" type="button" onClick={() => void move(i, -1)}>
              Move up
            </button>
            <button className="linky" type="button" onClick={() => void move(i, 1)}>
              Move down
            </button>
            <button className="linky" type="button" onClick={() => void del(i)}>
              Delete
            </button>
          </div>
        </section>
      ))}

      <button
        className="btn btn-ghost"
        type="button"
        onClick={() =>
          setItems((p) => [
            ...p,
            {
              section,
              title: "",
              tag: "",
              description: "",
              video_url: null,
              thumbnail_url: null,
              sport: null,
              sort_order: p.length + 1,
              published: true,
              focal_x: 50,
              focal_y: 50,
            },
          ])
        }
      >
        {isTile ? "Add to the gallery" : "Add an example"}
      </button>
    </>
  );
}
