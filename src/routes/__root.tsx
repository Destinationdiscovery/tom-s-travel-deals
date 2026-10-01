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
import { SITE_URL } from "@/lib/site";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import appCss from "../styles.css?url";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "reviewthengo",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`,
      sameAs: ["https://www.instagram.com/reviewthengo"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "reviewthengo",
      description:
        "Worldwide travel rules, dated and sourced. Border systems, passenger rights and entry rules, with the source and the date we last checked.",
      publisher: { "@id": `${SITE_URL}/#organization` },
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
      { title: "reviewthengo: travel rules, dated and sourced" },
      {
        name: "description",
        content:
          "Border systems, passenger rights and entry rules change with little warning. Every answer names its source and the day we last checked it.",
      },
      { name: "theme-color", content: "#E7EAE3" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "reviewthengo" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap",
      },
    ],
    scripts: [
      // Google tag (gtag.js), unchanged from before
      { src: "https://www.googletagmanager.com/gtag/js?id=G-NX8EH57X1W", async: true },
      {
        children:
          "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-NX8EH57X1W');",
      },
      // Google AdSense, unchanged from before
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

  // Session tracking + Web Vitals (browser-only), kept from the previous setup
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
      <a className="skip" href="#content">
        Skip to content
      </a>
      <SiteHeader />
      <div id="content">
        <Outlet />
      </div>
      <SiteFooter />
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <main className="plain">
      <h1>Page not found</h1>
      <p>
        This page does not exist. <a href="/">Go back home</a>.
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
    <main className="plain">
      <h1>This page did not load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <p>
        <button className="btn solid" type="button" onClick={() => location.reload()}>
          Try again
        </button>{" "}
        <a className="btn" href="/">
          Go home
        </a>
      </p>
    </main>
  );
}
