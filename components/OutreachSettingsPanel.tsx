import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  deleteOutreachTemplate,
  saveOutreachSettings,
  saveOutreachTemplate,
  type OutreachSettings,
  type OutreachTemplate,
} from "@/lib/outreach.functions";
import { TEMPLATE_VARIABLES } from "@/lib/outreach-templates";
import { SaveNote, type SaveNoteState } from "@/components/SaveNote";

const AUDIENCE_LABEL: Record<OutreachTemplate["audience"], string> = {
  club: "Club",
  league: "League or association",
  follow_up: "Follow-up",
};

type Draft = { id?: string; name: string; audience: OutreachTemplate["audience"]; subject: string; body: string; sort_order: number };

export function OutreachSettingsPanel({
  settings,
  templates,
  onSettings,
  onTemplates,
}: {
  settings: OutreachSettings;
  templates: OutreachTemplate[];
  onSettings: (s: OutreachSettings) => void;
  onTemplates: (t: OutreachTemplate[]) => void;
}) {
  const saveSettings = useServerFn(saveOutreachSettings);
  const saveTemplate = useServerFn(saveOutreachTemplate);
  const removeTemplate = useServerFn(deleteOutreachTemplate);

  const [form, setForm] = useState<OutreachSettings>(settings);
  const [drafts, setDrafts] = useState<Draft[]>(templates.map((t) => ({ ...t })));
  const [note, setNote] = useState<SaveNoteState>(null);

  const incomplete = !settings.mailing_address.trim();

  async function onSaveSettings() {
    setNote(null);
    try {
      await saveSettings({ data: form });
      onSettings({ ...form, site_url: form.site_url.replace(/\/+$/, "") });
      setNote({ id: "settings", ok: true, text: "Saved." });
    } catch (e) {
      setNote({ id: "settings", ok: false, text: e instanceof Error ? e.message : "Could not save." });
    }
  }

  async function onSaveTemplate(i: number) {
    const d = drafts[i];
    if (!d) return;
    const noteId = d.id ?? `new-${i}`;
    setNote(null);
    try {
      const saved = await saveTemplate({
        data: { ...(d.id ? { id: d.id } : {}), name: d.name, audience: d.audience, subject: d.subject, body: d.body, sort_order: d.sort_order },
      });
      setDrafts((prev) => prev.map((x, j) => (j === i ? { ...saved } : x)));
      const next = d.id ? templates.map((t) => (t.id === saved.id ? saved : t)) : [...templates, saved];
      onTemplates(next);
      setNote({ id: noteId, ok: true, text: "Saved." });
    } catch (e) {
      setNote({ id: noteId, ok: false, text: e instanceof Error ? e.message : "Could not save." });
    }
  }

  async function onDeleteTemplate(i: number) {
    const d = drafts[i];
    if (!d) return;
    if (!d.id) {
      setDrafts((prev) => prev.filter((_, j) => j !== i));
      return;
    }
    if (!window.confirm(`Delete the template "${d.name}"?`)) return;
    try {
      await removeTemplate({ data: { id: d.id } });
      setDrafts((prev) => prev.filter((_, j) => j !== i));
      onTemplates(templates.filter((t) => t.id !== d.id));
    } catch (e) {
      setNote({ id: d.id, ok: false, text: e instanceof Error ? e.message : "Could not delete." });
    }
  }

  return (
    <details className="adm-card" open={incomplete}>
      <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--chalk)" }}>
        Email settings and templates {incomplete && <span className="pr-chip is-hot">Needs your mailing address</span>}
      </summary>

      <div style={{ marginTop: 18 }}>
        <h3 className="adm-sub" style={{ marginTop: 0 }}>
          Your details
        </h3>
        <p className="adm-hint">These go at the bottom of every email. A mailing address and a working opt-out link are what Canadian anti-spam rules expect on commercial email.</p>
        <div className="adm-inline">
          <label className="field">
            <span>Sender name</span>
            <input value={form.sender_name} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} />
          </label>
          <label className="field">
            <span>Signature line (optional, for example a phone number)</span>
            <input value={form.signature} onChange={(e) => setForm({ ...form, signature: e.target.value })} />
          </label>
        </div>
        <label className="field">
          <span>Mailing address</span>
          <input
            value={form.mailing_address}
            onChange={(e) => setForm({ ...form, mailing_address: e.target.value })}
            placeholder="Aventura Sports Media, street, Brantford, Ontario, postal code"
          />
        </label>
        <label className="field">
          <span>Public website address (for the opt-out link)</span>
          <input value={form.site_url} onChange={(e) => setForm({ ...form, site_url: e.target.value })} placeholder="https://your-published-site.com" />
          <small className="adm-hint">
            The address people visit, starting with https://. Leave it blank only if you always use this dashboard from your published site.
          </small>
        </label>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-rec" onClick={() => void onSaveSettings()}>
            Save details
          </button>
          <SaveNote note={note} id="settings" />
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3 className="adm-sub" style={{ marginTop: 0 }}>
          Templates
        </h3>
        <p className="adm-hint">
          You can use these placeholders in the subject and message, and they fill in for each lead:{" "}
          {TEMPLATE_VARIABLES.map((v) => (
            <code key={v.token} title={v.help} style={{ marginRight: 10 }}>
              {v.token}
            </code>
          ))}
        </p>
        {drafts.map((d, i) => (
          <section className="adm-card" key={d.id ?? `new-${i}`} style={{ background: "var(--ink)" }}>
            <div className="adm-inline">
              <label className="field">
                <span>Name</span>
                <input value={d.name} onChange={(e) => setDrafts((p) => p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              </label>
              <label className="field">
                <span>Used for</span>
                <select value={d.audience} onChange={(e) => setDrafts((p) => p.map((x, j) => (j === i ? { ...x, audience: e.target.value as Draft["audience"] } : x)))}>
                  {(Object.keys(AUDIENCE_LABEL) as Array<keyof typeof AUDIENCE_LABEL>).map((k) => (
                    <option key={k} value={k}>
                      {AUDIENCE_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Subject</span>
              <input value={d.subject} onChange={(e) => setDrafts((p) => p.map((x, j) => (j === i ? { ...x, subject: e.target.value } : x)))} />
            </label>
            <label className="field">
              <span>Message</span>
              <textarea rows={9} value={d.body} onChange={(e) => setDrafts((p) => p.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
            </label>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-rec" onClick={() => void onSaveTemplate(i)}>
                Save template
              </button>
              <button type="button" className="linky" onClick={() => void onDeleteTemplate(i)}>
                Delete
              </button>
              <SaveNote note={note} id={d.id ?? `new-${i}`} />
            </div>
          </section>
        ))}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setDrafts((p) => [...p, { name: "", audience: "club", subject: "", body: "", sort_order: p.length + 1 }])}
        >
          Add a template
        </button>
      </div>
    </details>
  );
}
