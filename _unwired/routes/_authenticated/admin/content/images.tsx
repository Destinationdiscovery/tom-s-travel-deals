import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { saveSiteImage } from "@/lib/admin-content.functions";
import { useAdminContent } from "@/lib/use-admin-content";
import { ImageUploader } from "@/components/ImageUploader";
import { AdminSlotStyles } from "@/components/AdminSlotStyles";
import { Photo } from "@/components/Photo";
import { SaveNote, type SaveNoteState } from "@/components/SaveNote";
import { IMAGE_SLOTS, slotFallback } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/content/images")({
  component: ImagesScreen,
});

type ImageRow = { image_url: string | null; alt_text: string; opacity_percent: number; focal_x: number; focal_y: number };
type SlotDef = (typeof IMAGE_SLOTS)[number];

const DEFAULT_ROW: ImageRow = { image_url: null, alt_text: "", opacity_percent: 60, focal_x: 50, focal_y: 50 };

/** Draws the slot the way the public page shows it, using the same classes the public page uses. */
function SlotMock({ def, src, row, uploaded }: { def: SlotDef; src: string | null; row: ImageRow; uploaded: boolean }) {
  const picture = src ?? "/art/0202d222.svg";
  const focal = { objectPosition: `${row.focal_x}% ${row.focal_y}%` };

  if (def.shape === "banner") {
    const isHome = def.slot === "home_hero";
    return (
      <div className={`adm-mock adm-mock-banner${isHome ? " is-center" : ""}`}>
        <div className="hero-bg">
          <img src={picture} alt="" style={isHome ? { ...focal, opacity: row.opacity_percent / 100 } : focal} />
          <div className="lines" />
          <div className="veil" />
          <div className="grain" />
        </div>
        <div className="adm-mock-copy">
          {!isHome && <span className="crumb">&larr; Back to home</span>}
          <h4>{def.label}</h4>
        </div>
      </div>
    );
  }

  if (def.shape === "service") {
    return (
      <div className="adm-mock adm-mock-svc">
        <div className="svc-card adm-static">
          <Photo className="svc-media" art={def.art} src={picture} focalX={row.focal_x} focalY={row.focal_y}>
            {def.slot === "home_highlight_reels" && uploaded && (
              <div className="play" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
            )}
          </Photo>
          <div className="svc-body">
            <h3>{def.label}</h3>
            <div className="go">{def.cta}</div>
          </div>
        </div>
      </div>
    );
  }

  if (def.shape === "band") {
    return (
      <div className="adm-mock adm-mock-band band">
        <div className="photo" style={{ position: "absolute", inset: 0, opacity: 0.24 }}>
          <img src={picture} alt="" style={focal} />
        </div>
        <div className="grain" />
        <div className="wrap" style={{ position: "relative", zIndex: 5 }}>
          <h2>{def.label}</h2>
          <p>Get it cut into something a coach will actually watch.</p>
          <span className="btn">
            <span className="dot" /> Start a reel
          </span>
        </div>
      </div>
    );
  }

  if (def.shape === "feature") {
    return (
      <div className="adm-mock" style={{ maxWidth: 300 }}>
        <Photo
          art={def.art}
          src={picture}
          focalX={row.focal_x}
          focalY={row.focal_y}
          style={{ aspectRatio: "3 / 4", width: "100%", borderRadius: "var(--radius)", border: "1px solid var(--line)" }}
        />
      </div>
    );
  }

  return (
    <div className="adm-mock adm-mock-strip">
      <Photo
        art={def.art}
        src={picture}
        focalX={row.focal_x}
        focalY={row.focal_y}
        style={{ height: 150, borderRadius: "var(--radius) var(--radius) 0 0", border: "1px solid var(--line)", borderBottom: 0 }}
      />
      <div className="map" style={{ borderRadius: "0 0 var(--radius) var(--radius)", minHeight: 84 }}>
        <div className="pin" style={{ top: "28%", left: "18%" }}>
          <i /> Brantford
        </div>
        <div className="pin" style={{ top: "52%", left: "52%" }}>
          <i /> Hamilton
        </div>
        <div className="pin" style={{ top: "22%", left: "74%" }}>
          <i /> Mississauga
        </div>
      </div>
    </div>
  );
}

function ImagesScreen() {
  const { data, isLoading } = useAdminContent();
  const qc = useQueryClient();
  const save = useServerFn(saveSiteImage);

  const [rows, setRows] = useState<Record<string, ImageRow>>({});
  const [note, setNote] = useState<SaveNoteState>(null);

  useEffect(() => {
    if (!data) return;
    const next: Record<string, ImageRow> = {};
    for (const s of IMAGE_SLOTS) {
      const row = data.images.find((i: any) => i.slot === s.slot);
      next[s.slot] = {
        image_url: row?.image_url ?? null,
        alt_text: row?.alt_text ?? "",
        opacity_percent: row?.opacity_percent ?? 60,
        focal_x: row?.focal_x ?? 50,
        focal_y: row?.focal_y ?? 50,
      };
    }
    setRows(next);
  }, [data]);

  function patchRow(slot: string, patch: Partial<ImageRow>) {
    setRows((previous) => ({ ...previous, [slot]: { ...(previous[slot] ?? DEFAULT_ROW), ...patch } }));
  }

  async function saveSlot(slot: string) {
    setNote(null);
    try {
      const row = rows[slot];
      if (!row) return;
      await save({ data: { slot, ...row } });
      setNote({ id: slot, ok: true, text: "Saved." });
      await qc.invalidateQueries({ queryKey: ["admin", "content"] });
    } catch (e) {
      setNote({ id: slot, ok: false, text: e instanceof Error ? e.message : "Could not save." });
    }
  }

  if (isLoading) return <p className="adm-empty">Loading.</p>;

  return (
    <>
      <AdminSlotStyles />
      <div className="adm-detail-head">
        <h2>Page images</h2>
      </div>
      <p className="adm-hint">
        Each box below is one picture spot on the site, in the same order as the site, and it is drawn the way visitors
        see it. Leave a spot empty and the page keeps its placeholder art.
      </p>

      {IMAGE_SLOTS.map((s, index) => {
        const prev = index > 0 ? IMAGE_SLOTS[index - 1] : undefined;
        const startsPage = !prev || prev.pageName !== s.pageName;
        const row = rows[s.slot] ?? DEFAULT_ROW;
        return (
          <Fragment key={s.slot}>
            {startsPage && <h3 className={`adm-group-title${index === 0 ? " is-first" : ""}`}>{s.pageName}</h3>}
            <section className="adm-card">
              <div className="adm-slot-head">
                <div>
                  <span className="adm-slot-kicker">
                    {s.pageName}: {s.where}
                  </span>
                  <h4 className="adm-slot-title">{s.label}</h4>
                </div>
                <a className="linky" href={s.page} target="_blank" rel="noreferrer">
                  View page
                </a>
              </div>
              <p className="adm-slot-note">{s.note}</p>
              <ImageUploader
                label="Picture"
                value={row.image_url}
                onChange={(v) => patchRow(s.slot, { image_url: v })}
                focalX={row.focal_x}
                focalY={row.focal_y}
                onFocalChange={(x, y) => patchRow(s.slot, { focal_x: x, focal_y: y })}
                fallbackSrc={slotFallback(s.slot)}
                renderPreview={({ src, uploaded }) => (
                  <>
                    <span className="adm-mock-cap">How this spot looks on the site</span>
                    <SlotMock def={s} src={src} row={row} uploaded={uploaded} />
                  </>
                )}
              />
              {s.slot === "home_hero" && (
                <label className="field adm-range">
                  <span>
                    Image visibility <b>{row.opacity_percent}%</b>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={row.opacity_percent}
                    onChange={(event) => patchRow(s.slot, { opacity_percent: Number(event.target.value) })}
                  />
                  <small>Slide right for a stronger image, or left for more transparency.</small>
                </label>
              )}
              <label className="field">
                <span>Describe the image for screen readers</span>
                <input className="inp" value={row.alt_text} onChange={(event) => patchRow(s.slot, { alt_text: event.target.value })} />
              </label>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <button className="btn btn-rec" type="button" onClick={() => void saveSlot(s.slot)}>
                  Save
                </button>
                <SaveNote note={note} id={s.slot} />
              </div>
            </section>
          </Fragment>
        );
      })}
    </>
  );
}
