import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Photo } from "../components/Photo";
import { Ticker } from "../components/Ticker";
import { captureSubscriber } from "../lib/subscribers.functions";
import { reelPlans, socialPlans, cardPlans } from "../config/pricing";
import { getSiteContent } from "../lib/content.functions";
import { slotImage, siteText, mediaUrl, EMPTY_CONTENT } from "../lib/site-content";
import { ConsentCheckbox } from "../components/Consent";
import { CONSENT_TEXT } from "../lib/legal-copy";

export const Route = createFileRoute("/")({
  loader: () => getSiteContent(),
  head: () => ({
    meta: [
      { title: "Game Photos, Video and Recruiting Reels | Aventura Sports Media" },
      {
        name: "description",
        content: "Game photos, video and recruiting reels for student athletes, clubs and teams. Based in Brantford, Ontario.",
      },
      { property: "og:title", content: "Game Photos, Video and Recruiting Reels | Aventura Sports Media" },
      {
        property: "og:description",
        content: "Game photos, video and recruiting reels for student athletes, clubs and teams. Based in Brantford, Ontario.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const content = Route.useLoaderData() ?? EMPTY_CONTENT;
  const heroImg = slotImage(content.images, "home_hero");
  const ctaImg = slotImage(content.images, "home_cta");
  const serviceImages = {
    reels: slotImage(content.images, "home_highlight_reels"),
    photography: slotImage(content.images, "home_photography"),
    promo: slotImage(content.images, "home_promo_cards"),
    gallery: slotImage(content.images, "home_gallery"),
  };
  // The placeholder art already draws its own play icon, so the button is only added on top of an uploaded photo.
  const reelsUploaded = !!content.images.find((i) => i.slot === "home_highlight_reels")?.image_url;
  const founders = content.founders;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [subConsent, setSubConsent] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<null | { success: boolean; message: string }>(null);
  const submitSub = useServerFn(captureSubscriber);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    if (!subConsent) {
      setCaptureStatus({ success: false, message: "Tick the box so we can email you the sheet." });
      return;
    }
    setBusy(true);
    setCaptureStatus(null);
    try {
      const result = await submitSub({ data: { email, source: "timestamp_sheet", consent: true } });
      if (result.duplicate) {
        setCaptureStatus({ success: true, message: "You are already on the list. The sheet will be in your inbox." });
      } else {
        setCaptureStatus({ success: true, message: "Sent. Check your inbox for the sheet." });
      }
      setEmail("");
    } catch (err) {
      setCaptureStatus({
        success: false,
        message: err instanceof Error ? err.message : "Could not subscribe. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-bg">
          <img
            src={heroImg.src}
            alt={heroImg.alt}
            width={1920}
            height={1088}
            fetchPriority="high"
            style={{ opacity: heroImg.opacity, objectPosition: `${heroImg.focalX}% ${heroImg.focalY}%` }}
            className="home-hero-image"
          />
          <div className="lines" />
          <div className="veil" />
          <div className="grain" />
        </div>
        <div className="wrap" style={{ textAlign: "center", maxWidth: 900 }}>
          <h1 style={{ fontSize: "clamp(42px,6.5vw,80px)" }}>
            Game photos, video
            <br />
            <em>and recruiting reels.</em>
          </h1>
          <p className="lead" style={{ margin: "26px auto 32px", textAlign: "center" }}>
            {siteText(content.text, "home_hero_subhead")}
          </p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <Link className="btn btn-ghost" to="/reels">
              For athletes
            </Link>
            <Link className="btn btn-ghost" to="/clubs">
              For clubs and teams
            </Link>
          </div>
        </div>
      </section>

      <Ticker />


      <section id="services" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Services</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(32px,4.6vw,54px)" }}>
            Four ways we help
            <br />
            you get seen.
          </h2>
          <div className="svc">
            <Link className="svc-card" to="/reels">
              <Photo className="svc-media" art="art-ice" src={serviceImages.reels.src} focalX={serviceImages.reels.focalX} focalY={serviceImages.reels.focalY}>
                {reelsUploaded && (
                  <div
                    className="play"
                    style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
                  />
                )}
              </Photo>
              <div className="svc-body">
                <h3>Highlight reels</h3>
                <p>
                  A coach ready recruiting video built from your game film. Best play first, title card, spotlight so
                  nobody guesses which player is you, and a social cut to match.
                </p>
                <div className="from">
                  FROM<b>${reelPlans.timestamps.price}</b>
                </div>
                <div className="go">See examples and pricing &rarr;</div>
              </div>
            </Link>

            <Link className="svc-card" to="/promo-cards">
              <Photo className="svc-media" art="art-box" src={serviceImages.promo.src} focalX={serviceImages.promo.focalX} focalY={serviceImages.promo.focalY} />
              <div className="svc-body">
                <h3>Promo cards</h3>
                <p>
                  Highlight player and team accolades and achievements. One designed image with the photo, the stats and
                  the milestone on it, ready to post or print.
                </p>
                <ul className="svc-list">
                  <li>Season stat cards</li>
                  <li>Commitment announcements</li>
                  <li>Award and milestone cards</li>
                  <li>Full team sets</li>
                </ul>
                <div className="from">
                  FROM<b>${cardPlans.single.price}</b>
                </div>
                <div className="go">See the cards and pricing &rarr;</div>
              </div>
            </Link>

            <Link className="svc-card" to="/photography">
              <Photo className="svc-media" art="art-turf" src={serviceImages.photography.src} focalX={serviceImages.photography.focalX} focalY={serviceImages.photography.focalY} />
              <div className="svc-body">
                <h3>Photography services</h3>
                <p>
                  We bring the camera to you. Every shoot is quoted, because distance, game count and roster size all
                  move the number.
                </p>
                <ul className="svc-list">
                  <li>Game day photography</li>
                  <li>Athlete portrait session</li>
                  <li>Media day session</li>
                  <li>Team and organization photography</li>
                </ul>
                <div className="from">
                  QUOTED<b>Per job</b>
                </div>
                <div className="go">See the services &rarr;</div>
              </div>
            </Link>

            <Link className="svc-card" to="/gallery">
              <Photo className="svc-media" art="art-box" src={serviceImages.gallery.src} focalX={serviceImages.gallery.focalX} focalY={serviceImages.gallery.focalY} />
              <div className="svc-body">
                <h3>Gallery</h3>
                <p>Game photos, clips, player cards and more from the work we have made.</p>
                <div className="go">See the gallery &rarr;</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section
        style={{ background: "var(--deep)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">How it works</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>
            Order, send film,
            <br />
            send it to coaches.
          </h2>
          <div className="steps">
            <div className="step">
              <span className="tc">00:01</span>
              <h3>Order</h3>
              <p>Pick what you want, tell us the sport, position and jersey number, pay online.</p>
            </div>
            <div className="step">
              <span className="tc">00:02</span>
              <h3>Send film</h3>
              <p>Send your links. Or book a shoot date and we bring the camera.</p>
            </div>
            <div className="step">
              <span className="tc">00:03</span>
              <h3>Review</h3>
              <p>A private preview link comes first. One round of changes is included.</p>
            </div>
            <div className="step">
              <span className="tc">00:04</span>
              <h3>Send it out</h3>
              <p>Final file, hosted link, vertical cut. Ready to email coaches the same day.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Who cuts your film</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Behind the camera</h2>
          <p className="lead" style={{ marginTop: 16 }}>
            Aventura is two people, not a content farm with a queue in another time zone. The same two cut your reel,
            answer your email, and show up to your rink. That is the whole pitch.
          </p>

          <div className="founders">
            {founders.map((f, i) => (
              <Photo
                key={f.id}
                className="portrait"
                art={i % 2 === 0 ? "art-box" : "art-ice"}
                src={mediaUrl(f.photo_url) ?? (i % 2 === 0 ? "/art/1bc6acfa.svg" : "/art/d3919fde.svg")}
                focalX={f.focal_x}
                focalY={f.focal_y}
              >
                <span className="jersey" style={{ right: -40, bottom: -110 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 6, padding: 22 }}>
                  <h4
                    style={{
                      fontFamily: "'Anton',sans-serif",
                      fontWeight: 400,
                      fontSize: 28,
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {f.name}
                  </h4>
                  <span className="tc" style={{ display: "block", marginTop: 6 }}>
                    {f.role}
                  </span>
                </div>
              </Photo>
            ))}
          </div>

          {founders.some((f) => f.bio && f.bio.trim()) && (
            <div className="founder-copy">
              {founders.map((f) => (
                <div key={f.id}>{f.bio && f.bio.trim() ? <p>{f.bio}</p> : null}</div>
              ))}
            </div>
          )}


          <div className="sig">
            <div>
              <b>Two people</b>
              <p>Your work is not passed around a queue. You know who has it.</p>
            </div>
            <div>
              <b>Local</b>
              <p>Brantford based. They have been in the rinks and gyms you play in.</p>
            </div>
            <div>
              <b>No lock in</b>
              <p>Buy one reel and never come back. That is a fine outcome.</p>
            </div>
          </div>
        </div>
      </section>

      {content.testimonials.length > 0 && (
        <section id="reviews">
          <div className="wrap">
            <span className="tc">What families say</span>
            <h2>In their words</h2>
            <div className="sig" style={{ marginTop: 26 }}>
              {content.testimonials.map((t) => (
                <div key={t.id}>
                  <p style={{ fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                  <b>{t.author_name}</b>
                  <p>{[t.author_role, t.sport].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      <section
        id="resources"
        style={{ background: "var(--deep)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Free help</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>The recruiting film playbook</h2>
          <p className="lead" style={{ marginTop: 16 }}>
            Free, and most of it means you need us less. Families who understand the process make better clients, and
            they tell other families.
          </p>
          <div className="res">
            <a>
              <span className="kicker">Guide</span>
              <h4>How to get your Veo footage to us</h4>
              <p>
                Where the download button is, what permission you need from your club, and what to do when there is no
                download option at all.
              </p>
              <span className="time">COMING SOON</span>
            </a>
            <a>
              <span className="kicker">Ontario</span>
              <h4>U Sports, OUA and NCAA explained for Ontario families</h4>
              <p>
                The routes available from an Ontario high school, the timelines, and the eligibility basics people miss.
              </p>
              <span className="time">COMING SOON</span>
            </a>
            <a>
              <span className="kicker">Template</span>
              <h4>The first email to a coach</h4>
              <p>A short outreach email that does not sound like a form letter, plus what to put in the subject line.</p>
              <span className="time">COMING SOON</span>
            </a>
          </div>

          <div className="magnet">
            <div>
              <span className="tc" style={{ color: "var(--rec)" }}>
                FREE DOWNLOAD
              </span>
              <h3 style={{ marginTop: 12 }}>The timestamp sheet</h3>
              <p className="lead" style={{ fontSize: 15, marginTop: 12 }}>
                One page for logging your plays while you watch. Fill it in and you pay ${reelPlans.timestamps.price}{" "}
                for a reel instead of ${reelPlans.noTimestamps.price}. We would rather you keep the money and send us
                clean film.
              </p>
              <form onSubmit={onSubmit} className="capture">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  aria-label="Your email"
                  required
                />
                <button className="btn btn-rec" type="submit" disabled={busy}>
                  <span className="dot" /> {busy ? "Sending..." : "Send it to me"}
                </button>
                <div className="consent-box" style={{ gridColumn: "1 / -1" }}>
                  <ConsentCheckbox id="sub_consent" checked={subConsent} onChange={setSubConsent}>
                    {CONSENT_TEXT.subscriber}
                  </ConsentCheckbox>
                </div>
              </form>
              {captureStatus && (
                <p className="tc" style={{ marginTop: 12, color: captureStatus.success ? "var(--ok)" : "var(--red)" }}>
                  {captureStatus.message}
                </p>
              )}
              <p className="tc" style={{ marginTop: 12 }}>
                One email with the sheet. A short note when we post something new. Unsubscribe any time.
              </p>
            </div>
            <div className="sheet">
              GAME 1 &nbsp; vs ____________
              <br />
              <b>14:32</b> &nbsp; breakaway goal
              <br />
              <b>31:05</b> &nbsp; defensive stop
              <br />
              <b>42:18</b> &nbsp; assist, cross ice
              <br />
              GAME 2 &nbsp; vs ____________
              <br />
              <b>__:__</b> &nbsp; ________________
              <br />
              <b>__:__</b> &nbsp; ________________
            </div>
          </div>
        </div>
      </section>

      <div className="band" style={{ position: "relative", overflow: "hidden", padding: "60px 0" }}>
        <div className="wrap" style={{ position: "relative", zIndex: 5, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", marginBottom: 12 }}>Not sure what you need?</h2>
          <p style={{ maxWidth: 640, margin: "0 auto 20px", color: "var(--chalk)" }}>
            Tell us about the project and we will come back with a real number and a plan.
          </p>
          <Link className="btn btn-ghost" to="/quote">
            Request a quote
          </Link>
        </div>
      </div>

      <div className="band" style={{ position: "relative", overflow: "hidden" }}>
        <div className="photo" style={{ position: "absolute", inset: 0, opacity: 0.24 }}>
          <img src={ctaImg.src} alt={ctaImg.alt} style={{ objectPosition: `${ctaImg.focalX}% ${ctaImg.focalY}%` }} />
        </div>
        <div className="grain" />
        <div className="wrap" style={{ position: "relative", zIndex: 5 }}>
          <h2>
            Your film is sitting
            <br />
            on someone&apos;s phone.
          </h2>
          <p>Get it cut into something a coach will actually watch.</p>
          <Link className="btn" to="/reels">
            <span className="dot" /> Start a reel
          </Link>
        </div>
      </div>
    </>
  );
}
