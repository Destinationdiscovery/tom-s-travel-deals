import { createRoot } from "react-dom/client";
// @ts-ignore - virtual module provided by vite-plugin-pwa
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { initSessionTracker } from "./lib/sessionTracker";

createRoot(document.getElementById("root")!).render(<App />);

// Register PWA service worker with auto-update and force activation
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
});

// Initialize session tracking
initSessionTracker();

// Initialize Web Vitals tracking in production
if (import.meta.env.PROD) {
  import("./lib/vitals").then(({ initVitals }) => initVitals()).catch(() => {});
}
