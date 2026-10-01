import type { OutreachSettings } from "./outreach.functions";
import type { Prospect } from "./prospector-store.functions";

export const DEFAULT_OUTREACH_SETTINGS: OutreachSettings = {
  sender_name: "Aventura Sports Media",
  mailing_address: "",
  site_url: "",
  signature: "",
};

export const TEMPLATE_VARIABLES: { token: string; help: string }[] = [
  { token: "{{club}}", help: "The club, league or association name" },
  { token: "{{city}}", help: "The city you searched when you found it" },
  { token: "{{contact_first_name}}", help: "First name of the contact, or \"there\" if you have no name" },
  { token: "{{sender_name}}", help: "Your sender name from the email settings" },
];

export function firstName(full: string | null | undefined): string {
  const first = (full ?? "").trim().split(/\s+/)[0] ?? "";
  return first;
}

export function fillTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (whole, key: string) => vars[key.toLowerCase()] ?? whole);
}

export function leadVars(lead: Prospect, settings: OutreachSettings): Record<string, string> {
  return {
    club: lead.name,
    city: lead.city ?? "",
    contact_first_name: firstName(lead.contact_name) || "there",
    sender_name: settings.sender_name,
  };
}

/** Who an email to this lead goes to: the named contact if there is one, else the address found on their site. */
export function recipientFor(lead: Prospect): string | null {
  return lead.contact_email || lead.email || null;
}

/**
 * The part of every email that is not editable: who it is from, the mailing address, and the opt-out line
 * with the one-click link. It is appended to whatever you write.
 */
export function emailFooter(settings: OutreachSettings, unsubscribeUrl: string): string {
  const lines = ["--", settings.sender_name];
  if (settings.signature.trim()) lines.push(settings.signature.trim());
  if (settings.mailing_address.trim()) lines.push(settings.mailing_address.trim());
  lines.push(
    "",
    `If you would rather not hear from us, reply "no thanks" or use this link and we will not email you again: ${unsubscribeUrl}`,
  );
  return lines.join("\n");
}

export function buildMailto(to: string, subject: string, body: string): string {
  const crlf = body.replace(/\r?\n/g, "\r\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlf)}`;
}

export function buildGmailCompose(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** The public website address used in opt-out links. Preview and local addresses are not public, so they do not count. */
export function publicSiteBase(settings: OutreachSettings, currentOrigin: string): string {
  if (settings.site_url.trim()) return settings.site_url.trim().replace(/\/+$/, "");
  const isPublic = /^https:\/\//i.test(currentOrigin) && !/id-preview--|lovableproject\.com|localhost|127\.0\.0\.1/i.test(currentOrigin);
  return isPublic ? currentOrigin.replace(/\/+$/, "") : "";
}

/* -------------------- follow-up dates -------------------- */

/** Today's date in Brantford as YYYY-MM-DD. */
export function torontoToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
}

export function addDaysIso(days: number): string {
  const [y, m, d] = torontoToday().split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + days));
  return date.toISOString().slice(0, 10);
}

export type FollowUpState = "none" | "overdue" | "today" | "upcoming";

export function followUpState(lead: Pick<Prospect, "follow_up_at" | "do_not_contact" | "status">): FollowUpState {
  if (!lead.follow_up_at) return "none";
  const today = torontoToday();
  if (lead.follow_up_at < today) return "overdue";
  if (lead.follow_up_at === today) return "today";
  return "upcoming";
}

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)).toLocaleDateString(undefined, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}
