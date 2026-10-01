import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { saveSiteText } from "@/lib/admin-content.functions";
import { useAdminContent } from "@/lib/use-admin-content";
import { TEXT_DEFAULTS, TEXT_KEYS, TEXT_LABELS } from "@/lib/site-content";
import { SaveNote, type SaveNoteState } from "@/components/SaveNote";

export const Route = createFileRoute("/_authenticated/admin/content/text")({
  component: TextScreen,
});

function TextScreen() {
  const { data, isLoading } = useAdminContent();
  const qc = useQueryClient();
  const save = useServerFn(saveSiteText);

  const [values, setValues] = useState<Record<string, string>>({});
  const [note, setNote] = useState<SaveNoteState>(null);

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const k of TEXT_KEYS) next[k] = data.text[k] ?? TEXT_DEFAULTS[k] ?? "";
    setValues(next);
  }, [data]);

  async function saveAll() {
    setNote(null);
    try {
      await save({ data: { entries: TEXT_KEYS.map((k) => ({ key: k, value: values[k] ?? "" })) } });
      setNote({ id: "text", ok: true, text: "Saved." });
      await qc.invalidateQueries({ queryKey: ["admin", "content"] });
    } catch (e) {
      setNote({ id: "text", ok: false, text: e instanceof Error ? e.message : "Could not save." });
    }
  }

  if (isLoading) return <p className="adm-empty">Loading.</p>;

  return (
    <>
      <div className="adm-detail-head">
        <h2>Page wording</h2>
      </div>
      <p className="adm-hint">Clear a box and the page falls back to the original wording.</p>

      <section className="adm-card">
        {TEXT_KEYS.map((k) => (
          <label className="field" key={k}>
            <span>{TEXT_LABELS[k] ?? k}</span>
            <textarea
              className="inp"
              rows={3}
              value={values[k] ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, [k]: e.target.value }))}
            />
          </label>
        ))}
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-rec" type="button" onClick={() => void saveAll()}>
            Save all
          </button>
          <SaveNote note={note} id="text" />
        </div>
      </section>
    </>
  );
}
