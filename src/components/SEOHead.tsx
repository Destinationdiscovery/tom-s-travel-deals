import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface JsonLdData {
  [key: string]: unknown;
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
}

const SITE_NAME = "ReviewThenGo";
const DEFAULT_IMAGE = "https://reviewthengo.lovable.app/og-image.jpg";
const BASE_URL = "https://reviewthengo.lovable.app";

const SEOHead = ({ title, description, image, url, type = "website", noindex, breadcrumbs, jsonLd, keywords }: SEOHeadProps) => {
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

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl.split("?")[0]} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@TomLaracyTravel" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {breadcrumbJsonLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      )}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
