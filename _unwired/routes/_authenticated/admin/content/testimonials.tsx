import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { deleteTestimonial, saveTestimonial } from "@/lib/admin-content.functions";
import { useAdminContent } from "@/lib/use-admin-content";
import { SaveNote, type SaveNoteState } from "@/components/SaveNote";

export const Route = createFileRoute("/_authenticated/admin/content/testimonials")({
  component: TestimonialsScreen,
});

interface Row {
  id?: string;
  author_name: string;
  author_role: string;
  quote: string;
  sport: string | null;
  sort_order: number;
  published: boolean;
}

function TestimonialsScreen() {
  const { data, isLoading } = useAdminContent();
  const qc = useQueryClient();
  const save = useServerFn(saveTestimonial);
  const remove = useServerFn(deleteTestimonial);

  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState<SaveNoteState>(null);

  useEffect(() => {
    if (data) setRows(data.testimonials.map((t: any) => ({ ...t })));
  }, [data]);

  function patch(i: number, p: Partial<Row>) {
    setRows((prev) => prev.map((d, j) => (j === i ? { ...d, ...p } : d)));
  }

  async function saveOne(i: number) {
    setMsg("");
    setNote(null);
    const noteId = rows[i]?.id ?? `new-${i}`;
    try {
      await save({ data: { ...rows[i]!, sort_order: i + 1 } });
      setNote({ id: noteId, ok: true, text: "Saved." });
      await qc.invalidateQueries({ queryKey: ["admin", "content"] });
    } catch (e) {
      setNote({ id: noteId, ok: false, text: e instanceof Error ? e.message : "Could not save." });
    }
  }

  async function del(i: number) {
    const r = rows[i]!;
    if (!r.id) {
      setRows((prev) => prev.filter((_, j) => j !== i));
      return;
    }
    if (!window.confirm(`Delete the review from ${r.author_name}? This cannot be undone.`)) return;
    await remove({ data: { id: r.id } });
    await qc.invalidateQueries({ queryKey: ["admin", "content"] });
    setMsg("Deleted.");
  }

  if (isLoading) return <p className="adm-empty">Loading.</p>;

  return (
    <>
      <div className="adm-detail-head">
        <h2>Reviews</h2>
        <a className="linky" href="/#reviews" target="_blank" rel="noreferrer">
          View on the site
        </a>
      </div>

      <p className="adm-warn">
        Only add reviews a real client actually gave you, with their permission. Nothing invented goes on this site.
      </p>
      <p className="adm-hint">The reviews section only appears on the home page once a published review exists.</p>

      {msg && <p className="adm-msg">{msg}</p>}

      {rows.map((r, i) => (
        <section className="adm-card" key={r.id ?? `new-${i}`}>
          <div className="adm-inline">
            <label className="field">
              <span>Who said it</span>
              <input
                className="inp"
                value={r.author_name}
                onChange={(e) => patch(i, { author_name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Their role, for example Parent or Coach</span>
              <input
                className="inp"
                value={r.author_role ?? ""}
                onChange={(e) => patch(i, { author_role: e.target.value })}
              />
            </label>
          </div>
          <label className="field">
            <span>What they said</span>
            <textarea className="inp" rows={4} value={r.quote} onChange={(e) => patch(i, { quote: e.target.value })} />
          </label>
          <label className="field">
            <span>Sport</span>
            <input
              className="inp"
              value={r.sport ?? ""}
              onChange={(e) => patch(i, { sport: e.target.value || null })}
            />
          </label>
          <label className="adm-check">
            <input type="checkbox" checked={r.published} onChange={(e) => patch(i, { published: e.target.checked })} />
            <span>Show on the site</span>
          </label>
          <div className="adm-inline">
            <span style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn btn-rec" type="button" onClick={() => void saveOne(i)}>
                Save
              </button>
              <SaveNote note={note} id={r.id ?? `new-${i}`} />
            </span>
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
          setRows((p) => [
            ...p,
            { author_name: "", author_role: "", quote: "", sport: null, sort_order: p.length + 1, published: false },
          ])
        }
      >
        Add a review
      </button>
    </>
  );
}
