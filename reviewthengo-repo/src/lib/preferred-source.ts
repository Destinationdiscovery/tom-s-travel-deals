// Shared trigger for Google's Preferred Sources flow.
// The root route loads Google's library in manual mode, so nothing renders by itself.
// Both the footer button and the floating badge call addPreferredSource() below.

type PreferredSourceApi = {
  init: (options: { theme?: "light" | "dark"; lang?: string }) => void;
  addPreferredSource: () => void;
};

declare global {
  interface Window {
    PREFERRED_SOURCE?: Array<(ps: PreferredSourceApi) => void>;
  }
}

export const PREFERRED_SOURCE_DEEPLINK = "https://www.google.com/preferences/source?q=reviewthengo.com";

let api: PreferredSourceApi | null = null;
let queued = false;

export function initPreferredSource() {
  if (typeof window === "undefined" || queued) return;
  queued = true;
  const queue = (window.PREFERRED_SOURCE = window.PREFERRED_SOURCE || []);
  queue.push((ps) => {
    try {
      ps.init({ theme: "light" });
      api = ps;
    } catch {
      api = null;
    }
  });
}

export function addPreferredSource() {
  // Use Google's in-page flow when the library has loaded. Otherwise (ad blockers,
  // slow network) fall back to the plain link so the click always does something.
  if (api) {
    try {
      api.addPreferredSource();
      return;
    } catch {
      // fall through to the link
    }
  }
  window.open(PREFERRED_SOURCE_DEEPLINK, "_blank", "noopener");
}
