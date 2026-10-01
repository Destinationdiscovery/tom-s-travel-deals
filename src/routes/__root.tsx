import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

// Baseline JSON-LD visible to AI crawlers without executing JavaScript (ported from index.html)
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "TravelAgency"],
      "@id": "https://www.reviewthengo.com/#organization",
      name: "ReviewThenGo",
      url: "https://www.reviewthengo.com",
      logo: "https://www.reviewthengo.com/favicon.png",
      description:
        "ReviewThenGo is an AI travel answer engine and all-in-one travel planning tool. It aggregates unbiased hotel and resort reviews from more than ten trusted sources, offers free travel tools (best time to visit, itineraries, packing lists, flight deals, currency rates, safety scores, visa and entry requirements), and publishes the Compass blog with expert travel guides and trend reports.",
      founder: { "@type": "Person", name: "Tom" },
      sameAs: ["https://x.com/TomLaracyTravel", "https://www.instagram.com/reviewthengo"],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.reviewthengo.com/#website",
      url: "https://www.reviewthengo.com",
      name: "ReviewThenGo",
      publisher: { "@id": "https://www.reviewthengo.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.reviewthengo.com/destinations?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      name: "ReviewThenGo",
      url: "https://www.reviewthengo.com",
      applicationCategory: "TravelApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "AI hotel and resort reviews aggregated from 10+ trusted sources",
        "Best time to visit any destination with weather, crowds, and pricing",
        "Day-by-day travel itinerary builder",
        "Personalized trip packing list generator",
        "Live flight deals finder with booking links",
        "Live currency exchange rate tracker and converter",
        "Destination safety scores, scams, and emergency information",
        "Visa and entry requirements, government travel advisories, destination news",
        "Compass blog with expert travel guides and travel trend reporting",
      ],
    },
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
      },
      {
        title:
          "ReviewThenGo: AI Travel Planner. Every Travel Question Answered Before You Book",
      },
      {
        name: "description",
        content:
          "Get instant answers about hotels, destinations, packing, and the best time to visit. Free AI travel planner powered by 10+ trusted review sources.",
      },
      { name: "author", content: "Tom" },
      { name: "theme-color", content: "#003366" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "ReviewThenGo" },
      { name: "mobile-web-app-capable", content: "yes" },
      {
        property: "og:title",
        content:
          "ReviewThenGo: AI Travel Planner. Every Travel Question Answered Before You Book",
      },
      {
        property: "og:description",
        content:
          "Get instant answers about hotels, destinations, packing, and the best time to visit. Free AI travel planner powered by 10+ trusted review sources.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.reviewthengo.com/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@TomLaracyTravel" },
      { name: "twitter:image", content: "https://www.reviewthengo.com/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "The Compass by ReviewThenGo",
        href: "https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-rss",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700&display=swap",
        as: "style",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700&display=swap",
      },
    ],
    scripts: [
      // Google tag (gtag.js) — ported from index.html
      { src: "https://www.googletagmanager.com/gtag/js?id=G-NX8EH57X1W", async: true },
      {
        children:
          "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-NX8EH57X1W');",
      },
      // Google AdSense — ported from index.html
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7122383865667044",
        async: true,
        crossOrigin: "anonymous",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(structuredData),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // ported from main.tsx: session tracking + Web Vitals (browser-only init)
  useEffect(() => {
    import("@/lib/sessionTracker")
      .then(({ initSessionTracker }) => initSessionTracker())
      .catch(() => {});
    if (import.meta.env.PROD) {
      import("@/lib/vitals").then(({ initVitals }) => initVitals()).catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "4rem 1.5rem",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "2rem", margin: "0 0 1rem" }}>Page not found</h1>
      <p style={{ margin: 0 }}>
        This page doesn&apos;t exist. <a href="/">Go back home</a>.
      </p>
    </main>
  );
}

function RootErrorComponent({ error }: ErrorComponentProps) {
  console.error(error);

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "4rem 1.5rem",
        maxWidth: 448,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>This page didn&apos;t load</h1>
      <p style={{ color: "#4b5563", margin: "0 0 1.5rem" }}>
        Something went wrong on our end. You can try refreshing or head back home.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            background: "#111",
            color: "#fff",
            border: "1px solid transparent",
            cursor: "pointer",
          }}
          onClick={() => location.reload()}
        >
          Try again
        </button>
        <a
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            background: "#fff",
            color: "#111",
            border: "1px solid #d1d5db",
            textDecoration: "none",
          }}
          href="/"
        >
          Go home
        </a>
      </div>
    </main>
  );
}
