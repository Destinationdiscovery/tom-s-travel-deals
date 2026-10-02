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
import { OG_IMAGE, OG_IMAGE_ALT, siteGraph } from "@/lib/seo";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import appCss from "../styles.css?url";

const SITE_TITLE = "Flight Compensation, EES and Insurance Rules | reviewthengo";
const SITE_DESCRIPTION =
  "Dated, sourced travel rules: flight delay compensation (Canada, EU, UK, US), EES border queues and travel insurance appeals. We label what we cannot confirm.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
      },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#E7EAE3" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "reviewthengo" },
      { property: "og:locale", content: "en" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: OG_IMAGE_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: OG_IMAGE_ALT },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
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
        children: JSON.stringify(siteGraph),
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
        This page does not exist. <a href="/">Go back home</a>, or see the{" "}
        <a href="/flight-claims">flight claim guide</a>, the <a href="/insurance-appeal">insurance appeal pack</a> and
        the <a href="/connection-check">connection check</a>.
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
