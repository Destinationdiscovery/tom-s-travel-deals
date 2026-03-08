import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register PWA service worker with auto-update
registerSW({ immediate: true });

// Initialize Web Vitals tracking in production
if (import.meta.env.PROD) {
  import("./lib/vitals").then(({ initVitals }) => initVitals()).catch(() => {});
}
