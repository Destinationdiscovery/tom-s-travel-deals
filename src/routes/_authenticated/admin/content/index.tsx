import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { deleteFounder, reorderFounders, saveFounder } from "@/lib/admin-content.functions";
import { useAdminContent } from "@/lib/use-admin-content";
import { ImageUploader } from "@/components/ImageUploader";
import { AdminSlotStyles } from "@/components/AdminSlotStyles";
import { Photo } from "@/components/Photo";
import { SaveNote, type SaveNoteState } from "@/components/SaveNote";

export const Route = createFileRoute("/_authenticated/admin/content/")({
  component: FoundersScreen,
});

interface Draft {
  id?: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  sort_order: number;
  published: boolean;
  focal_x: number;
  focal_y: number;
}

const BLANK: Draft = { name: "", role: "", bio: "", photo_url: null, sort_order: 99, published: true, focal_x: 50, focal_y: 50 };

/** The placeholder portraits the home page uses until a photo is uploaded, alternating by position. */
function portraitFallback(i: number): string {
  return i % 2 === 0 ? "/art/1bc6acfa.svg" : "/art/d3919fde.svg";
}

/** Draws the person the way the home page "Behind the camera" section does. */
function PortraitMock({ d, i, src }: { d: Draft; i: number; src: string | null }) {
  return (
    <div className="adm-mock" style={{ maxWidth: 300 }}>
      <Photo
        className="portrait"
        art={i % 2 === 0 ? "art-box" : "art-ice"}
        src={src ?? portraitFallback(i)}
        focalX={d.focal_x}
        focalY={d.focal_y}
      >
        <span className="jersey" style={{ right: -40, bottom: -110 }}>
          {String(i + 1).padStart(2, "0")}
        </span>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 6, padding: 22 }}>
          <h4
            style={{
              fontFamily: "'Anton',sans-serif",
              fontWeight: 400,
              fontSize: 28,
              textTransform: "uppercase",
              margin: 0,
              color: "var(--chalk)",
            }}
          >
            {d.name || "Name"}
          </h4>
          <span className="tc" style={{ display: "block", marginTop: 6 }}>
            {d.role || "Role"}
          </span>
        </div>
      </Photo>
    </div>
  );
}

function FoundersScreen() {
  const { data, isLoading } = useAdminContent();
  const qc = useQueryClient();
  const save = useServerFn(saveFounder);
  const remove = useServerFn(deleteFounder);
  const reorder = useServerFn(reorderFounders);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState<SaveNoteState>(null);

  useEffect(() => {
    if (data) setDrafts(data.founders.map((f: any) => ({ ...f })));
  }, [data]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patch(i: number, p: Partial<Draft>) {
    setDirty(true);
    setDrafts((prev) => prev.map((d, j) => (j === i ? { ...d, ...p } : d)));
  }

  async function saveOne(i: number) {
    setMsg("");
    setNote(null);
    const d = drafts[i];
    if (!d) return;
    const noteId = d.id ?? `new-${i}`;
    try {
      await save({ data: { ...d, sort_order: i + 1 } });
      setDirty(false);
      setNote({ id: noteId, ok: true, text: `Saved ${d.name || "the person"}.` });
      await qc.invalidateQueries({ queryKey: ["admin", "content"] });
    } catch (e) {
      setNote({ id: noteId, ok: false, text: e instanceof Error ? e.message : "Could not save." });
    }
  }

  async function move(i: number, dir: -1 | 1) {
    const next = [...drafts];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    const current = next[i];
    const target = next[j];
    if (!current || !target) return;
    [next[i], next[j]] = [target, current];
    setDrafts(next);
    await reorder({ data: { ids: next.flatMap((d) => d.id ? [d.id] : []) } });
    await qc.invalidateQueries({ queryKey: ["admin", "content"] });
  }

  async function del(i: number) {
    const d = drafts[i];
    if (!d) return;
    if (!d.id) {
      setDrafts((prev) => prev.filter((_, j) => j !== i));
      return;
    }
    if (!window.confirm(`Remove ${d.name} from the site? This cannot be undone.`)) return;
    await remove({ data: { id: d.id } });
    await qc.invalidateQueries({ queryKey: ["admin", "content"] });
    setMsg("Removed.");
  }

  if (isLoading) return <p className="adm-empty">Loading.</p>;

  return (
    <>
      <AdminSlotStyles />
      <div className="adm-detail-head">
        <h2>Behind the camera</h2>
        <a className="linky" href="/#about" target="_blank" rel="noreferrer">
          View on the site
        </a>
      </div>
      <p className="adm-hint">
        Each person below is one portrait in the Behind the camera section of the home page, in the same order. The
        number on the photo is their position.
      </p>
      {msg && <p className="adm-msg">{msg}</p>}

      {drafts.map((d, i) => (
        <section className="adm-card" key={d.id ?? `new-${i}`}>
          <div className="adm-slot-head">
            <div>
              <span className="adm-slot-kicker">Home page: Behind the camera section, person {i + 1}</span>
              <h4 className="adm-slot-title">{d.name || "New person"}</h4>
            </div>
          </div>
          <div className="adm-inline">
            <label className="field">
              <span>Name (shown on the photo)</span>
              <input className="inp" value={d.name} onChange={(e) => patch(i, { name: e.target.value })} />
            </label>
            <label className="field">
              <span>Role (shown under the name)</span>
              <input className="inp" value={d.role} onChange={(e) => patch(i, { role: e.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Bio (shown in a column under the photos)</span>
            <textarea className="inp" rows={5} value={d.bio} onChange={(e) => patch(i, { bio: e.target.value })} />
            <small className="adm-hint">Leave it blank and nothing shows under the photo.</small>
          </label>
          <ImageUploader
            label="Portrait photo"
            value={d.photo_url}
            onChange={(v) => patch(i, { photo_url: v })}
            focalX={d.focal_x}
            focalY={d.focal_y}
            onFocalChange={(x, y) => patch(i, { focal_x: x, focal_y: y })}
            fallbackSrc={portraitFallback(i)}
            renderPreview={({ src }) => (
              <>
                <span className="adm-mock-cap">How this person looks on the site</span>
                <PortraitMock d={d} i={i} src={src} />
              </>
            )}
          />
          <label className="adm-check">
            <input type="checkbox" checked={d.published} onChange={(e) => patch(i, { published: e.target.checked })} />
            <span>Show on the site</span>
          </label>
          <div className="adm-inline">
            <span style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn btn-rec" type="button" onClick={() => void saveOne(i)}>
                Save
              </button>
              <SaveNote note={note} id={d.id ?? `new-${i}`} />
            </span>
            <button className="linky" type="button" onClick={() => void move(i, -1)}>
              Move up
            </button>
            <button className="linky" type="button" onClick={() => void move(i, 1)}>
              Move down
            </button>
            <button className="linky" type="button" onClick={() => void del(i)}>
              Remove
            </button>
          </div>
        </section>
      ))}

      <button
        className="btn btn-ghost"
        type="button"
        onClick={() => setDrafts((p) => [...p, { ...BLANK, sort_order: p.length + 1 }])}
      >
        Add a person
      </button>
    </>
  );
}
