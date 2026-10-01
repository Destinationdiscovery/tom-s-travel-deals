import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  addProspectActivity,
  listProspectActivity,
  updateProspectDetails,
  type ProspectActivity,
} from "@/lib/outreach.functions";
import { updateProspect, type Prospect } from "@/lib/prospector-store.functions";
import { ASSIGNEES, DO_NOT_CONTACT_REASONS, PROSPECT_STATUSES, statusLabel } from "@/lib/prospector-presets";
import { addDaysIso, followUpState, prettyDate, recipientFor } from "@/lib/outreach-templates";

const SOURCE_LABEL: Record<string, string> = {
  mailto: "Email link on website",
  page_text: "Written on website",
  contact_page: "Contact page",
  facebook_about: "Facebook page",
  instagram_bio: "Instagram",
};

const ACTIVITY_LABEL: Record<string, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
  status: "Status",
  opt_out: "Opted out",
};

type EmailState = "checking" | "none" | "error" | "found";

export function ProspectLeadCard({
  lead,
  view,
  seen,
  emailState,
  selected,
  onSelect,
  onReplace,
  onStatus,
  onFindEmail,
  onEmail,
  onError,
}: {
  lead: Prospect;
  view: "search" | "all";
  seen: boolean;
  emailState: EmailState | undefined;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onReplace: (lead: Prospect) => void;
  onStatus: (lead: Prospect, value: string) => void;
  onFindEmail: (lead: Prospect) => void;
  onEmail: (lead: Prospect) => void;
  onError: (message: string) => void;
}) {
  const updateDetails = useServerFn(updateProspectDetails);
  const saveBasic = useServerFn(updateProspect);
  const loadActivity = useServerFn(listProspectActivity);
  const logActivity = useServerFn(addProspectActivity);

  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState({
    name: lead.contact_name ?? "",
    role: lead.contact_role ?? "",
    email: lead.contact_email ?? "",
    phone: lead.contact_phone ?? "",
  });
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [reason, setReason] = useState<string>(lead.do_not_contact_reason && lead.do_not_contact_reason !== "manual" ? lead.do_not_contact_reason : DO_NOT_CONTACT_REASONS[0]);
  const [activity, setActivity] = useState<ProspectActivity[] | null>(null);
  const [entryType, setEntryType] = useState<"call" | "email" | "meeting" | "note">("call");
  const [entryText, setEntryText] = useState("");
  const [entryFollow, setEntryFollow] = useState("");
  const [busy, setBusy] = useState("");
  const [saved, setSaved] = useState("");

  const state = followUpState(lead);
  const recipient = recipientFor(lead);
  const unsubscribed = lead.do_not_contact && lead.do_not_contact_reason === "unsubscribed";

  useEffect(() => {
    if (!open || activity !== null) return;
    loadActivity({ data: { prospect_id: lead.id } })
      .then(setActivity)
      .catch(() => setActivity([]));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function flash(text: string) {
    setSaved(text);
    setTimeout(() => setSaved(""), 2500);
  }

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  const saveContact = () =>
    run("contact", async () => {
      const updated = await updateDetails({
        data: { id: lead.id, contact_name: contact.name, contact_role: contact.role, contact_email: contact.email, contact_phone: contact.phone },
      });
      onReplace(updated);
      flash("Contact saved.");
    });

  const setFollowUp = (value: string) =>
    run("follow", async () => {
      onReplace(await updateDetails({ data: { id: lead.id, follow_up_at: value || null } }));
    });

  const setAssignee = (value: string) =>
    run("assign", async () => {
      onReplace(await updateDetails({ data: { id: lead.id, assigned_to: value || null } }));
    });

  const toggleDnc = (checked: boolean) =>
    run("dnc", async () => {
      onReplace(await updateDetails({ data: { id: lead.id, do_not_contact: checked, do_not_contact_reason: checked ? reason : null } }));
      setActivity(await loadActivity({ data: { prospect_id: lead.id } }));
    });

  const saveNotes = (): Promise<void> => {
    if (notes === (lead.notes ?? "")) return Promise.resolve();
    return run("notes", async () => {
      await saveBasic({ data: { id: lead.id, notes } });
      onReplace({ ...lead, notes: notes.trim() ? notes.trim() : null });
      flash("Note saved.");
    });
  };

  const addEntry = (): Promise<void> => {
    if (!entryText.trim()) return Promise.resolve();
    return run("entry", async () => {
      const updated = await logActivity({
        data: {
          prospect_id: lead.id,
          type: entryType,
          content: entryText,
          ...(entryFollow ? { follow_up_at: addDaysIso(Number(entryFollow)) } : {}),
        },
      });
      onReplace(updated);
      setEntryText("");
      setEntryFollow("");
      setActivity(await loadActivity({ data: { prospect_id: lead.id } }));
    });
  };

  const emailBlock = () => {
    if (lead.email) {
      return (
        <div className="pr-email">
          <div className="pr-email-row">
            <a href={`mailto:${lead.email}`}>{lead.email}</a>
            <button type="button" className="linky" onClick={() => void navigator.clipboard.writeText(lead.email ?? "")}>
              Copy
            </button>
          </div>
          {lead.email_source && (
            <div className="pr-dim" style={{ marginTop: 4 }}>
              {lead.email_source_url ? (
                <a href={lead.email_source_url} target="_blank" rel="noreferrer">
                  {SOURCE_LABEL[lead.email_source] ?? lead.email_source}
                </a>
              ) : (
                (SOURCE_LABEL[lead.email_source] ?? lead.email_source)
              )}
            </div>
          )}
        </div>
      );
    }
    if (!lead.website) return <span className="pr-dim">No website to check.</span>;
    if (emailState === "checking") {
      return (
        <span className="pr-dim">
          <span className="pr-spin" />
          Checking the website.
        </span>
      );
    }
    return (
      <div className="pr-email-row">
        <span className="pr-chip">{emailState === "error" ? "Could not check" : emailState === "none" ? "Not found" : "Not checked"}</span>
        <button type="button" className="linky" onClick={() => onFindEmail(lead)}>
          Find email
        </button>
      </div>
    );
  };

  return (
    <article className="pr-lead">
      <div>
        <div className="pr-lead-name">
          <label className="pr-pick" title="Select for bulk actions">
            <input type="checkbox" checked={selected} onChange={(e) => onSelect(e.target.checked)} />
          </label>
          <b>{lead.name}</b>
          <span className={`pr-chip${lead.status === "won" || lead.status === "replied" ? " is-good" : ""}${lead.status === "new" ? " is-hot" : ""}`}>
            {statusLabel(lead.status)}
          </span>
          {lead.do_not_contact && <span className="pr-chip is-hot">Do not contact</span>}
          {state === "overdue" && <span className="pr-chip is-hot">Follow-up overdue</span>}
          {state === "today" && <span className="pr-chip is-hot">Follow up today</span>}
          {state === "upcoming" && lead.follow_up_at && <span className="pr-chip">Follow up {prettyDate(lead.follow_up_at)}</span>}
          {lead.assigned_to && <span className="pr-chip">{lead.assigned_to}</span>}
          {seen && view === "search" && <span className="pr-chip">Seen before</span>}
        </div>
        {lead.address && <div className="pr-lead-addr">{lead.address}</div>}
        <div className="pr-lead-links">
          {lead.phone && <span>{lead.phone}</span>}
          {lead.website && (
            <a href={lead.website} target="_blank" rel="noreferrer">
              Website
            </a>
          )}
          {lead.maps_url && (
            <a href={lead.maps_url} target="_blank" rel="noreferrer">
              Open in Maps
            </a>
          )}
          {lead.rating != null && (
            <span>
              {Number(lead.rating).toFixed(1)} stars ({lead.reviews ?? 0})
            </span>
          )}
          {view === "all" && lead.query && (
            <span>
              Found by: {lead.query}, {lead.city}
            </span>
          )}
        </div>
        {lead.contact_name && (
          <div className="pr-dim" style={{ marginTop: 6 }}>
            Contact: {lead.contact_name}
            {lead.contact_role ? `, ${lead.contact_role}` : ""}
          </div>
        )}
      </div>

      <div>
        <span className="pr-lead-label">Email</span>
        {emailBlock()}
        {lead.contact_email && lead.contact_email !== lead.email && (
          <div className="pr-dim" style={{ marginTop: 6 }}>
            Direct: {lead.contact_email}
          </div>
        )}
      </div>

      <div>
        <label className="field">
          <span className="pr-lead-label">Status</span>
          <select value={lead.status} onChange={(e) => onStatus(lead, e.target.value)}>
            {PROSPECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div className="adm-upload-actions" style={{ marginTop: 10 }}>
          <button type="button" className="btn btn-rec pr-mini" disabled={lead.do_not_contact || !recipient} onClick={() => onEmail(lead)} title={lead.do_not_contact ? "Marked do not contact" : !recipient ? "No email address yet" : undefined}>
            Email
          </button>
          <button type="button" className="linky" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide details" : "Details"}
          </button>
        </div>
      </div>

      {open && (
        <div className="pr-lead-notes pr-details">
          <div className="pr-grid">
            <div>
              <span className="pr-lead-label">Contact person</span>
              <div className="pr-grid2">
                <label className="field">
                  <span>Name</span>
                  <input value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} placeholder="Registrar, president, coach" />
                </label>
                <label className="field">
                  <span>Role</span>
                  <input value={contact.role} onChange={(e) => setContact((c) => ({ ...c, role: e.target.value }))} placeholder="Role" />
                </label>
                <label className="field">
                  <span>Direct email</span>
                  <input type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} placeholder="name@club.com" />
                </label>
                <label className="field">
                  <span>Direct phone</span>
                  <input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} placeholder="519 555 0100" />
                </label>
              </div>
              <div className="adm-upload-actions">
                <button type="button" className="btn btn-ghost pr-mini" disabled={busy === "contact"} onClick={() => void saveContact()}>
                  Save contact
                </button>
                {saved && <span className="pr-dim" style={{ color: "var(--signal)" }}>{saved}</span>}
              </div>
            </div>

            <div>
              <span className="pr-lead-label">Follow-up and ownership</span>
              <div className="pr-grid2">
                <label className="field">
                  <span>Follow up on</span>
                  <input type="date" value={lead.follow_up_at ?? ""} onChange={(e) => void setFollowUp(e.target.value)} />
                </label>
                <label className="field">
                  <span>Assigned to</span>
                  <select value={lead.assigned_to ?? ""} onChange={(e) => void setAssignee(e.target.value)}>
                    <option value="">Unassigned</option>
                    {ASSIGNEES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="pr-dnc">
                <label className="adm-check" style={{ margin: "4px 0 8px" }}>
                  <input type="checkbox" checked={lead.do_not_contact} disabled={unsubscribed || busy === "dnc"} onChange={(e) => void toggleDnc(e.target.checked)} />
                  <span>Do not contact</span>
                </label>
                {!lead.do_not_contact && (
                  <label className="field">
                    <span>Reason (saved when you tick the box)</span>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                      {DO_NOT_CONTACT_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {lead.do_not_contact && (
                  <div className="pr-dim">
                    {unsubscribed
                      ? `Unsubscribed${lead.do_not_contact_at ? ` on ${new Date(lead.do_not_contact_at).toLocaleDateString()}` : ""}. This address stays blocked.`
                      : `Reason: ${lead.do_not_contact_reason ?? "manual"}.`}
                  </div>
                )}
              </div>
            </div>
          </div>

          <label className="field">
            <span className="pr-lead-label">Notes</span>
            <textarea
              rows={2}
              value={notes}
              placeholder="Who you spoke to, what they said, when to follow up"
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => void saveNotes()}
            />
          </label>

          <div>
            <span className="pr-lead-label">Activity</span>
            <div className="pr-log">
              <select value={entryType} onChange={(e) => setEntryType(e.target.value as typeof entryType)} aria-label="Type">
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
              </select>
              <input value={entryText} onChange={(e) => setEntryText(e.target.value)} placeholder="What happened" onKeyDown={(e) => e.key === "Enter" && void addEntry()} />
              <select value={entryFollow} onChange={(e) => setEntryFollow(e.target.value)} aria-label="Follow up">
                <option value="">No follow-up</option>
                <option value="3">Follow up in 3 days</option>
                <option value="7">Follow up in 1 week</option>
                <option value="14">Follow up in 2 weeks</option>
                <option value="30">Follow up in 1 month</option>
              </select>
              <button type="button" className="btn btn-ghost pr-mini" disabled={busy === "entry" || !entryText.trim()} onClick={() => void addEntry()}>
                Log it
              </button>
            </div>
            {activity === null ? (
              <span className="pr-dim">
                <span className="pr-spin" />
                Loading.
              </span>
            ) : activity.length === 0 ? (
              <span className="pr-dim">Nothing logged yet.</span>
            ) : (
              <ul className="pr-timeline">
                {activity.map((a) => (
                  <li key={a.id}>
                    <span className="pr-chip">{ACTIVITY_LABEL[a.type] ?? a.type}</span>
                    <span>{a.content}</span>
                    <span className="pr-dim">
                      {a.created_by_name ? `${a.created_by_name}, ` : ""}
                      {new Date(a.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
