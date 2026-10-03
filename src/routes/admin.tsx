import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_DEVICE_KEY, AdminLoginModal } from "@/components/site/AdminLogin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | reviewthengo" },
      { name: "description", content: "Private admin dashboard for reviewthengo." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin | reviewthengo" },
      { property: "og:description", content: "Private admin dashboard for reviewthengo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Status = "loading" | "denied" | "ok";

function AdminPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"subscribers" | "webstats">("subscribers");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (!u) return setStatus("denied");
      const { data: role } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", u.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) return setStatus("denied");
      localStorage.setItem(ADMIN_DEVICE_KEY, "1");
      setEmail(u.email ?? "");
      setStatus("ok");
    });
  }, []);

  if (status === "loading") return <main className="wrap adm-page"><p className="adm-small">Loading</p></main>;
  if (status === "denied")
    return (
      <main className="wrap adm-page">
        <h1 className="adm-h1">Admin sign in</h1>
        <AdminLoginModal onClose={() => (window.location.href = "/")} />
      </main>
    );

  return (
    <main className="wrap adm-page">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="adm-h1">Dashboard</h1>
        </div>
        <div className="adm-actions">
          <span className="adm-small">{email}</span>
          <button
            className="btn"
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="adm-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "subscribers"} className={tab === "subscribers" ? "on" : ""} onClick={() => setTab("subscribers")}>
          Subscribers
        </button>
        <button role="tab" aria-selected={tab === "webstats"} className={tab === "webstats" ? "on" : ""} onClick={() => setTab("webstats")}>
          Webstats
        </button>
      </div>
      {tab === "subscribers" ? <Subscribers /> : <Webstats />}
    </main>
  );
}

interface Sub {
  id: string;
  email: string;
  source_slug: string | null;
  status: string;
  country: string | null;
  created_at: string;
}

function Subscribers() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [newEmail, setNewEmail] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("subscribers")
      .select("id, email, source_slug, status, country, created_at")
      .order("created_at", { ascending: false });
    setSubs((data as Sub[] | null) ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      subs.filter(
        (s) => (q === "" || s.email.toLowerCase().includes(q.toLowerCase())) && (status === "all" || s.status === status),
      ),
    [subs, q, status],
  );
  const active = subs.filter((s) => s.status === "active").length;
  const last30 = subs.filter((s) => Date.now() - new Date(s.created_at).getTime() < 30 * 864e5).length;

  const add = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMsg("That email does not look right.");
    const { error } = await supabase
      .from("subscribers")
      .upsert({ email, source_slug: "manual", status: "active" } as never, { onConflict: "email" });
    setMsg(error ? `Could not add: ${error.message}` : "Subscriber added.");
    if (!error) {
      setNewEmail("");
      load();
    }
  };

  const remove = async (s: Sub) => {
    if (!confirm(`Delete subscriber ${s.email}? This cannot be undone.`)) return;
    const { error } = await supabase.from("subscribers").delete().eq("id", s.id);
    setMsg(error ? `Could not delete: ${error.message}` : "Subscriber deleted.");
    if (!error) load();
  };

  const exportCsv = () => {
    const rows = [["email", "source", "status", "country", "subscribed_at"]];
    filtered.forEach((s) => rows.push([s.email, s.source_slug ?? "", s.status, s.country ?? "", s.created_at]));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="adm-stack">
      <div className="adm-stats">
        <Stat label="Active subscribers" value={active} />
        <Stat label="Total on list" value={subs.length} />
        <Stat label="New in last 30 days" value={last30} />
      </div>
      <div className="card adm-card">
        <div className="adm-toolbar">
          <input placeholder="Search email" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
          <button className="btn" type="button" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
        <div className="adm-toolbar">
          <input placeholder="Add subscriber email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <button className="btn solid" type="button" onClick={add}>
            Add
          </button>
        </div>
        {msg && <p className="adm-small">{msg}</p>}
        <div className="adm-scroll">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td className="more">{s.source_slug ?? "none"}</td>
                  <td className="date">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`chip ${s.status === "active" ? "ok" : "sched"}`}>{s.status}</span>
                  </td>
                  <td>
                    <button className="adm-del" type="button" onClick={() => remove(s)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="more">
                    No subscribers match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type Range = 1 | 7 | 30 | 90;

function Webstats() {
  const [range, setRange] = useState<Range>(30);
  const [sessions, setSessions] = useState<
    { first_page: string | null; page_count: number | null; duration_seconds: number | null; is_bounce: boolean | null; started_at: string }[]
  >([]);
  const [views, setViews] = useState<{ slug: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - range * 864e5).toISOString();
    const [s, v] = await Promise.all([
      supabase
        .from("sessions")
        .select("first_page, page_count, duration_seconds, is_bounce, started_at")
        .gte("started_at", since)
        .limit(10000),
      supabase.from("page_view_events").select("slug, created_at").gte("created_at", since).limit(10000),
    ]);
    const notAdmin = (p: string | null) => !p || !(p.startsWith("/admin") || p.startsWith("/gear-admin"));
    setSessions(((s.data as typeof sessions | null) ?? []).filter((x) => notAdmin(x.first_page)));
    setViews(((v.data as typeof views | null) ?? []).filter((x) => notAdmin(x.slug)));
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 60_000);
    return () => window.clearInterval(t);
  }, [load]);

  const totalPages = sessions.reduce((a, s) => a + (s.page_count ?? 0), 0);
  const avgDur = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.duration_seconds ?? 0), 0) / sessions.length) : 0;
  const bounce = sessions.length ? Math.round((sessions.filter((s) => s.is_bounce).length / sessions.length) * 100) : 0;

  const daily = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = Math.min(range, 30) - 1; i >= 0; i--) m.set(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), 0);
    sessions.forEach((s) => {
      const k = s.started_at.slice(0, 10);
      if (m.has(k)) m.set(k, (m.get(k) ?? 0) + 1);
    });
    return [...m.entries()];
  }, [sessions, range]);
  const maxDay = Math.max(1, ...daily.map(([, c]) => c));

  const topPages = useMemo(() => {
    const m: Record<string, number> = {};
    sessions.forEach((s) => {
      const k = s.first_page ?? "/";
      m[k] = (m[k] ?? 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [sessions]);

  const topViews = useMemo(() => {
    const m: Record<string, number> = {};
    views.forEach((v) => (m[v.slug] = (m[v.slug] ?? 0) + 1));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [views]);

  const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        {([1, 7, 30, 90] as Range[]).map((r) => (
          <button key={r} type="button" className={`btn ${range === r ? "solid" : ""}`} onClick={() => setRange(r)}>
            {r === 1 ? "Today" : `${r} days`}
          </button>
        ))}
        <span className="adm-small">{loading ? "Refreshing" : "Admin visits not counted. Refreshes every minute."}</span>
      </div>
      <div className="adm-stats">
        <Stat label="Visits" value={sessions.length} />
        <Stat label="Pages viewed" value={totalPages} />
        <Stat label="Avg visit length" value={fmt(avgDur)} />
        <Stat label="Left after one page" value={`${bounce}%`} />
      </div>
      <div className="card adm-card">
        <h2>Visits per day</h2>
        <div className="adm-bars">
          {daily.map(([d, c]) => (
            <div key={d} className="adm-bar" title={`${d}: ${c}`}>
              <span style={{ height: `${(c / maxDay) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="adm-two">
        <List title="Top landing pages" rows={topPages} />
        <List title="Most viewed reviews" rows={topViews} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card adm-stat">
      <h2>{label}</h2>
      <div className="adm-num">{value}</div>
    </div>
  );
}

function List({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="card adm-card">
      <h2>{title}</h2>
      <table>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td className="date">{v}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="more">No data yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
