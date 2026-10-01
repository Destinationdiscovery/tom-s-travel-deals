import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminProspectorStyles } from "@/components/AdminProspectorStyles";
import {
  enrichProspectEmails,
  geocodeLocation,
  getProspectorStatus,
  searchProspects,
  type EnrichedEmail,
  type ProspectResult,
} from "@/lib/prospector.functions";
import {
  getLatestProspectSearch,
  listAllProspects,
  listProspects,
  listProspectSearches,
  listProspectsByPlaceIds,
  recordProspectSearch,
  saveProspects,
  updateProspect,
  type Prospect,
  type ProspectSearchRow,
} from "@/lib/prospector-store.functions";
import { generateGridPoints, gridSizeForRadius, pointRadiusKm, relativeDate } from "@/lib/prospector-grid";
import {
  CITY_SUGGESTIONS,
  CUSTOM_QUERY,
  PROSPECT_STATUSES,
  SPORT_PRESETS,
  geocodeTarget,
  statusLabel,
} from "@/lib/prospector-presets";

export const Route = createFileRoute("/_authenticated/admin/prospector")({
  component: ProspectorScreen,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SOURCE_LABEL: Record<string, string> = {
  mailto: "Email link on website",
  page_text: "Written on website",
  contact_page: "Contact page",
  facebook_about: "Facebook page",
  instagram_bio: "Instagram",
};

type Note = { kind: "ok" | "warn"; text: string; cached?: boolean };
type EmailState = "checking" | "none" | "error" | "found";

function ProspectorScreen() {
  const qc = useQueryClient();
  const statusFn = useServerFn(getProspectorStatus);
  const geocodeFn = useServerFn(geocodeLocation);
  const searchFn = useServerFn(searchProspects);
  const enrichFn = useServerFn(enrichProspectEmails);
  const saveFn = useServerFn(saveProspects);
  const listFn = useServerFn(listProspects);
  const byIdsFn = useServerFn(listProspectsByPlaceIds);
  const allFn = useServerFn(listAllProspects);
  const updateFn = useServerFn(updateProspect);
  const latestFn = useServerFn(getLatestProspectSearch);
  const historyFn = useServerFn(listProspectSearches);
  const recordFn = useServerFn(recordProspectSearch);

  const maps = useQuery({ queryKey: ["prospector-status"], queryFn: () => statusFn() });
  const history = useQuery({ queryKey: ["prospector-searches"], queryFn: () => historyFn() });

  const [preset, setPreset] = useState<string>(SPORT_PRESETS[0]?.query ?? "minor hockey association");
  const [customQuery, setCustomQuery] = useState("");
  const [city, setCity] = useState("Brantford");
  const [radius, setRadius] = useState(15);
  const [findEmails, setFindEmails] = useState(true);

  const [leads, setLeads] = useState<Prospect[]>([]);
  const [allLeads, setAllLeads] = useState<Prospect[]>([]);
  const [view, setView] = useState<"search" | "all">("search");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [seenBefore, setSeenBefore] = useState<Record<string, string>>({});
  const [lastSearchedAt, setLastSearchedAt] = useState<string | null>(null);
  const [emailState, setEmailState] = useState<Record<string, EmailState>>({});
  const [emailProgress, setEmailProgress] = useState<{ done: number; total: number; found: number } | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [emailFilter, setEmailFilter] = useState<"all" | "has" | "none">("all");
  const [textFilter, setTextFilter] = useState("");

  const runId = useRef(0);

  const query = (preset === CUSTOM_QUERY ? customQuery : preset).trim();
  const gridSize = gridSizeForRadius(radius);
  const plannedCalls = gridSize * gridSize * 3;

  /** Applies a change to a lead in both lists, so it shows the same in every view. */
  const patchLead = (id: string, patch: Partial<Prospect>) => {
    setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setAllLeads((cur) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  /** Reads each lead's website for an email written on the page. Never guesses an address. */
  const runEmailFinder = async (pool: Prospect[], myRun: number) => {
    const todo = pool.filter((l) => l.website && !l.email);
    if (!todo.length) return;
    setEmailState((m) => ({ ...m, ...Object.fromEntries(todo.map((l) => [l.google_place_id, "checking" as EmailState])) }));
    let done = 0;
    let found = 0;
    setEmailProgress({ done: 0, total: todo.length, found: 0 });
    for (let i = 0; i < todo.length; i += 8) {
      if (runId.current !== myRun) return;
      const chunk = todo.slice(i, i + 8);
      let res: EnrichedEmail[] = [];
      try {
        res = await enrichFn({
          data: { items: chunk.map((l) => ({ google_place_id: l.google_place_id, website: l.website })) },
        });
      } catch {
        res = [];
      }
      if (runId.current !== myRun) return;
      const byId = new Map(res.map((r) => [r.google_place_id, r]));
      for (const l of chunk) {
        const r = byId.get(l.google_place_id);
        if (r && r.email) {
          found++;
          patchLead(l.id, { email: r.email, email_source: r.source, email_source_url: r.sourceUrl });
          setEmailState((m) => ({ ...m, [l.google_place_id]: "found" }));
        } else {
          setEmailState((m) => ({ ...m, [l.google_place_id]: !r || r.status === "error" ? "error" : "none" }));
        }
      }
      done += chunk.length;
      setEmailProgress({ done, total: todo.length, found });
    }
    setEmailProgress(null);
  };

  const runSearch = async (opts: { force: boolean }) => {
    if (query.length < 2) {
      setError("Pick what to find, or type your own search phrase.");
      return;
    }
    const place = city.trim();
    if (place.length < 2) {
      setError("Enter a city.");
      return;
    }
    const myRun = ++runId.current;
    const size = gridSizeForRadius(radius);
    const totalPoints = size * size;

    setBusy(true);
    setError(null);
    setNote(null);
    setProgress(null);
    setEmailProgress(null);
    setView("search");
    try {
      if (!opts.force) {
        const cached = await latestFn({ data: { query, city: place } });
        if (cached) {
          const rows = await listFn({ data: { query, city: place } });
          if (runId.current !== myRun) return;
          setLeads(rows);
          setSeenBefore({});
          setLastSearchedAt(cached.created_at);
          setNote({
            kind: "ok",
            cached: true,
            text: `Loaded ${rows.length} saved leads from ${new Date(cached.created_at).toLocaleDateString()}. No Google lookups were used.`,
          });
          return;
        }
      }

      if (totalPoints > 9) {
        const ok = window.confirm(`Large area: this search will use up to ${totalPoints * 3} Google lookups. Continue?`);
        if (!ok) return;
      }

      const center = await geocodeFn({ data: { location: geocodeTarget(place) } });
      const points = generateGridPoints(center.lat, center.lng, radius, size);
      const pointRadius = pointRadiusKm(radius, size);
      const byId = new Map<string, ProspectResult>();

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (!p) continue;
        if (i > 0) await sleep(500);
        let token: string | null = null;
        let pass = 0;
        do {
          if (pass > 0) await sleep(2200);
          const res: { results: ProspectResult[]; nextPageToken: string | null } = await searchFn({
            data: {
              query,
              radiusKm: pointRadius,
              lat: p.lat,
              lng: p.lng,
              ...(token ? { pageToken: token } : {}),
            },
          });
          for (const r of res.results) if (!byId.has(r.id)) byId.set(r.id, r);
          token = res.nextPageToken;
          pass++;
          if (runId.current !== myRun) return;
          setProgress(`Searching for ${query} near ${place}. Spot ${i + 1} of ${points.length}, ${byId.size} found so far.`);
        } while (token && pass < 3);
      }

      setProgress("Saving results.");
      const all = [...byId.values()];
      const saved = await saveFn({
        data: {
          query,
          city: place,
          rows: all.map((r) => ({
            google_place_id: r.id,
            name: r.name,
            address: r.address || null,
            phone: r.phone,
            website: r.website,
            rating: r.rating,
            reviews: r.reviews,
            maps_url: r.mapsUrl,
          })),
        },
      });
      await recordFn({
        data: { query, city: place, radius_km: Math.max(1, Math.round(radius)), total_results: all.length, grid_points: totalPoints },
      });
      const stored = await byIdsFn({ data: { ids: all.map((r) => r.id) } });
      if (runId.current !== myRun) return;

      setLeads(stored);
      setSeenBefore(saved.seenBefore);
      setLastSearchedAt(new Date().toISOString());
      setNote({ kind: "ok", text: `Search complete. ${all.length} found, ${saved.newCount} new to your list.` });
      setProgress(null);
      void qc.invalidateQueries({ queryKey: ["prospector-searches"] });
      if (findEmails) await runEmailFinder(stored, myRun);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
      setProgress(null);
    } finally {
      if (runId.current === myRun) setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runSearch({ force: false });
  };

  const loadHistoryRow = async (row: ProspectSearchRow) => {
    const myRun = ++runId.current;
    setError(null);
    setNote(null);
    setView("search");
    const matched = SPORT_PRESETS.find((p) => p.query === row.query);
    if (matched) setPreset(matched.query);
    else {
      setPreset(CUSTOM_QUERY);
      setCustomQuery(row.query);
    }
    setCity(row.city);
    setRadius(row.radius_km);
    try {
      const rows = await listFn({ data: { query: row.query, city: row.city } });
      if (runId.current !== myRun) return;
      setLeads(rows);
      setSeenBefore({});
      setLastSearchedAt(row.created_at);
      setNote({
        kind: "ok",
        cached: true,
        text: `Loaded ${rows.length} saved leads from ${new Date(row.created_at).toLocaleDateString()}. No Google lookups were used.`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load that search.");
    }
  };

  const showAll = async () => {
    setView("all");
    setError(null);
    try {
      setAllLeads(await allFn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load saved leads.");
    }
  };

  const changeStatus = async (l: Prospect, value: string) => {
    const valid = PROSPECT_STATUSES.find((s) => s.value === value);
    if (!valid) return;
    const before = l.status;
    patchLead(l.id, { status: valid.value });
    try {
      await updateFn({ data: { id: l.id, status: valid.value } });
    } catch (e) {
      patchLead(l.id, { status: before });
      setError(e instanceof Error ? e.message : "Could not save the status.");
    }
  };

  const saveNotes = async (l: Prospect) => {
    const draft = notesDraft[l.id];
    if (draft === undefined || draft === (l.notes ?? "")) return;
    try {
      await updateFn({ data: { id: l.id, notes: draft } });
      patchLead(l.id, { notes: draft.trim() ? draft.trim() : null });
      setNotesDraft((m) => {
        const next = { ...m };
        delete next[l.id];
        return next;
      });
      setMsg("Note saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the note.");
    }
  };

  const source = view === "all" ? allLeads : leads;
  const needle = textFilter.trim().toLowerCase();
  const visible = source.filter((l) => {
    if (statusFilter === "active" && l.status === "not_interested") return false;
    if (statusFilter !== "active" && statusFilter !== "all" && l.status !== statusFilter) return false;
    if (emailFilter === "has" && !l.email) return false;
    if (emailFilter === "none" && l.email) return false;
    if (needle && !(l.name.toLowerCase().includes(needle) || (l.address ?? "").toLowerCase().includes(needle))) return false;
    return true;
  });
  const withEmail = source.filter((l) => l.email).length;
  const missingEmail = source.filter((l) => l.website && !l.email && emailState[l.google_place_id] !== "checking");

  const exportCsv = () => {
    if (!visible.length) return;
    const header = ["Name", "Address", "Phone", "Email", "Email found", "Website", "Rating", "Reviews", "Status", "Notes", "Maps", "Search", "City"];
    const esc = (v: string | number | null) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [header.join(",")]
      .concat(
        visible.map((l) =>
          [
            l.name,
            l.address,
            l.phone,
            l.email,
            l.email_source ? (SOURCE_LABEL[l.email_source] ?? l.email_source) : null,
            l.website,
            l.rating,
            l.reviews,
            statusLabel(l.status),
            l.notes,
            l.maps_url,
            l.query,
            l.city,
          ]
            .map(esc)
            .join(","),
        ),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (view === "all" ? "aventura-leads-all" : `aventura-leads-${query}-${city}`).replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderEmail = (l: Prospect) => {
    if (l.email) {
      return (
        <div className="pr-email">
          <div className="pr-email-row">
            <a href={`mailto:${l.email}`}>{l.email}</a>
            <button type="button" className="linky" onClick={() => void navigator.clipboard.writeText(l.email ?? "")}>
              Copy
            </button>
          </div>
          {l.email_source && (
            <div className="pr-dim" style={{ marginTop: 4 }}>
              {l.email_source_url ? (
                <a href={l.email_source_url} target="_blank" rel="noreferrer">
                  {SOURCE_LABEL[l.email_source] ?? l.email_source}
                </a>
              ) : (
                (SOURCE_LABEL[l.email_source] ?? l.email_source)
              )}
            </div>
          )}
        </div>
      );
    }
    if (!l.website) return <span className="pr-dim">No website to check.</span>;
    const state = emailState[l.google_place_id];
    if (state === "checking") {
      return (
        <span className="pr-dim">
          <span className="pr-spin" />
          Checking the website.
        </span>
      );
    }
    return (
      <div className="pr-email-row">
        <span className="pr-chip">{state === "error" ? "Could not check" : state === "none" ? "Not found" : "Not checked"}</span>
        <button type="button" className="linky" onClick={() => void runEmailFinder([l], runId.current)}>
          Find email
        </button>
      </div>
    );
  };

  return (
    <>
      <AdminProspectorStyles />
      <div className="adm-detail-head">
        <h2>Prospector</h2>
      </div>
      <p className="adm-hint">
        Find leagues, associations and clubs near a city. Everything found is saved, so searching the same place again
        costs nothing. Emails are only ever read from a league's own website or social page. Nothing is sent from here.
      </p>

      {maps.data && !maps.data.mapsConnected && (
        <div className="pr-note is-warn">
          Google Maps is not connected to this project yet. Link the Google Maps Platform connection in Lovable, then
          reload this page.
        </div>
      )}

      <form className="adm-card" onSubmit={onSubmit}>
        <div className="pr-form">
          <label className="field">
            <span>What to find</span>
            <select value={preset} onChange={(e) => setPreset(e.target.value)}>
              {["Hockey", "Soccer"].map((g) => (
                <optgroup key={g} label={g}>
                  {SPORT_PRESETS.filter((p) => p.group === g).map((p) => (
                    <option key={p.query} value={p.query}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={CUSTOM_QUERY}>Type my own phrase</option>
            </select>
          </label>
          <label className="field">
            <span>City</span>
            <input list="pr-cities" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Brantford" />
            <datalist id="pr-cities">
              {CITY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Radius (km)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={radius}
              onChange={(e) => setRadius(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
          <button className="btn btn-rec" type="submit" disabled={busy}>
            {busy ? "Working" : "Search"}
          </button>
        </div>
        {preset === CUSTOM_QUERY && (
          <label className="field" style={{ marginTop: 12 }}>
            <span>Your search phrase</span>
            <input value={customQuery} onChange={(e) => setCustomQuery(e.target.value)} placeholder="for example: ringette association" />
          </label>
        )}
        <div className="pr-opts">
          <label>
            <input type="checkbox" checked={findEmails} onChange={(e) => setFindEmails(e.target.checked)} />
            Look for emails on each website after a search
          </label>
          <span>
            Grid {gridSize}x{gridSize}, up to {plannedCalls} Google lookups
          </span>
          {lastSearchedAt && <span>Last searched {relativeDate(lastSearchedAt)}</span>}
        </div>
      </form>

      {note && (
        <div className={`pr-note ${note.kind === "ok" ? "is-ok" : "is-warn"}`}>
          <span>{note.text}</span>
          {note.cached && (
            <button type="button" className="btn btn-ghost pr-mini" disabled={busy} onClick={() => void runSearch({ force: true })}>
              Search Google again for new ones
            </button>
          )}
        </div>
      )}
      {progress && <div className="pr-note">{progress}</div>}
      {error && <p className="adm-err">{error}</p>}
      {msg && <p className="adm-msg">{msg}</p>}

      {emailProgress && (
        <div className="pr-note" style={{ display: "block" }}>
          <div className="pr-dim" style={{ color: "var(--chalk)" }}>
            Checking websites for emails: {emailProgress.done} of {emailProgress.total}, {emailProgress.found} found
          </div>
          <div className="pr-progress">
            <i style={{ width: `${(emailProgress.done / Math.max(1, emailProgress.total)) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="pr-bar">
        <div className="pr-seg">
          <button type="button" className={view === "search" ? "on" : ""} onClick={() => setView("search")}>
            This search
          </button>
          <button type="button" className={view === "all" ? "on" : ""} onClick={() => void showAll()}>
            All saved leads
          </button>
        </div>
        <div className="pr-bar-group">
          <span className="pr-dim">
            {visible.length} shown of {source.length}, {withEmail} with an email
          </span>
          <button
            type="button"
            className="btn btn-ghost pr-mini"
            disabled={!missingEmail.length || !!emailProgress}
            onClick={() => void runEmailFinder(missingEmail.slice(0, 200), runId.current)}
          >
            Find emails for {Math.min(missingEmail.length, 200)}
          </button>
          <button type="button" className="btn btn-ghost pr-mini" disabled={!visible.length} onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {source.length > 0 && (
        <div className="pr-filters">
          <label className="field">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="active">Active (hides not interested)</option>
              <option value="all">Everything</option>
              {PROSPECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Email</span>
            <select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value as "all" | "has" | "none")}>
              <option value="all">All</option>
              <option value="has">Has an email</option>
              <option value="none">No email yet</option>
            </select>
          </label>
          <label className="field" style={{ flex: 1 }}>
            <span>Search the list</span>
            <input value={textFilter} onChange={(e) => setTextFilter(e.target.value)} placeholder="Name or address" />
          </label>
        </div>
      )}

      {visible.map((l) => (
        <article className="pr-lead" key={l.id}>
          <div>
            <div className="pr-lead-name">
              <b>{l.name}</b>
              <span className={`pr-chip${l.status === "won" || l.status === "replied" ? " is-good" : ""}${l.status === "new" ? " is-hot" : ""}`}>
                {statusLabel(l.status)}
              </span>
              {seenBefore[l.google_place_id] && view === "search" && <span className="pr-chip">Seen before</span>}
            </div>
            {l.address && <div className="pr-lead-addr">{l.address}</div>}
            <div className="pr-lead-links">
              {l.phone && <span>{l.phone}</span>}
              {l.website && (
                <a href={l.website} target="_blank" rel="noreferrer">
                  Website
                </a>
              )}
              {l.maps_url && (
                <a href={l.maps_url} target="_blank" rel="noreferrer">
                  Open in Maps
                </a>
              )}
              {l.rating != null && (
                <span>
                  {Number(l.rating).toFixed(1)} stars ({l.reviews ?? 0})
                </span>
              )}
              {view === "all" && l.query && (
                <span>
                  Found by: {l.query}, {l.city}
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="pr-lead-label">Email</span>
            {renderEmail(l)}
          </div>
          <div>
            <label className="field">
              <span className="pr-lead-label">Status</span>
              <select value={l.status} onChange={(e) => void changeStatus(l, e.target.value)}>
                {PROSPECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="pr-lead-notes">
            <label className="field">
              <span className="pr-lead-label">Notes</span>
              <textarea
                rows={2}
                value={notesDraft[l.id] ?? l.notes ?? ""}
                placeholder="Who you spoke to, what they said, when to follow up"
                onChange={(e) => setNotesDraft((m) => ({ ...m, [l.id]: e.target.value }))}
                onBlur={() => void saveNotes(l)}
              />
            </label>
          </div>
        </article>
      ))}

      {!busy && source.length === 0 && !progress && (
        <div className="adm-card">
          <p className="adm-empty">
            {view === "all"
              ? "Nothing saved yet. Run a search and the leads will be kept here."
              : "Choose what to find and a city, then press Search."}
          </p>
        </div>
      )}

      {(history.data ?? []).length > 0 && (
        <section className="adm-card">
          <h3 className="adm-sub" style={{ marginTop: 0 }}>
            Search history
          </h3>
          <div className="adm-list">
            {(history.data ?? []).map((row) => (
              <div key={row.id} className="adm-row-wrap" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ color: "var(--chalk)" }}>{row.query}</b>
                  <span className="pr-dim">
                    {" "}
                    in {row.city}, {new Date(row.created_at).toLocaleDateString()}, {row.total_results} found
                  </span>
                </div>
                <button type="button" className="linky" onClick={() => void loadHistoryRow(row)}>
                  Load results
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
