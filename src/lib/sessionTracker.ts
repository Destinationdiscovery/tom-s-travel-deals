import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "rtg-session-id";
const EXCLUDED_PREFIXES = ["/gear-admin", "/admin"];

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function isExcluded(path: string): boolean {
  // Never count visits from the admin's own devices
  if (localStorage.getItem("rtg-admin-device") === "1") return true;
  return EXCLUDED_PREFIXES.some((p) => path.startsWith(p));
}

let startTime = Date.now();
let currentPage = "";
let initialized = false;

function sendHeartbeat() {
  if (!currentPage || isExcluded(currentPage)) return;
  const duration = Math.round((Date.now() - startTime) / 1000);
  const sessionId = getSessionId();
  
  // Use sendBeacon for reliability on page unload
  const url = `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/track-review-view`;
  const payload = JSON.stringify({
    action: "session",
    session_id: sessionId,
    page: currentPage,
    duration,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
  } else {
    supabase.functions.invoke("track-review-view", {
      body: { action: "session", session_id: sessionId, page: currentPage, duration },
    }).catch(() => {});
  }
}

function trackPageChange() {
  const path = window.location.pathname;
  if (path === currentPage || isExcluded(path)) return;

  // Send heartbeat for previous page
  if (currentPage) {
    sendHeartbeat();
  }

  currentPage = path;
  startTime = Date.now();

  // For the first page in a new session, register it
  if (!initialized) {
    initialized = true;
    const sessionId = getSessionId();
    supabase.functions.invoke("track-review-view", {
      body: { action: "session", session_id: sessionId, page: currentPage, duration: 0 },
    }).catch(() => {});
  }
}

export function initSessionTracker() {
  trackPageChange();

  // Listen for route changes (SPA navigation)
  const origPushState = history.pushState.bind(history);
  const origReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    origPushState(...args);
    setTimeout(trackPageChange, 0);
  };
  history.replaceState = function (...args) {
    origReplaceState(...args);
    setTimeout(trackPageChange, 0);
  };
  window.addEventListener("popstate", () => setTimeout(trackPageChange, 0));

  // Send duration on visibility change and unload
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendHeartbeat();
    }
  });
  window.addEventListener("beforeunload", sendHeartbeat);

  // Periodic heartbeat every 30s
  setInterval(() => {
    if (document.visibilityState === "visible" && currentPage) {
      sendHeartbeat();
    }
  }, 30_000);
}
