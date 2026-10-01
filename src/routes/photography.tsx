import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "../components/Photo";
import { Faq } from "../components/Faq";
import { ReelQuoteForm } from "./reels";
import { getSiteContent } from "../lib/content.functions";
import { EMPTY_CONTENT, slotImage, siteText, sectionItems, thumbSrc, artClass } from "../lib/site-content";


export const Route = createFileRoute("/photography")({
  loader: () => getSiteContent(),
  head: () => ({
    meta: [
      { title: "Sports Photography in Southern Ontario | Aventura Sports Media" },
      {
        name: "description",
        content: "Gameday photography, athlete portraits, media days and team shoots across Southern Ontario. Quoted per job.",
      },
      { property: "og:title", content: "Photography Services | Aventura Sports Media" },
      { property: "og:description", content: "We bring the camera to you. Gameday, portraits, media day and team." },
      { property: "og:url", content: "/photography" },
    ],
    links: [{ rel: "canonical", href: "/photography" }],
  }),
  component: PhotographyPage,
});

const sports = ["Hockey", "Soccer", "Basketball", "Football", "Volleyball", "Lacrosse", "Baseball", "Other"];


const faqs = [
  {
    q: "Do we need permission from the league or venue?",
    a: "Often yes, and it is usually easy. Some minor sport organisations require notice before someone films. Tell us who to contact and we will handle it, but leave a few days.",
  },
  {
    q: "Can several families split one game?",
    a: "That is the cheapest way to do it. One shoot covers everyone on the ice or the field. Each extra athlete who wants their own edit is $129, and the families split the base rate.",
  },
  {
    q: "What happens if the game is cancelled?",
    a: "We reschedule at no charge. Weather and ice time are not your fault.",
  },
  {
    q: "Do you shoot indoors?",
    a: "Yes. Rinks and gyms are harder to light than a field, which is worth knowing, but the gear handles it.",
  },
  {
    q: "How fast do we get the files?",
    a: "Raw footage within two days. Edited photos within five. A reel from the shoot follows the normal reel timeline.",
  },
];

function PhotographyPage() {
  const content = Route.useLoaderData() ?? EMPTY_CONTENT;
  const hero = slotImage(content.images, "photography_hero");
  const filming = slotImage(content.images, "photography_filming");
  const items = sectionItems(content.showcase, "photography_examples");
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
          <h1>
            Photography
            <br />
            services
          </h1>
          <p className="lead" style={{ marginTop: 20 }}>
            {siteText(content.text, "photography_intro")}
          </p>
          <div className="hero-cta" style={{ marginTop: 26 }}>
            <a className="btn btn-rec" href="#order">
              <span className="dot" /> Request a quote
            </a>
            <a className="btn btn-ghost" href="#pricing">
              How pricing works
            </a>
          </div>
        </div>
      </section>

      <section id="examples">
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">What we shoot</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Four ways to book us</h2>
          <div className="pgrid">
            {items.map((s) => (
              <div className="pcard" key={s.id}>
                <Photo className="pmedia" art={artClass(s)} src={thumbSrc(s)} focalX={s.focal_x} focalY={s.focal_y} />
                <div className="pbody">
                  <span className="ptag">{s.tag}</span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  {s.title === "Team and organization photography" && (
                    <p className="service-crosslink">
                      Clubs and organizations can plan full-season coverage. <Link to="/clubs">See club options.</Link>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{ background: "var(--deep)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">How a shoot runs</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>
            You show up.
            <br />
            We handle the rest.
          </h2>
          <div className="steps">
            <div className="step">
              <span className="tc">00:01</span>
              <h3>Book the date</h3>
              <p>Send the venue, the date, and who we are shooting. We quote it and confirm within a day.</p>
            </div>
            <div className="step">
              <span className="tc">00:02</span>
              <h3>We show up early</h3>
              <p>Set up before warmups so nothing is missed. We work around the venue&apos;s rules and stay out of the way.</p>
            </div>
            <div className="step">
              <span className="tc">00:03</span>
              <h3>Shoot it</h3>
              <p>Stills through the game or the session, plus 4K video if you have booked it.</p>
            </div>
            <div className="step">
              <span className="tc">00:04</span>
              <h3>You get everything</h3>
              <p>Raw footage and edited photos delivered by link. Add a reel and we cut it from the same shoot.</p>
            </div>
          </div>
          <div className="inc" style={{ marginTop: 44 }}>
            <div>
              <b>You keep the raw footage</b>
              <p>Not just the edit. The full game file is yours, which matters if you want a different cut later.</p>
            </div>
            <div>
              <b>Edited stills</b>
              <p>Colour corrected and cropped, delivered in web and print sizes. No proofs to wade through.</p>
            </div>
            <div>
              <b>Multiple athletes, one visit</b>
              <p>Shooting one game covers everyone in it. Families can split a day rate and each get their own edit.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Pricing</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(32px,4.6vw,54px)" }}>
            Every shoot
            <br />
            is quoted.
          </h2>
          <p className="lead" style={{ margin: "16px 0 6px" }}>
            There is no price list for filming, because there is no standard shoot. A single midweek game twenty minutes
            away and a three day showcase in another city are not the same job. Tell us the details below and we will
            send a real number, usually the same day.
          </p>
          <div className="inc" style={{ marginTop: 34 }}>
            <div>
              <b>What moves the price</b>
              <p>
                How far we travel, how many games, how many athletes we are tracking, and whether you want photography
                alongside the video.
              </p>
            </div>
            <div>
              <b>What is always included</b>
              <p>4K film, the raw footage to keep, and a finished highlight reel cut from the shoot. Photography is an add on.</p>
            </div>
            <div>
              <b>Splitting the cost</b>
              <p>
                One shoot covers everyone on the ice or the field. Families regularly split a day between three or four
                athletes, and each gets their own edit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="order"
        style={{ background: "var(--deep)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Request a quote</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(32px,4.6vw,54px)" }}>
            Tell us about
            <br />
            the game.
          </h2>
          <p className="book-line">
            Would rather talk it through? <Link to="/book">Book a call.</Link>
          </p>
          <div className="quote" id="filming">
            <div className="quote-top">
              <h3>Book us to come film</h3>
              <p>
                Fill this in and we will come back with a price and confirm availability. Nothing is charged until you
                say yes.
              </p>
            </div>
            <ReelQuoteForm service_type="photography" />
          </div>
        </div>
      </section>

      <section id="coverage">
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Where we film</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Across Southern Ontario</h2>
          <div className="cov">
            <div>
              <p className="lead">{siteText(content.text, "coverage_note")}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "26px 0 0" }}>
                {[
                  "Rinks, pitches, gyms and diamonds",
                  "Tournament and showcase coverage by the day",
                  "Club rates when several athletes book together",
                  "Comfortable working around minor sport rules",
                ].map((l) => (
                  <li
                    key={l}
                    style={{ borderTop: "1px solid var(--line)", padding: "12px 0", color: "var(--mute)", fontSize: 15 }}
                  >
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Photo
                art="art-turf"
                src={filming.src}
                focalX={filming.focalX}
                focalY={filming.focalY}
                style={{
                  height: 180,
                  borderRadius: "var(--radius) var(--radius) 0 0",
                  border: "1px solid var(--line)",
                  borderBottom: 0,
                }}
              />
              <div className="map" style={{ borderRadius: "0 0 var(--radius) var(--radius)" }}>
                {[
                  { city: "Brantford", top: "44%", left: "26%" },
                  { city: "Hamilton", top: "26%", left: "52%" },
                  { city: "Mississauga", top: "16%", left: "72%" },
                  { city: "Woodstock", top: "58%", left: "14%" },
                  { city: "Kitchener", top: "34%", left: "12%" },
                  { city: "Simcoe", top: "70%", left: "44%" },
                  { city: "Burlington", top: "54%", left: "66%" },
                ].map((p) => (
                  <div className="pin" key={p.city} style={{ top: p.top, left: p.left }}>
                    <i /> {p.city}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" style={{ background: "var(--deep)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Questions</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Before you book</h2>
          <Faq items={faqs} />
        </div>
      </section>
    </>
  );
}
