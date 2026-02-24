import type { Metric } from "web-vitals";
import { supabase } from "@/integrations/supabase/client";

function sendToDatabase(metric: Metric) {
  // Fire and forget - don't block the main thread
  supabase.functions.invoke("track-review-view", {
    body: {
      action: "vitals",
      metric_name: metric.name,
      value: Math.round(metric.value * 100) / 100,
      page: window.location.pathname,
    },
  }).catch(() => {});
}

export async function initVitals() {
  try {
    const { onCLS, onLCP, onINP, onTTFB } = await import("web-vitals");
    onCLS(sendToDatabase);
    onLCP(sendToDatabase);
    onINP(sendToDatabase);
    onTTFB(sendToDatabase);
  } catch {
    // web-vitals not available
  }
}
