import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface JsonLdData {
  [key: string]: unknown;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface AggregateRatingData {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
  itemReviewed: {
    type: string;
    name: string;
  };
}

interface AlternateLink {
  href: string;
  type?: string;
  hreflang?: string;
  rel?: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: JsonLdData | JsonLdData[];
  keywords?: string[];
  faq?: FAQItem[];
  aggregateRating?: AggregateRatingData;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  alternateUrls?: AlternateLink[];
}

const SITE_NAME = "ReviewThenGo";
const DEFAULT_IMAGE = "https://www.reviewthengo.com/og-image.jpg";
const BASE_URL = "https://www.reviewthengo.com";

const SEOHead = ({ title, description, image, url, type = "website", noindex, breadcrumbs, jsonLd, keywords, faq, aggregateRating, publishedTime, modifiedTime, author, alternateUrls }: SEOHeadProps) => {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const ogImage = image || DEFAULT_IMAGE;

  const breadcrumbJsonLd = breadcrumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: `${BASE_URL}${b.url}`,
        })),
      }
    : null;

  const faqJsonLd = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  const ratingJsonLd = aggregateRating
    ? {
        "@context": "https://schema.org",
        "@type": aggregateRating.itemReviewed.type,
        name: aggregateRating.itemReviewed.name,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.ratingValue,
          reviewCount: aggregateRating.reviewCount,
          bestRating: aggregateRating.bestRating || 5,
          worstRating: aggregateRating.worstRating || 1,
        },
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl.split("?")[0]} />
      {alternateUrls?.map((alt) => (
        <link
          key={`${alt.rel || "alternate"}-${alt.href}`}
          rel={alt.rel || "alternate"}
          href={alt.href}
          {...(alt.type ? { type: alt.type } : {})}
          {...(alt.hreflang ? { hrefLang: alt.hreflang } : {})}
        />
      ))}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      {type === "article" && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === "article" && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === "article" && author && <meta property="article:author" content={author} />}
      {type === "article" && keywords?.map((kw) => (
        <meta key={kw} property="article:tag" content={kw} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@TomLaracyTravel" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {breadcrumbJsonLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      )}
      {faqJsonLd && (
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      )}
      {ratingJsonLd && (
        <script type="application/ld+json">{JSON.stringify(ratingJsonLd)}</script>
      )}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
