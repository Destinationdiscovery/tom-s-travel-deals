/** Website / social-profile email extraction for the Prospector. Server only. */

export type EmailSource = "mailto" | "page_text" | "contact_page" | "facebook_about" | "instagram_bio";
export type EnrichStatus = "found" | "not_found" | "error";
export type EnrichOutcome = {
  email: string | null;
  source: EmailSource | null;
  sourceUrl: string | null;
  status: EnrichStatus;
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const TIMEOUT_MS = 8000;
const MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_REDIRECTS = 3;

const JUNK_DOMAINS = [
  "sentry.io", "wixpress.com", "example.com", "domain.com", "schema.org", "w3.org",
  "facebook.com", "instagram.com", "sentry-next.wixpress.com", "email.com", "yourdomain.com",
];
const PLACEHOLDERS = new Set(["your@email.com", "name@domain.com", "email@example.com", "you@example.com", "user@domain.com"]);
const ASSET_EXT = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js)$/i;
const ROLE = /^(info|hello|contact|office|admin|sales|support|enquiries|inquiries|mail|team)@/;
const EMAIL_RE = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,24}/gi;

/* ---------------- SSRF protection ---------------- */

function isPrivateV4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return false;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b !== undefined && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b !== undefined && b >= 64 && b <= 127) || (a !== undefined && a >= 224)
  );
}
function isPrivateV6(ip: string): boolean {
  const s = ip.toLowerCase().replace(/^\[|\]$/g, "");
  return s === "::1" || s === "::" || s.startsWith("fc") || s.startsWith("fd") || s.startsWith("fe80") || s.startsWith("::ffff:");
}

async function hostIsSafe(host: string): Promise<boolean> {
  const h = host.toLowerCase();
  if (!h || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return !isPrivateV4(h);
  if (h.includes(":")) return !isPrivateV6(h);
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(h)}&type=A`, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return true;
    const j = (await res.json()) as { Answer?: Array<{ type: number; data: string }> };
    return !(j.Answer ?? []).some((a) => a.type === 1 && isPrivateV4(a.data));
  } catch {
    return true;
  }
}

async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      chunks.push(value.slice(0, value.byteLength - (total - MAX_BYTES)));
      await reader.cancel().catch(() => {});
      break;
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
  let o = 0;
  for (const c of chunks) { buf.set(c, o); o += c.byteLength; }
  return new TextDecoder().decode(buf);
}

/** Safe GET: http/https only, SSRF-checked on every hop, 3 redirects, 8s, 1.5MB. */
async function safeFetch(url: string): Promise<{ html: string; finalUrl: string } | null> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let u: URL;
    try { u = new URL(current); } catch { return null; }
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!(await hostIsSafe(u.hostname))) return null;
    const res = await fetch(u.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9" },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return null;
      current = new URL(loc, u).toString();
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { html: await readCapped(res), finalUrl: u.toString() };
  }
  return null;
}

async function fetchWithRetry(url: string) {
  try {
    return await safeFetch(url);
  } catch {
    try { return await safeFetch(url); } catch { return null; }
  }
}

/* ---------------- Extraction ---------------- */

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&commat;|&#64;/gi, "@")
    .replace(/&period;/gi, ".")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function deobfuscate(s: string): string {
  return s
    .replace(/\s*[\[\(\{]\s*at\s*[\]\)\}]\s*/gi, "@")
    .replace(/\s+at\s+(?=[a-z0-9\-]+\s*[\[\(\{]?\s*dot)/gi, "@")
    .replace(/\s*[\[\(\{]\s*dot\s*[\]\)\}]\s*/gi, ".")
    .replace(/\s+dot\s+(?=[a-z]{2,})/gi, ".");
}

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

export function isJunk(email: string): boolean {
  const e = email.toLowerCase();
  if (PLACEHOLDERS.has(e)) return true;
  if (ASSET_EXT.test(e)) return true;
  const domain = e.split("@")[1] ?? "";
  if (JUNK_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) return true;
  if (/(noreply|no-reply|donotreply|example|placeholder|test@)/.test(e)) return true;
  if (/^[0-9a-f]{16,}@/.test(e)) return true; // hashed tracking ids
  return false;
}

type Candidate = { email: string; source: EmailSource };

function extract(html: string, textSource: EmailSource): Candidate[] {
  const out: Candidate[] = [];
  const decoded = decodeEntities(html);
  for (const m of decoded.matchAll(/mailto:([^"'?>\s]+)/gi)) {
    const raw = m[1];
    if (!raw) continue;
    let e = raw;
    try { e = decodeURIComponent(raw); } catch { /* keep raw */ }
    e = e.trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e)) out.push({ email: e, source: "mailto" });
  }
  const text = deobfuscate(decodeEntities(visibleText(html)));
  for (const m of text.match(EMAIL_RE) ?? []) out.push({ email: m.toLowerCase(), source: textSource });
  const seen = new Set<string>();
  return out.filter((c) => {
    c.email = c.email.replace(/^[._\-]+|[._\-]+$/g, "");
    if (seen.has(c.email) || isJunk(c.email)) return false;
    seen.add(c.email);
    return true;
  });
}

function rootDomain(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function pickBest(cands: Candidate[], siteHost: string | null): Candidate | null {
  if (!cands.length) return null;
  const root = siteHost ? rootDomain(siteHost) : null;
  const onDomain = (c: Candidate) => !!root && (c.email.endsWith(`@${root}`) || !!c.email.split("@")[1]?.endsWith(`.${root}`));
  const own = cands.filter(onDomain);
  if (own.length) return own.find((c) => !ROLE.test(c.email)) ?? own[0] ?? null;
  return cands[0] ?? null;
}

function contactLinks(html: string, base: URL): string[] {
  const links = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1] ?? "";
    const label = (m[2] ?? "").replace(/<[^>]+>/g, "");
    if (!/contact/i.test(href) && !/contact/i.test(label)) continue;
    try {
      const u = new URL(href, base);
      if (rootDomain(u.hostname) === rootDomain(base.hostname) && /^https?:$/.test(u.protocol)) {
        u.hash = "";
        links.add(u.toString());
      }
    } catch { /* skip */ }
  }
  return [...links].slice(0, 3);
}

/* ---------------- Branches ---------------- */

export function classify(website: string): "facebook" | "instagram" | "normal" {
  try {
    const h = rootDomain(new URL(website.startsWith("http") ? website : `https://${website}`).hostname);
    if (h === "facebook.com" || h.endsWith(".facebook.com") || h === "fb.com") return "facebook";
    if (h === "instagram.com" || h.endsWith(".instagram.com")) return "instagram";
  } catch { /* fallthrough */ }
  return "normal";
}

async function normalBranch(website: string): Promise<EnrichOutcome> {
  let base: URL;
  try { base = new URL(website.startsWith("http") ? website : `https://${website}`); } catch {
    return { email: null, source: null, sourceUrl: null, status: "error" };
  }
  const home = await fetchWithRetry(base.toString());
  if (home) {
    const best = pickBest(extract(home.html, "page_text"), new URL(home.finalUrl).hostname);
    if (best) return { email: best.email, source: best.source, sourceUrl: home.finalUrl, status: "found" };
  }
  const tried = new Set<string>([base.toString()]);
  const paths = ["/contact", "/contact-us", "/contact.html", "/about", "/about-us"].map((p) => new URL(p, base).toString());
  const extra = home ? contactLinks(home.html, new URL(home.finalUrl)) : [];
  let anyLoaded = !!home;
  for (const url of [...paths, ...extra]) {
    if (tried.has(url)) continue;
    tried.add(url);
    const page = await safeFetch(url).catch(() => null);
    if (!page) continue;
    anyLoaded = true;
    const best = pickBest(extract(page.html, "contact_page"), base.hostname);
    if (best) return { email: best.email, source: best.source === "mailto" ? "mailto" : "contact_page", sourceUrl: page.finalUrl, status: "found" };
  }
  return { email: null, source: null, sourceUrl: null, status: anyLoaded ? "not_found" : "error" };
}

async function socialBranch(website: string, kind: "facebook" | "instagram"): Promise<EnrichOutcome> {
  let u: URL;
  try { u = new URL(website.startsWith("http") ? website : `https://${website}`); } catch {
    return { email: null, source: null, sourceUrl: null, status: "error" };
  }
  const source: EmailSource = kind === "facebook" ? "facebook_about" : "instagram_bio";
  let target = u.toString();
  if (kind === "facebook") {
    const path = u.pathname.replace(/\/+$/, "");
    target = `https://www.facebook.com${path.endsWith("/about") ? path : `${path}/about`}`;
  }
  const page = await fetchWithRetry(target);
  // Login walls / blocks are expected on social sites: report "error", not "not_found".
  if (!page || /login|checkpoint|accounts\/login/i.test(new URL(page.finalUrl).pathname)) {
    return { email: null, source: null, sourceUrl: null, status: "error" };
  }
  const cands = extract(page.html, source).map((c) => ({ ...c, source }));
  const best = cands.find((c) => !ROLE.test(c.email)) ?? cands[0];
  if (best) return { email: best.email, source, sourceUrl: page.finalUrl, status: "found" };
  // A tiny page without profile content means we were blocked.
  return { email: null, source: null, sourceUrl: null, status: page.html.length < 5000 ? "error" : "not_found" };
}

export async function enrichWebsite(website: string | null | undefined): Promise<EnrichOutcome> {
  if (!website || !website.trim()) return { email: null, source: null, sourceUrl: null, status: "not_found" };
  try {
    const kind = classify(website.trim());
    return kind === "normal" ? await normalBranch(website.trim()) : await socialBranch(website.trim(), kind);
  } catch {
    return { email: null, source: null, sourceUrl: null, status: "error" };
  }
}
