// Articles are plain Markdown files in src/content/articles. Adding one needs no code change.
// A file with a mistake in its header is skipped (and reported) instead of breaking the site.
//
// File format:
//   ---
//   title: Short title (keep under 52 characters so the page title fits)
//   description: One or two sentences for search results and the article header.
//   kind: guide            (guide or update)
//   published: 2026-10-02  (year-month-day)
//   checked: 2026-10-02    (the day you last re-checked the sources, change it only after re-checking)
//   status: ok             (ok = In force, unc = Unconfirmed, sched = Scheduled)
//   featured: yes          (optional, shows on the home page)
//   tool: /flight-claims | Open the flight claim guide      (optional, link | label)
//   source: Source name | https://official-link              (repeat one line per source, at least one)
//   ---
//   Then the article in Markdown. Use ## for headings. Open each fact with "According to [source]".

export type Source = { label: string; href: string };
export type Status = "ok" | "unc" | "sched";
export type Article = {
  slug: string;
  title: string;
  description: string;
  kind: "guide" | "update";
  published: string;
  checked: string;
  status: Status;
  featured: boolean;
  tool?: { label: string; href: string };
  sources: Source[];
  body: string;
  minutes: number;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string): string {
  if (!DATE.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

type Parsed = { single: Record<string, string>; lists: Record<string, string[]>; body: string };

export function parseFrontmatter(raw: string): Parsed | null {
  const text = raw.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return null;
  const head = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n+/, "");
  const single: Record<string, string> = {};
  const lists: Record<string, string[]> = {};
  for (const line of head.split("\n")) {
    const m = /^([A-Za-z]+):\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    const key = m[1].toLowerCase();
    if (key === "source") (lists.source ??= []).push(m[2]);
    else single[key] = m[2].trim();
  }
  return { single, lists, body };
}

function splitPipe(v: string): { first: string; second: string } | null {
  const i = v.indexOf("|");
  if (i === -1) return null;
  const first = v.slice(0, i).trim();
  const second = v.slice(i + 1).trim();
  return first && second ? { first, second } : null;
}

export function parseArticle(raw: string, file: string): { article?: Article; problem?: string } {
  const base = file.split("/").pop() ?? file;
  const slug = base.replace(/\.md$/i, "");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { problem: `${base}: the file name must be lower-case words joined by hyphens, for example my-article.md` };
  }
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { problem: `${base}: the file must start with a --- header and close it with ---` };
  const { single: m, lists, body } = parsed;

  for (const k of ["title", "description", "kind", "published", "checked", "status"]) {
    if (!m[k]) return { problem: `${base}: the header is missing "${k}"` };
  }
  if (m.kind !== "guide" && m.kind !== "update") return { problem: `${base}: kind must be guide or update` };
  if (!DATE.test(m.published) || !DATE.test(m.checked)) {
    return { problem: `${base}: dates must look like 2026-10-02` };
  }
  if (m.status !== "ok" && m.status !== "unc" && m.status !== "sched") {
    return { problem: `${base}: status must be ok, unc or sched` };
  }
  const sources: Source[] = [];
  for (const line of lists.source ?? []) {
    const p = splitPipe(line);
    if (!p || !/^https?:\/\//.test(p.second)) {
      return { problem: `${base}: each source line must look like: source: Name | https://link` };
    }
    sources.push({ label: p.first, href: p.second });
  }
  if (sources.length === 0) return { problem: `${base}: add at least one source line` };

  let tool: Article["tool"];
  if (m.tool) {
    const p = splitPipe(m.tool);
    if (!p || !p.first.startsWith("/")) return { problem: `${base}: tool must look like: tool: /flight-claims | Label` };
    tool = { href: p.first, label: p.second };
  }
  if (body.trim().length < 200) return { problem: `${base}: the article body is too short` };

  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    article: {
      slug,
      title: m.title,
      description: m.description,
      kind: m.kind,
      published: m.published,
      checked: m.checked,
      status: m.status,
      featured: /^(yes|true)$/i.test(m.featured ?? ""),
      tool,
      sources,
      body,
      minutes: Math.max(1, Math.round(words / 200)),
    },
  };
}

export function buildIndex(files: Record<string, string>): { articles: Article[]; problems: string[] } {
  const articles: Article[] = [];
  const problems: string[] = [];
  for (const [file, raw] of Object.entries(files)) {
    const r = parseArticle(raw, file);
    if (r.article) articles.push(r.article);
    else if (r.problem) problems.push(r.problem);
  }
  articles.sort((a, b) => b.checked.localeCompare(a.checked) || b.published.localeCompare(a.published) || a.title.localeCompare(b.title));
  return { articles, problems };
}

export function findArticle(list: Article[], slug: string): Article | undefined {
  return list.find((a) => a.slug === slug);
}

export function relatedArticles(list: Article[], current: Article, n = 3): Article[] {
  const others = list.filter((a) => a.slug !== current.slug);
  const same = others.filter((a) => current.tool && a.tool?.href === current.tool.href);
  const rest = others.filter((a) => !same.includes(a));
  return [...same, ...rest].slice(0, n);
}
