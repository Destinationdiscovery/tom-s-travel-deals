import { createFileRoute } from "@tanstack/react-router";

// Temporary placeholder while the site is rebuilt (ported from the old src/App.tsx).
// All old pages are left in the repo but are no longer used by the app.
const Home = () => (
  <main
    style={{
      fontFamily: "system-ui, sans-serif",
      padding: "4rem 1.5rem",
      maxWidth: 640,
      margin: "0 auto",
    }}
  >
    <h1 style={{ fontSize: "2rem", margin: "0 0 1rem" }}>reviewthengo</h1>
    <p style={{ margin: 0 }}>Rebuild in progress.</p>
  </main>
);

export const Route = createFileRoute("/")({
  component: Home,
});
