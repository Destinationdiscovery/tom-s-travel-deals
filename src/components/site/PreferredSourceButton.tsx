// Google "Add to preferred sources" button.
// The library script (loaded in src/routes/__root.tsx) finds this div on page load
// and renders an auto-localized button inside it. The div has no React children,
// so React never touches what Google injects.
const BUTTON_ATTR = { "google-add-preferred-source-btn": "" } as Record<string, string>;

export default function PreferredSourceButton({ theme = "light" }: { theme?: "light" | "dark" }) {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "0.5rem" }}>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
        Want these rule updates in your Google results?
      </p>
      <div {...BUTTON_ATTR} data-theme={theme} suppressHydrationWarning />
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem" }}>
        <a href="https://www.google.com/preferences/source?q=reviewthengo.com" rel="noopener">
          Or add reviewthengo.com as a preferred source on Google
        </a>
      </p>
    </div>
  );
}
