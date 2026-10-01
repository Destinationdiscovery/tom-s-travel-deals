import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminOverview } from "@/lib/admin.functions";
import { getFollowUpCount } from "@/lib/outreach.functions";
import { ageDays, fmtDate, isOverdue, label, money } from "@/lib/admin-ui";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Overview() {
  const fetchOverview = useServerFn(adminOverview);
  const fetchDue = useServerFn(getFollowUpCount);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fetchOverview(),
  });
  const dueQuery = useQuery({
    queryKey: ["admin", "prospect-due"],
    queryFn: () => fetchDue(),
  });

  if (isLoading) return <p className="adm-empty">Loading the board.</p>;
  if (error) return <p className="adm-empty">Could not load the dashboard.</p>;
  if (!data) return null;

  const c = data.counts;
  const due = dueQuery.data?.due ?? 0;
  const tiles = [
    { n: c.open, label: "Open orders", to: "/admin/orders", search: { view: "open" } },
    { n: c.awaitingPayment, label: "Awaiting payment", to: "/admin/orders", search: { status: "awaiting_payment" } },
    { n: c.dueThisWeek, label: "Due this week", to: "/admin/orders", search: { view: "due" } },
    { n: c.overdue, label: "Overdue", to: "/admin/orders", search: { view: "overdue" }, hot: c.overdue > 0 },
    { n: c.newQuotes, label: "New quote requests", to: "/admin/quotes", search: { status: "new" } },
  ];

  return (
    <>
      <div className="adm-tiles">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} search={t.search as never} className={t.hot ? "adm-tile hot" : "adm-tile"}>
            <b>{t.n}</b>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>

      <div className="adm-tiles" style={{ marginTop: -8 }}>
        <Link to="/admin/prospector" search={{ due: "1" } as never} className={due > 0 ? "adm-tile hot" : "adm-tile"}>
          <b>{due}</b>
          <span>Lead follow-ups due</span>
        </Link>
      </div>

      <div className="adm-two">
        <section className="adm-card">
          <h2>Latest orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="adm-empty">No orders yet.</p>
          ) : (
            <ul className="adm-list">
              {data.recentOrders.map((o: any) => (
                <li key={o.id}>
                  <Link to="/admin/orders/$orderId" params={{ orderId: o.id }}>
                    <b>{o.athletes?.name || o.contact_name || o.title || "Untitled"}</b>
                    <span>
                      {label(o.service_type)} &middot; {money(o.amount_cents, o.currency)} &middot;{" "}
                      <em className={isOverdue(o.due_date, o.status) ? "late" : undefined}>{label(o.status)}</em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-card">
          <h2>Latest quote requests</h2>
          {data.recentQuotes.length === 0 ? (
            <p className="adm-empty">No quote requests yet.</p>
          ) : (
            <ul className="adm-list">
              {data.recentQuotes.map((q: any) => (
                <li key={q.id}>
                  <Link to="/admin/quotes/$quoteId" params={{ quoteId: q.id }}>
                    <b>{q.contact_name || q.contact_email}</b>
                    <span>
                      {label(q.service_type)} &middot; {fmtDate(q.event_date)} &middot; {ageDays(q.created_at)}d old
                      &middot; {label(q.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
