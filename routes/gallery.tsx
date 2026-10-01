import { createFileRoute, Link } from "@tanstack/react-router";
import { GalleryGrid } from "../components/GalleryGrid";
import { getSiteContent } from "../lib/content.functions";
import { EMPTY_CONTENT, slotImage, siteText, sectionItems } from "../lib/site-content";

export const Route = createFileRoute("/gallery")({
  loader: () => getSiteContent(),
  head: () => ({
    meta: [
      { title: "Gallery | Aventura Sports Media" },
      {
        name: "description",
        content: "Game photos, clips, player cards and more from the work Aventura Sports Media has made.",
      },
      { property: "og:title", content: "Gallery | Aventura Sports Media" },
      { property: "og:description", content: "Game photos, clips, player cards and more." },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const content = Route.useLoaderData() ?? EMPTY_CONTENT;
  const hero = slotImage(content.images, "gallery_hero");
  const items = sectionItems(content.showcase, "gallery_items").filter((i) => i.thumbnail_url || i.video_url);

  return (
    <>
      <section className="phead">
        <div className="hero-bg">
          <img src={hero.src} alt={hero.alt} style={{ objectPosition: `${hero.focalX}% ${hero.focalY}%` }} />
          <div className="lines" />
          <div className="veil" />
          <div className="grain" />
        </div>
        <div className="wrap">
          <Link className="crumb" to="/">
            &larr; Back to home
          </Link>
          <h1>Gallery</h1>
          <p className="lead" style={{ marginTop: 20 }}>
            {siteText(content.text, "gallery_intro")}
          </p>
          <div className="hero-cta" style={{ marginTop: 26 }}>
            <Link className="btn btn-rec" to="/order">
              <span className="dot" /> Start an order
            </Link>
            <Link className="btn btn-ghost" to="/reels">
              See highlight reels
            </Link>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 56 }}>
        <div className="wrap">
          {items.length > 0 ? (
            <GalleryGrid items={items} aspect="wide" />
          ) : (
            <p className="lead">New work is on the way. Check back soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
