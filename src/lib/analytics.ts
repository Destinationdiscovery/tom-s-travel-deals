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

export function trackEmailSignup(source: string, leadMagnet?: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "email_signup", {
      event_category: "conversion",
      event_label: source,
      lead_magnet: leadMagnet,
    });
  }
}

export function trackToolSearch(toolName: string, query: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "tool_search", {
      event_category: "tool",
      tool_name: toolName,
      query: query.slice(0, 100),
    });
  }
}

export function trackBlogRead(postSlug: string, category?: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "blog_read", {
      event_category: "content",
      post_slug: postSlug,
      blog_category: category,
    });
  }
}

export function trackPropertySaved(propertyName: string, destination?: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "property_saved", {
      event_category: "engagement",
      property_name: propertyName,
      destination,
    });
  }
}

export function trackItineraryGenerated(destination: string, duration?: string | number) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "itinerary_generated", {
      event_category: "tool",
      destination,
      duration: duration ? String(duration) : undefined,
    });
  }
}
