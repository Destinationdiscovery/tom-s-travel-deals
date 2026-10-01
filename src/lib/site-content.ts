/**
 * Client-safe content types, defaults and fallback helpers.
 * Nothing here touches the server.
 */

import homeHeroSports from "@/assets/home-hero-sports.jpg";

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  sort_order: number;
  published: boolean;
  focal_x: number;
  focal_y: number;
}

export interface ShowcaseItem {
  id: string;
  section: string;
  title: string;
  tag: string;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  sport: string | null;
  fallback_art: string | null;
  fallback_src: string | null;
  meta: { stats?: [string, string][]; num?: string } | null;
  sort_order: number;
  published: boolean;
  focal_x: number;
  focal_y: number;
}

export interface SiteImage {
  slot: string;
  image_url: string | null;
  alt_text: string;
  opacity_percent: number;
  focal_x: number;
  focal_y: number;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  quote: string;
  sport: string | null;
  sort_order: number;
  published: boolean;
}

export interface SiteContent {
  founders: Founder[];
  showcase: ShowcaseItem[];
  images: SiteImage[];
  testimonials: Testimonial[];
  text: Record<string, string>;
}

export const EMPTY_CONTENT: SiteContent = {
  founders: [],
  showcase: [],
  images: [],
  testimonials: [],
  text: {},
};

/** The copy the pages shipped with. Used whenever a site_text row is missing or blank. */
export const TEXT_DEFAULTS: Record<string, string> = {
  home_hero_subhead: "Send us your footage, or we come to your game. For athletes and clubs.",
  reels_intro:
    "One to two minutes of your best film, built the way coaches watch it. Send us your game video or book us to shoot it.",
  gallery_intro: "Game photos, clips, player cards and more from the work we have made.",
  promo_intro: "One designed image with the photo, the stats and the milestone on it, ready to post or print.",
  photography_intro:
    "We bring the camera to you. Gameday action, portraits, media days and full team shoots. Every booking is quoted, because no two jobs are the same size.",
  coverage_note:
    "Home base is Brantford. Travel is included inside a 45 minute drive, and we quote a flat rate beyond that.",
};

export const TEXT_KEYS = Object.keys(TEXT_DEFAULTS);

export const TEXT_LABELS: Record<string, string> = {
  home_hero_subhead: "Home page hero subheading",
  reels_intro: "Highlight reels intro",
  gallery_intro: "Gallery intro",
  promo_intro: "Promo cards intro",
  photography_intro: "Photography intro",
  coverage_note: "Travel and coverage note",
};

/**
 * Every picture slot on the public site, in the order it appears on the page.
 * slot and label are what the site already uses. pageName, where, note, shape,
 * art and cta only describe the slot for the dashboard, so the dashboard can
 * look like the public page it feeds.
 */
export const IMAGE_SLOTS = [
  {
    slot: "home_hero",
    label: "Game photos, video and recruiting reels.",
    page: "/",
    pageName: "Home page",
    where: "Top banner, behind the main heading",
    note: "A wide picture behind the big heading at the very top of the home page. The visibility slider fades it.",
    shape: "banner",
    art: "art-box",
    cta: "",
  },
  {
    slot: "home_highlight_reels",
    label: "Highlight reels",
    page: "/",
    pageName: "Home page",
    where: "Services section, first card",
    note: "The picture at the top of the Highlight reels card. A play button sits on top of it once you upload a photo.",
    shape: "service",
    art: "art-ice",
    cta: "See examples and pricing \u2192",
  },
  {
    slot: "home_promo_cards",
    label: "Promo cards",
    page: "/",
    pageName: "Home page",
    where: "Services section, second card, right beside Highlight reels",
    note: "The picture at the top of the Promo cards card. A finished card works well here.",
    shape: "service",
    art: "art-box",
    cta: "See the cards and pricing \u2192",
  },
  {
    slot: "home_photography",
    label: "Photography services",
    page: "/",
    pageName: "Home page",
    where: "Services section, third card",
    note: "The picture at the top of the Photography services card.",
    shape: "service",
    art: "art-turf",
    cta: "See the services \u2192",
  },
  {
    slot: "home_gallery",
    label: "Gallery",
    page: "/",
    pageName: "Home page",
    where: "Services section, fourth card",
    note: "The picture at the top of the Gallery card.",
    shape: "service",
    art: "art-box",
    cta: "See the gallery \u2192",
  },
  {
    slot: "home_cta",
    label: "Your film is sitting on someone's phone",
    page: "/",
    pageName: "Home page",
    where: "Red banner at the very bottom of the page",
    note: "A faint picture behind the red Start a reel banner. It shows through at about a quarter strength.",
    shape: "band",
    art: "art-box",
    cta: "",
  },
  {
    slot: "reels_hero",
    label: "Coaches give you ninety seconds",
    page: "/reels",
    pageName: "Highlight Reels page",
    where: "Top banner, behind the main heading",
    note: "A wide picture behind the heading at the top of the Highlight Reels page.",
    shape: "banner",
    art: "art-box",
    cta: "",
  },
  {
    slot: "reels_coverage",
    label: "Where we film",
    page: "/reels",
    pageName: "Highlight Reels page",
    where: "Where we film section, strip above the map",
    note: "The wide strip sitting on top of the Southern Ontario map near the bottom of the page.",
    shape: "strip",
    art: "art-turf",
    cta: "",
  },
  {
    slot: "promo_hero",
    label: "Promo cards",
    page: "/promo-cards",
    pageName: "Promo Cards page",
    where: "Top banner, behind the main heading",
    note: "A wide picture behind the heading at the top of the Promo Cards page.",
    shape: "banner",
    art: "art-box",
    cta: "",
  },
  {
    slot: "promo_feature",
    label: "What a promo card looks like",
    page: "/promo-cards",
    pageName: "Promo Cards page",
    where: "Featured card, next to the description",
    note: "A picture of a finished promo card, shown tall next to the description near the top of the page. Upload the card itself, not a photo of a player.",
    shape: "feature",
    art: "art-box",
    cta: "",
  },
  {
    slot: "photography_hero",
    label: "Photography services",
    page: "/photography",
    pageName: "Photography page",
    where: "Top banner, behind the main heading",
    note: "A wide picture behind the heading at the top of the Photography page.",
    shape: "banner",
    art: "art-box",
    cta: "",
  },
  {
    slot: "photography_filming",
    label: "Across Southern Ontario",
    page: "/photography",
    pageName: "Photography page",
    where: "Where we film section, strip above the map",
    note: "The wide strip sitting on top of the Southern Ontario map near the bottom of the page.",
    shape: "strip",
    art: "art-turf",
    cta: "",
  },
  {
    slot: "gallery_hero",
    label: "Gallery",
    page: "/gallery",
    pageName: "Gallery page",
    where: "Top banner, behind the main heading",
    note: "A wide picture behind the heading at the top of the Gallery page.",
    shape: "banner",
    art: "art-box",
    cta: "",
  },
  {
    slot: "clubs_hero",
    label: "Your club is a media operation now",
    page: "/clubs",
    pageName: "Clubs page",
    where: "Top banner, behind the main heading",
    note: "A wide picture behind the heading at the top of the Clubs page.",
    shape: "banner",
    art: "art-box",
    cta: "",
  },
] as const;

export const IMAGE_SLOT_FALLBACK: Record<string, string> = {
  home_hero: homeHeroSports,
  home_highlight_reels: "/art/f0585cb0.svg",
  home_promo_cards: "/art/d5ff6126.svg",
  home_photography: "/art/02883205.svg",
  home_gallery: "/art/c9a24614.svg",
  home_cta: "/art/0807f9b6.svg",
  reels_hero: "/art/0202d222.svg",
  reels_coverage: "/art/6efe55f8.svg",
  promo_hero: "/art/d5ff6126.svg",
  promo_feature: "/art/d5ff6126.svg",
  photography_hero: "/art/c9a24614.svg",
  photography_filming: "/art/6efe55f8.svg",
  gallery_hero: "/art/c9a24614.svg",
  clubs_hero: "/art/c9a24614.svg",
};

/** The placeholder picture the public site shows for a slot with no upload. */
export function slotFallback(slot: string): string | null {
  return IMAGE_SLOT_FALLBACK[slot] ?? null;
}

/**
 * Every group of example cards on the public site. As with IMAGE_SLOTS, section
 * and label are what the site already uses, and the rest describes where the
 * cards appear so the dashboard can show them the same way.
 */
export const SHOWCASE_SECTIONS = [
  {
    section: "reels_examples",
    label: "Two cuts, one shoot",
    page: "/reels",
    pageName: "Highlight Reels page",
    where: "Examples section",
    note: "Two cards side by side. Each has a picture, a title, a tag on the right and a short description.",
    shape: "reel-wide",
  },
  {
    section: "promo_gallery",
    label: "Promo cards we have made",
    page: "/promo-cards",
    pageName: "Promo Cards page",
    where: "Promo cards we have made section",
    note: "Finished cards shown in a grid. The whole section stays hidden until you add one, so there are never empty slots. Visitors can tap a card to enlarge it.",
    shape: "tile-tall",
  },
  {
    section: "photography_examples",
    label: "Four ways to book us",
    page: "/photography",
    pageName: "Photography page",
    where: "What we shoot section",
    note: "Cards sit two across. Each has a picture, a small tag, a title and a description.",
    shape: "service",
  },
  {
    section: "gallery_items",
    label: "Gallery",
    page: "/gallery",
    pageName: "Gallery page",
    where: "The gallery grid",
    note: "Everything here shows in the gallery: game photos, clips, player cards, anything. The tag groups things, so visitors get filter buttons like Game photo, Clip or Player card. Nothing shows until you add it, so there are never empty slots.",
    shape: "tile",
  },
  {
    section: "clubs_work",
    label: "Already doing this",
    page: "/clubs",
    pageName: "Clubs page",
    where: "Current work section",
    note: "Cards run three across and only the first six show. Each has a picture, a title and a tag.",
    shape: "reel",
  },
] as const;

/** Stored uploads are object paths in the private `site` bucket, served through our own route. */
export function mediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return `/api/public/site-image/${value}`;
}

/** Image slot with its SVG fallback. Never returns an empty string. */
export function slotImage(images: SiteImage[], slot: string): { src: string; alt: string; opacity: number; focalX: number; focalY: number } {
  const row = images.find((i) => i.slot === slot);
  const src = mediaUrl(row?.image_url) ?? IMAGE_SLOT_FALLBACK[slot] ?? "/art/0202d222.svg";
  const opacity = Math.min(1, Math.max(0, (row?.opacity_percent ?? 60) / 100));
  return { src, alt: row?.alt_text ?? "", opacity, focalX: row?.focal_x ?? 50, focalY: row?.focal_y ?? 50 };
}

export function sectionItems(showcase: ShowcaseItem[], section: string): ShowcaseItem[] {
  return showcase.filter((i) => i.section === section).sort((a, b) => a.sort_order - b.sort_order);
}

/** Thumbnail fallback chain: uploaded thumbnail, then the seeded SVG art, then the generic placeholder. */
export function thumbSrc(item: ShowcaseItem): string {
  return mediaUrl(item.thumbnail_url) ?? item.fallback_src ?? "/art/0202d222.svg";
}

export function focalStyle(item: { focal_x?: number | null; focal_y?: number | null }) {
  return { objectPosition: `${item.focal_x ?? 50}% ${item.focal_y ?? 50}%` };
}

export function artClass(item: ShowcaseItem): string {
  return item.fallback_art ?? "art-box";
}

export function siteText(text: Record<string, string>, key: string): string {
  const v = text[key];
  return v && v.trim() ? v : (TEXT_DEFAULTS[key] ?? "");
}

/** Turns a YouTube or Vimeo link into an embed URL. Direct mp4 links pass through. */
export function embedFor(url: string): { kind: "iframe" | "video"; src: string } | null {
  const u = url.trim();
  if (!u) return null;
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(u)) return { kind: "video", src: u };
  return { kind: "iframe", src: u };
}
