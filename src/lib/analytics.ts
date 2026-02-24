import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackAffiliateClick(platform: string, page: string, position: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "affiliate_click", {
      event_category: "affiliate",
      event_label: platform,
      page,
      position,
    });
  }

  // Also track in database (non-blocking)
  supabase.functions.invoke("track-review-view", {
    body: { action: "affiliate_click", platform, page, position },
  }).catch(() => {});
}

export function trackEmailSignup(source: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "email_signup", {
      event_category: "conversion",
      event_label: source,
    });
  }
}
