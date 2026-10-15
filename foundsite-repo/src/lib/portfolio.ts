import brantfordHero from "@/assets/portfolio/brantfordtoprealtor-hero.png.asset.json";
import closingHero from "@/assets/portfolio/closingclearance-hero.png.asset.json";
import reviewThenGoHero from "@/assets/portfolio/reviewthengo-hero.png.asset.json";
import walnutHero from "@/assets/portfolio/walnutlandscaping-hero.png.asset.json";

export type PortfolioCategory = "Local Business" | "Real Estate" | "Web Apps";

export type PortfolioItem = {
  name: string;
  domain: string;
  url: string;
  image: string;
  /** Used automatically if the primary image fails to load. */
  fallbackImage?: string;
  description: string;
  category: PortfolioCategory;
};

export const PORTFOLIO_CATEGORIES: ("All" | PortfolioCategory)[] = [
  "All",
  "Local Business",
  "Real Estate",
  "Web Apps",
];

export const CATEGORY_COLOR: Record<PortfolioCategory, string> = {
  "Local Business": "#00c27a",
  "Real Estate": "#3b82f6",
  "Web Apps": "#a855f7",
};

export const PORTFOLIO: PortfolioItem[] = [
  {
    name: "BrantfordTopRealtor.com",
    domain: "brantfordtoprealtor.com",
    url: "https://brantfordtoprealtor.com",
    image: "https://screenshot2.lovable.dev/lovp_2nadybypep99ks4cmq72kd35qn/b1c314e766b2ae6ab0cf43c1172389be_1791989235920.png",
    fallbackImage: brantfordHero.url,
    description:
      "Brantford realtor site with MLS listings, a home valuation tool and a local SEO content plan. Built for Jake Laracy, a Silver Community Votes 2026 winner.",
    category: "Real Estate",
  },
  {
    name: "ClosingClearance.com",
    domain: "closingclearance.com",
    url: "https://closingclearance.com",
    image: closingHero.url,
    description:
      "Full-featured real estate site for Mackenzie Cole at Pay It Forward Realty. MLS listings, buyer and seller guides, mortgage calculator, and blog.",
    category: "Real Estate",
  },
  {
    name: "WalnutLandscaping.ca",
    domain: "walnutlandscaping.ca",
    url: "https://walnutlandscaping.ca",
    image: walnutHero.url,
    description:
      "Professional landscaping company site for Guelph and surrounding areas. Services, gallery, process steps, and free quote CTA.",
    category: "Local Business",
  },
  {
    name: "ReviewThenGo.com",
    domain: "reviewthengo.com",
    url: "https://www.reviewthengo.com",
    image: "https://screenshot2.lovable.dev/lovp_04nemxjagx8vsvc0p2z867r6g5/7f697e77baef4405dc50bfd0bf2f2f09_1792023603326.png",
    fallbackImage: reviewThenGoHero.url,
    description:
      "Free, sourced entry rules and tools for Canadians flying to the UK and Europe. Every rule shows its source and the day it was last checked.",
    category: "Web Apps",
  },
];
