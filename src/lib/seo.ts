// One place for page titles, descriptions, social tags and structured data.
// Every route builds its <head> with pageHead(), so nothing is repeated or forgotten.

import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

export const SITE_NAME = "reviewthengo";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const OG_IMAGE_ALT =
  "reviewthengo: travel rules, dated and sourced. Flight compensation, EES border queues and travel insurance appeals.";

export type Crumb = { name: string; path: string };
export type FaqLike = { q: string; a: string };

type Options = {
  title: string;
  description: string;
  path: string;
  modified: string; // ISO date, for example 2026-10-02
  crumbs?: Crumb[];
  faq?: FaqLike[];
  css?: string;
  type?: "WebPage" | "AboutPage" | "Article";
  published?: string;
};

export function pageHead(o: Options) {
  const url = `${SITE_URL}${o.path === "/" ? "/" : o.path}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": o.type ?? "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: o.title,
      description: o.description,
      inLanguage: "en",
      dateModified: o.modified,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE },
      ...(o.crumbs && o.crumbs.length > 1 ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    },
  ];

  if (o.type === "Article") {
    Object.assign(graph[0] ?? {}, {
      "@type": "Article",
      headline: o.title,
      datePublished: o.published ?? o.modified,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    });
  }

  if (o.crumbs && o.crumbs.length > 1) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: o.crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: `${SITE_URL}${c.path}`,
      })),
    });
  }

  if (o.faq && o.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: o.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return {
    meta: [
      { title: o.title },
      { name: "description", content: o.description },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: o.type === "Article" ? "article" : "website" },
      ...(o.type === "Article"
        ? [
            { property: "article:published_time", content: o.published ?? o.modified },
            { property: "article:modified_time", content: o.modified },
          ]
        : []),
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en" },
      { property: "og:title", content: o.title },
      { property: "og:description", content: o.description },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: OG_IMAGE_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: o.title },
      { name: "twitter:description", content: o.description },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: OG_IMAGE_ALT },
    ],
    links: [
      { rel: "canonical", href: url },
      ...(o.css ? [{ rel: "stylesheet", href: o.css }] : []),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      },
    ],
  };
}

export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`,
      email: CONTACT_EMAIL,
      description:
        "Worldwide travel rules, dated and sourced: flight delay compensation, EES border queues and travel insurance appeals, each with its source and the date we last checked it.",
      contactPoint: { "@type": "ContactPoint", email: CONTACT_EMAIL, contactType: "corrections" },
      sameAs: ["https://www.instagram.com/reviewthengo"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en",
      description:
        "Worldwide travel rules, dated and sourced. Flight delay compensation rules for Canada, the EU, the UK and the US, EES border queues, and travel insurance claim appeals.",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};
