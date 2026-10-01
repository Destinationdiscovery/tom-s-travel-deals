import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { checkAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { isAdmin } = await checkAdmin();
      if (!isAdmin) throw redirect({ to: "/account" });
    } catch (err) {
      if (err && typeof err === "object" && "to" in (err as any)) throw err;
      throw redirect({ to: "/account" });
    }
  },
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Studio dashboard | Aventura Sports Media" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminLayout() {
  return (
    <main className="wrap adm">
      <div className="adm-head">
        <span className="tc">Studio</span>
        <h1>Dashboard</h1>
      </div>
      <nav className="adm-nav">
        <Link to="/admin" activeOptions={{ exact: true }} activeProps={{ className: "on" }}>
          Overview
        </Link>
        <Link to="/admin/orders" activeProps={{ className: "on" }}>
          Orders
        </Link>
        <Link to="/admin/quotes" activeProps={{ className: "on" }}>
          Quotes/Calls
        </Link>
        <Link to="/admin/calendar" activeProps={{ className: "on" }}>
          Calendar
        </Link>
        <Link to="/admin/subscribers" activeProps={{ className: "on" }}>
          Subscribers
        </Link>
        <Link to="/admin/prospector" activeProps={{ className: "on" }}>
          Prospector
        </Link>
        <Link to="/admin/content" activeProps={{ className: "on" }}>
          Content
        </Link>
      </nav>
      <Outlet />
    </main>
  );
}
