import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "../components/Photo";
import { Faq } from "../components/Faq";
import { GalleryGrid } from "../components/GalleryGrid";
import { cardPlans, cardAddons } from "../config/pricing";
import { getSiteContent } from "../lib/content.functions";
import { EMPTY_CONTENT, slotImage, siteText, sectionItems } from "../lib/site-content";

export const Route = createFileRoute("/promo-cards")({
  loader: () => getSiteContent(),
  head: () => ({
    meta: [
      { title: "Promo Cards for Athletes and Teams | Aventura Sports Media" },
      {
        name: "description",
        content: `Designed promo cards for player and team accolades and achievements. From $${cardPlans.single.price}.`,
      },
      { property: "og:title", content: "Promo Cards | Aventura Sports Media" },
      { property: "og:description", content: "One designed image with the photo, the stats and the milestone on it." },
      { property: "og:url", content: "/promo-cards" },
    ],
    links: [{ rel: "canonical", href: "/promo-cards" }],
  }),
  component: PromoCardsPage,
});

const faqs = [
  {
    q: "Where do the stats on a promo card come from?",
    a: "You send them. League site, team sheet, or a screenshot works. We put on the page exactly what you give us, nothing padded, so the card holds up when a coach checks it.",
  },
  {
    q: "What kind of photo do you need for a promo card?",
    a: "The highest resolution you have. Action shots look best but a clean headshot works too. We cut the background out either way.",
  },
  {
    q: "What sizes do I get?",
    a: "Square for Instagram, vertical for stories, horizontal for email signatures, and a print ready file at 300 dpi.",
  },
];

function PromoCardsPage() {
  const content = Route.useLoaderData() ?? EMPTY_CONTENT;
  const hero = slotImage(content.images, "promo_hero");
  const feature = slotImage(content.images, "promo_feature");
  const made = sectionItems(content.showcase, "promo_gallery").filter((i) => i.thumbnail_url || i.video_url);
  const orderCard = { service: "promo_card", plan: cardPlans.single.key } as const;

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
          <h1>Promo cards</h1>
          <p className="lead" style={{ marginTop: 20 }}>
            {siteText(content.text, "promo_intro")}
          </p>
          <p className="service-crosslink">
            Already ordering a reel? Add a card for ${cardAddons.addedToOrder.price}. <Link to="/reels">See highlight reels.</Link>
          </p>
          <div className="hero-cta" style={{ marginTop: 26 }}>
            <Link className="btn btn-rec" to="/order" search={orderCard}>
              <span className="dot" /> Order a card
            </Link>
            <a className="btn btn-ghost" href="#pricing">
              See pricing
            </a>
          </div>
        </div>
      </section>

      <section id="what">
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">What it is</span>
            <span className="bar" />
          </div>
          <div className="cov">
            <div>
              <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>
                Not everything worth posting
                <br />
                is a video.
              </h2>
              <p className="lead" style={{ marginTop: 18 }}>
                A promo card highlights player and team accolades and achievements on one designed image, with the photo,
                the stats and the milestone together. It is the post that goes up when you commit, when you hit a
                milestone, or when a coach asks what you have done this season.
              </p>
              <ul className="svc-list" style={{ marginTop: 22 }}>
                <li>Season stat cards</li>
                <li>Commitment announcements</li>
                <li>Award and milestone cards</li>
                <li>Full team sets</li>
              </ul>
            </div>
            <div>
              <Photo
                art="art-box"
                src={feature.src}
                focalX={feature.focalX}
                focalY={feature.focalY}
                style={{
                  aspectRatio: "3 / 4",
                  width: "100%",
                  maxWidth: 360,
                  marginLeft: "auto",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--line)",
                }}
              />
            </div>
          </div>

          <div className="inc" style={{ marginTop: 44 }}>
            <div>
              <b>Every card includes</b>
              <p>
                Your photo placed on a designed background, name, position, grad year, jersey number, school or club
                crest, and your stat line.
              </p>
            </div>
            <div>
              <b>Four sizes, one price</b>
              <p>
                Square for Instagram, vertical for stories, horizontal for email signatures, and a print ready file at
                300 dpi.
              </p>
            </div>
            <div>
              <b>More types available</b>
              <p>Senior night, tournament award, personal best, team roster set. If it is worth marking, we will design it.</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        style={{ background: "var(--deep)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Pricing</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Promo card pricing</h2>
          <div className="tiers" style={{ marginTop: 30 }}>
            <div className="tier">
              <h3>{cardPlans.single.name}</h3>
              <div className="price">
                <sup>$</sup>
                {cardPlans.single.price}
              </div>
              <div className="per">{cardPlans.single.per}</div>
              <ul>
                <li>One card, one athlete</li>
                <li>All four export sizes</li>
                <li>One revision round</li>
                <li>Two day delivery</li>
              </ul>
              <Link className="btn btn-ghost" to="/order" search={{ service: "promo_card", plan: cardPlans.single.key }}>
                Order a card
              </Link>
            </div>
            <div className="tier feature">
              <h3>{cardPlans.pack.name}</h3>
              <div className="price">
                <sup>$</sup>
                {cardPlans.pack.price}
              </div>
              <div className="per">{cardPlans.pack.per}</div>
              <ul>
                <li>Mix stat, commitment and milestone cards</li>
                <li>Consistent design across all three</li>
                <li>All four export sizes on each</li>
                <li>Use them across a full season</li>
              </ul>
              <Link className="btn btn-rec" to="/order" search={{ service: "promo_card", plan: cardPlans.pack.key }}>
                <span className="dot" /> Order the pack
              </Link>
            </div>
            <div className="tier">
              <h3>{cardPlans.teamSet.name}</h3>
              <div className="price">
                <sup>$</sup>
                {cardPlans.teamSet.price}
                <span style={{ fontSize: 17 }}> per player</span>
              </div>
              <div className="per">{cardPlans.teamSet.per}</div>
              <ul>
                <li>Matching card for every athlete on the roster</li>
                <li>Team colours and crest built in once</li>
                <li>Coach and staff cards included free</li>
                <li>Split the cost across the families</li>
              </ul>
              <Link className="btn btn-ghost" to="/order" search={{ service: "promo_card", plan: cardPlans.teamSet.key }}>
                Quote a team
              </Link>
            </div>
          </div>
          <div className="board" style={{ marginTop: 22 }}>
            <div>
              <b>${cardAddons.addedToOrder.price}</b>
              <span>Card added to a reel order</span>
            </div>
            <div>
              <b>+${cardAddons.animated.price}</b>
              <span>Animated version for social</span>
            </div>
            <div>
              <b>+${cardAddons.printedPack.price}</b>
              <span>25 printed 5x7 cards</span>
            </div>
            <div>
              <b>48 hrs</b>
              <span>Standard turnaround</span>
            </div>
          </div>
          <p className="tc" style={{ marginTop: 14 }}>
            Adding a card to a reel order is ${cardAddons.addedToOrder.price} instead of ${cardPlans.single.price}.
          </p>
        </div>
      </section>

      {made.length > 0 && (
        <section id="made">
          <div className="wrap">
            <div className="eyebrow">
              <span className="tc">Our work</span>
              <span className="bar" />
            </div>
            <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)", marginBottom: 30 }}>Promo cards we have made</h2>
            <GalleryGrid items={made} aspect="tall" filters={false} />
          </div>
        </section>
      )}

      <section id="faq" style={{ background: "var(--deep)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Questions</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Before you order</h2>
          <Faq items={faqs} />
        </div>
      </section>

      <div className="band">
        <div className="wrap">
          <h2>
            Ready for
            <br />
            your card?
          </h2>
          <p>Send your photo and your stats, and we will take it from there.</p>
          <Link className="btn" to="/order" search={orderCard}>
            <span className="dot" /> Order a card
          </Link>
        </div>
      </div>
    </>
  );
}
