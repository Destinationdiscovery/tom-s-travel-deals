import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { buildProspectUnsubscribeLink } from "@/lib/prospect-unsubscribe.functions";
import { addProspectActivity, type OutreachSettings, type OutreachTemplate } from "@/lib/outreach.functions";
import type { Prospect } from "@/lib/prospector-store.functions";
import {
  addDaysIso,
  buildGmailCompose,
  buildMailto,
  emailFooter,
  fillTemplate,
  leadVars,
  publicSiteBase,
  recipientFor,
} from "@/lib/outreach-templates";

function pickTemplate(lead: Prospect, templates: OutreachTemplate[]): OutreachTemplate | undefined {
  if (lead.last_contacted_at) {
    const followUp = templates.find((t) => t.audience === "follow_up");
    if (followUp) return followUp;
  }
  return templates.find((t) => t.audience === "club") ?? templates[0];
}

export function EmailDraftModal({
  lead,
  settings,
  templates,
  onClose,
  onLogged,
}: {
  lead: Prospect;
  settings: OutreachSettings;
  templates: OutreachTemplate[];
  onClose: () => void;
  onLogged: (updated: Prospect) => void;
}) {
  const buildLink = useServerFn(buildProspectUnsubscribeLink);
  const logActivity = useServerFn(addProspectActivity);

  const to = recipientFor(lead);
  const base = typeof window === "undefined" ? settings.site_url : publicSiteBase(settings, window.location.origin);

  const initial = useMemo(() => pickTemplate(lead, templates), [lead.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [templateId, setTemplateId] = useState(initial?.id ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState<{ url: string | null; error: string | null }>({ url: null, error: null });
  const [opened, setOpened] = useState(false);
  const [logging, setLogging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Fill the subject and body whenever the template changes.
  useEffect(() => {
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;
    const vars = leadVars(lead, settings);
    setSubject(fillTemplate(t.subject, vars));
    setBody(fillTemplate(t.body, vars));
  }, [templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Make the signed opt-out link for this lead and address.
  useEffect(() => {
    let cancelled = false;
    if (!to || !base) return;
    buildLink({ data: { prospectId: lead.id, email: to, base } })
      .then((r) => !cancelled && setLink({ url: r.url, error: null }))
      .catch((e) => !cancelled && setLink({ url: null, error: e instanceof Error ? e.message : "Could not make the opt-out link." }));
    return () => {
      cancelled = true;
    };
  }, [lead.id, to, base]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const blockers: string[] = [];
  if (lead.do_not_contact) blockers.push("This lead is marked do not contact, so no email can be drafted.");
  if (!to) blockers.push("Add an email address for this lead first (in Contact details, or use Find email).");
  if (!settings.mailing_address.trim()) blockers.push("Add your mailing address under Email settings first. It goes at the bottom of every email.");
  if (!base) blockers.push("Add your public website address under Email settings first. The opt-out link needs it.");
  if (link.error) blockers.push(link.error);
  if (!templates.length) blockers.push("There are no templates yet. Add one under Email settings.");

  const ready = blockers.length === 0 && !!link.url && !!to;
  const footer = link.url ? emailFooter(settings, link.url) : "";
  const fullBody = `${body.trimEnd()}\n\n${footer}`;

  function markOpened() {
    setOpened(true);
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${fullBody}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      markOpened();
    } catch {
      setError("Could not copy. Select the text and copy it by hand.");
    }
  }

  async function logSent() {
    setLogging(true);
    setError("");
    try {
      const updated = await logActivity({
        data: { prospect_id: lead.id, type: "email", content: `Emailed: ${subject}`, follow_up_at: addDaysIso(7) },
      });
      onLogged(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log it.");
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className="media-dialog" role="dialog" aria-modal="true" aria-label={`Email ${lead.name}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="media-dialog-panel" style={{ width: "min(760px,100%)", maxHeight: "92vh", overflowY: "auto" }}>
        <div className="media-dialog-head">
          <h2>Email {lead.name}</h2>
          <button type="button" className="media-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div style={{ padding: 20 }}>
          {blockers.length > 0 && (
            <div className="pr-note is-warn" style={{ display: "block" }}>
              {blockers.map((b) => (
                <div key={b}>{b}</div>
              ))}
            </div>
          )}

          <div className="adm-inline">
            <label className="field">
              <span>Template</span>
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>To</span>
              <input value={to ?? ""} readOnly />
            </label>
          </div>
          <label className="field">
            <span>Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="field">
            <span>Message (edit it however you like)</span>
            <textarea rows={11} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <div className="field">
            <span>Added automatically at the bottom of every email</span>
            <pre className="pr-footer-preview">{footer || "The footer appears once your email settings are complete."}</pre>
            <small className="adm-hint">
              It has your mailing address and a one-click opt-out link. When someone uses the link, this lead is marked
              do not contact and the address is blocked for good.
            </small>
          </div>

          {error && <p className="adm-err">{error}</p>}

          {!opened ? (
            <div className="adm-upload-actions">
              <a
                className="btn btn-rec"
                style={ready ? undefined : { pointerEvents: "none", opacity: 0.45 }}
                href={ready && to ? buildMailto(to, subject, fullBody) : undefined}
                onClick={markOpened}
              >
                Open in my email app
              </a>
              <a
                className="btn btn-ghost"
                style={ready ? undefined : { pointerEvents: "none", opacity: 0.45 }}
                href={ready && to ? buildGmailCompose(to, subject, fullBody) : undefined}
                target="_blank"
                rel="noreferrer"
                onClick={markOpened}
              >
                Open in Gmail
              </a>
              <button type="button" className="btn btn-ghost" disabled={!ready} onClick={() => void copyAll()}>
                {copied ? "Copied" : "Copy email"}
              </button>
            </div>
          ) : (
            <div className="pr-note is-ok" style={{ display: "block" }}>
              <div style={{ marginBottom: 10 }}>
                <b>Did you send it?</b> Log it and the lead moves to Contacted with a follow-up set for one week from today.
              </div>
              <div className="adm-upload-actions">
                <button type="button" className="btn btn-rec" disabled={logging} onClick={() => void logSent()}>
                  {logging ? "Logging" : "Yes, I sent it"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setOpened(false)}>
                  Not yet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
