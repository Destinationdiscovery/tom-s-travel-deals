import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitQuote } from "../lib/quotes.functions";
import { Photo } from "../components/Photo";
import { Faq } from "../components/Faq";
import { reelPlans, reelAddons } from "../config/pricing";
import { getSiteContent } from "../lib/content.functions";
import { EMPTY_CONTENT, slotImage, siteText, sectionItems } from "../lib/site-content";
import { ConsentCheckbox, QuotePrivacyNote } from "../components/Consent";
import { ShowcaseMedia } from "../components/ShowcaseMedia";

import { CONSENT_TEXT } from "../lib/legal-copy";

export const Route = createFileRoute("/reels")({
  loader: () => getSiteContent(),
  head: () => ({
    meta: [
      { title: "Highlight Reels for Student Athletes | Aventura Sports Media" },
      { name: "description", content: `Recruiting highlight reels for student athletes. From $${reelPlans.timestamps.price}.` },
      { property: "og:title", content: "Highlight Reels | Aventura Sports Media" },
      {
        property: "og:description",
        content: "One to two minutes of your best film, built the way coaches watch it.",
      },
      { property: "og:url", content: "/reels" },
    ],
    links: [{ rel: "canonical", href: "/reels" }],
  }),
  component: ReelsPage,
});

const sports = ["Hockey", "Soccer", "Basketball", "Football", "Volleyball", "Lacrosse", "Baseball", "Other"];

const faqs = [
  {
    q: "Why does it cost more without timestamps?",
    a: `Because someone still has to watch the games. Sitting through three full hockey games to log one player's shifts takes longer than the edit itself. With timestamps a reel is $${reelPlans.timestamps.price}, without it is $${reelPlans.noTimestamps.price}. You get our clip log back either way, so you never pay for that pass twice.`,
  },
  {
    q: "How do I timestamp my own film?",
    a: "Watch it once with a notepad open. Write the game, the time on the video, and one word about the play. Ten lines is plenty. That one hour of your time saves you $200.",
  },
  {
    q: "Is phone footage good enough?",
    a: "Usually yes. If the play is clear enough to see who has the puck or the ball, we can cut it. Shoot wide, keep the camera steady, and film from the stands rather than behind a fence when you can.",
  },
  {
    q: "Do you work with Veo and Hudl film?",
    a: "Both, plus YouTube, Drive, Dropbox and raw files. If your club uses Veo, the cleanest option is having them add us to your Clubhouse as a Contributor, or you can download the clips yourself and send the ZIP.",
  },
  {
    q: "How long should a recruiting reel be?",
    a: "Most land between one and two minutes. Your best play goes first because coaches decide quickly whether to keep watching.",
  },
  {
    q: "What if I do not like the first cut?",
    a: "Every order includes one revision round. Swap clips, reorder, change the music, adjust the title card.",
  },
  {
    q: "Can you guarantee I get recruited?",
    a: "No, and be careful with anyone who does. What we control is the film. A clear, well built reel makes it easy for a coach to evaluate you, and that is the part in our hands.",
  },
  {
    q: "Who owns the video?",
    a: "You do. You get a downloadable file to use anywhere, and we host a shareable link for a year on top of that.",
  },
];

type ReelQuoteErrors = {
  contact_name?: string;
  contact_email?: string;
  details?: string;
};

export function ReelQuoteForm({ service_type }: { service_type: "multi_game" | "photography" | "team" }) {
  const submit = useServerFn(submitQuote);
  const [form, setForm] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    sport: "Hockey",
    event_date: "",
    venue: "",
    game_count: "Up to 8 games",
    athlete_count: "One",
    details: "",
  });
  const [errors, setErrors] = useState<ReelQuoteErrors>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState(false);
  const [consentError, setConsentError] = useState("");

  const isFilming = service_type === "photography";

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" } as ReelQuoteErrors));
  }

  function validate() {
    const next: ReelQuoteErrors = {};
    if (!form.contact_name.trim()) next.contact_name = "Name is required.";
    if (!form.contact_email.trim()) next.contact_email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) next.contact_email = "Enter a valid email.";
    if (!form.details.trim()) next.details = "Tell us what you need.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (isFilming && !permission) {
      setConsentError("Tick the box so we know permission is being arranged.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submit({
        data: {
          service_type,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
          sport: form.sport,
          event_date: form.event_date,
          venue: form.venue,
          location: isFilming ? form.venue : "",
          game_count: form.game_count,
          athlete_count: form.athlete_count,
          details: form.details,
          ...(isFilming ? { responsibility_accepted: true } : {}),
        },
      });
      setSuccess(true);
      setForm({
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        sport: "Hockey",
        event_date: "",
        venue: "",
        game_count: "Up to 8 games",
        athlete_count: "One",
        details: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit quote request.");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="quote-note">
        <span>Thanks. We have your details and will reply soon, usually the same day.</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="quote-form">
      <div className="q3">
        <div className="field">
          <label htmlFor={`${service_type}_name`}>Athlete or team name</label>
          <input id={`${service_type}_name`} value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Name" />
          {errors.contact_name && <span style={{ color: "var(--red)", fontSize: 13, marginTop: 6, display: "block" }}>{errors.contact_name}</span>}
        </div>
        <div className="field">
          <label htmlFor={`${service_type}_sport`}>Sport</label>
          <select id={`${service_type}_sport`} value={form.sport} onChange={(e) => update("sport", e.target.value)}>
            {sports.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${service_type}_athletes`}>How many athletes</label>
          <select id={`${service_type}_athletes`} value={form.athlete_count} onChange={(e) => update("athlete_count", e.target.value)}>
            <option>One</option>
            <option>Two or three</option>
            <option>A whole team</option>
          </select>
        </div>
      </div>
      <div className="q3">
        <div className="field">
          <label htmlFor={`${service_type}_footage`}>How much footage</label>
          <select id={`${service_type}_footage`} value={form.game_count} onChange={(e) => update("game_count", e.target.value)}>
            <option>Up to 8 games</option>
            <option>9 to 20 games</option>
            <option>A full season</option>
            <option>More than one season</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${service_type}_email`}>Email</label>
          <input id={`${service_type}_email`} type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="you@email.com" />
          {errors.contact_email && <span style={{ color: "var(--red)", fontSize: 13, marginTop: 6, display: "block" }}>{errors.contact_email}</span>}
        </div>
        <div className="field">
          <label htmlFor={`${service_type}_phone`}>Phone</label>
          <input id={`${service_type}_phone`} value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} placeholder="519 555 0100" />
        </div>
      </div>
      {isFilming && (
        <div className="q3">
          <div className="field">
            <label htmlFor={`${service_type}_date`}>Game date</label>
            <input id={`${service_type}_date`} type="date" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={`${service_type}_venue`}>Venue and city</label>
            <input id={`${service_type}_venue`} value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Arena or field, city" />
          </div>
        </div>
      )}
      <div className="field">
        <label htmlFor={`${service_type}_details`}>What are you looking for</label>
        <textarea id={`${service_type}_details`} rows={3} value={form.details} onChange={(e) => update("details", e.target.value)} placeholder="Tell us what you need and any deadline you are working to" />
        {errors.details && <span style={{ color: "var(--red)", fontSize: 13, marginTop: 6, display: "block" }}>{errors.details}</span>}
      </div>
      {isFilming && (
        <div className="consent-box">
          <ConsentCheckbox
            id={`${service_type}_permission`}
            checked={permission}
            onChange={(v) => {
              setPermission(v);
              setConsentError("");
            }}
          >
            {CONSENT_TEXT.photographyPermission}
          </ConsentCheckbox>
          {consentError && <p className="consent-error">{consentError}</p>}
        </div>
      )}
      {error && <p style={{ color: "var(--red)", marginTop: 8 }}>{error}</p>}
      <div style={{ marginTop: 8 }}>
        <button className="btn btn-rec" type="submit" disabled={busy}>
          <span className="dot" /> {busy ? "Sending..." : "Request a quote"}
        </button>
      </div>
      <QuotePrivacyNote />
    </form>
  );
}

function ReelsPage() {
  const content = Route.useLoaderData() ?? EMPTY_CONTENT;
  const hero = slotImage(content.images, "reels_hero");
  const coverage = slotImage(content.images, "reels_coverage");
  const items = sectionItems(content.showcase, "reels_examples");
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
            Coaches give you ninety seconds.
            <br />
            Make them count.
          </h1>
          <p className="lead" style={{ marginTop: 20 }}>
            {siteText(content.text, "reels_intro")}
          </p>
          <p className="service-crosslink">
            Clubs can arrange reels for their whole roster. <Link to="/clubs">See club coverage.</Link>
          </p>
          <div className="hero-cta" style={{ marginTop: 26 }}>
            <Link className="btn btn-rec" to="/order">
              <span className="dot" /> Start an order
            </Link>
            <a className="btn btn-ghost" href="#pricing">
              See pricing
            </a>
          </div>
        </div>
      </section>

      <section id="examples">
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Examples</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Two cuts, one shoot</h2>
          <p className="lead" style={{ marginTop: 16 }}>
            Every order gives you both cuts of the same footage.
          </p>
          <div className="reels two-up">
            {items.map((e) => (
              <div className="reel" key={e.id}>
                <ShowcaseMedia item={e} />
                <div className="meta">
                  <div style={{ width: "100%" }}>
                    <div className="row">
                      <b>{e.title}</b>
                      {e.tag && <span className="tag2">{e.tag}</span>}
                    </div>
                    <p>{e.description}</p>
                  </div>
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
            <span className="tc">In every reel</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Built the way coaches watch film</h2>
          <p className="lead" style={{ marginTop: 16 }}>
            Best play first, no slow build, no highlight of the whole team. Every choice below exists because it saves a
            coach time.
          </p>
          <div className="inc">
            <div>
              <b>Title card</b>
              <p>
                Name, position, grad year, height and weight, club and school, contact email. Everything a coach needs
                before play one.
              </p>
            </div>
            <div>
              <b>Iso spotlight</b>
              <p>
                A circle or arrow marks you before each clip so nobody has to guess which player they are evaluating.
              </p>
            </div>
            <div>
              <b>Best play opens</b>
              <p>Your strongest clip runs first. Coaches decide fast, so the reel is ordered for that, not chronologically.</p>
            </div>
            <div>
              <b>Music that will not get you taken down</b>
              <p>We use properly licensed tracks, or natural game sound if you prefer.</p>
            </div>
            <div>
              <b>Vertical social cut</b>
              <p>A 9:16 version for TikTok, Reels and Shorts, since plenty of coaches find athletes there now.</p>
            </div>
            <div>
              <b>Hosted link and file</b>
              <p>We host your reel for a year, and you get a full quality MP4 you own outright.</p>
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
            Send us your film.
            <br />
            Two prices.
          </h2>
          <p className="lead" style={{ margin: "16px 0 30px" }}>
            Tell us when your plays happen and you pay the lower price. Leave it to us and we watch every game
            ourselves, which takes hours, so it costs more. Clips or full games, the rule is the same. Both prices cover
            one athlete and up to eight games of footage.
          </p>

          <div className="tiers tiers-two">
            <div className="tier feature">
              <h3>{reelPlans.timestamps.name}</h3>
              <div className="price">
                <sup>$</sup>
                {reelPlans.timestamps.price}
              </div>
              <div className="per">{reelPlans.timestamps.per}</div>
              <ul>
                <li>You send a list like: Game 2, 14:32, breakaway goal</li>
                <li>Or send the clips already cut out</li>
                <li>Editing starts the day your film arrives</li>
                <li>{reelPlans.timestamps.delivery}</li>
              </ul>
              <Link className="btn btn-rec" to="/order" search={{ plan: "timestamps" }}>
                <span className="dot" /> Order at ${reelPlans.timestamps.price}
              </Link>
            </div>
            <div className="tier">
              <h3>{reelPlans.noTimestamps.name}</h3>
              <div className="price">
                <sup>$</sup>
                {reelPlans.noTimestamps.price}
              </div>
              <div className="per">{reelPlans.noTimestamps.per}</div>
              <ul>
                <li>Send the film and your jersey number, that is all</li>
                <li>We watch it and find your plays</li>
                <li>You get our clip log back with the reel</li>
                <li>{reelPlans.noTimestamps.delivery}</li>
              </ul>
              <Link className="btn btn-ghost" to="/order" search={{ plan: "no-timestamps" }}>
                Order at ${reelPlans.noTimestamps.price}
              </Link>
            </div>
          </div>
          <p className="tc" style={{ marginTop: 14 }}>
            Covers up to eight games. More film than that and we quote it first.
          </p>

          <div className="quote" style={{ marginTop: 30, borderColor: "var(--line)" }}>
            <div
              className="quote-top"
              style={{ background: "linear-gradient(120deg,rgba(55,224,166,.09),transparent 70%)" }}
            >
              <h3>Looking for more options?</h3>
              <p>
                The two prices above cover one athlete and up to eight games. Plenty of families need something else. If
                any of this sounds like you, tell us what you are after and we will price it properly.
              </p>
              <div className="inc" style={{ marginTop: 26 }}>
                <div>
                  <b>More than eight games</b>
                  <p>A full season of film, or multiple seasons pulled into one reel.</p>
                </div>
                <div>
                  <b>Multiple athletes</b>
                  <p>Two or three players off the same footage, with the cost split between families.</p>
                </div>
                <div>
                  <b>Multiple reels</b>
                  <p>Updated cuts through a season, or separate reels for different positions and target schools.</p>
                </div>
                <div>
                  <b>Whole team packages</b>
                  <p>A reel for every athlete on a roster, priced per player.</p>
                </div>
                <div>
                  <b>Skills and workout videos</b>
                  <p>Position specific footage rather than game film.</p>
                </div>
                <div>
                  <b>Something else entirely</b>
                  <p>If you are not sure what you need, describe it and we will tell you honestly.</p>
                </div>
              </div>
            </div>
            <ReelQuoteForm service_type="multi_game" />
          </div>

          <div className="eyebrow" style={{ marginTop: 60 }}>
            <span className="tc">No footage?</span>
            <span className="bar" />
          </div>
          <div className="quote" id="filming">
            <div className="quote-top">
              <h3>
                No video of your athlete?
                <br />
                We will come film the game.
              </h3>
              <p>
                If your club does not use Veo or Hudl and nobody is filming, that is what we are for. Tell us when and
                where you play and we will send a quote back, usually the same day.
              </p>
            </div>
            <ReelQuoteForm service_type="photography" />
          </div>

          <div className="eyebrow" style={{ marginTop: 56 }}>
            <span className="tc">Add ons</span>
            <span className="bar" />
          </div>
          <div className="addons">
            {reelAddons.map((a) => (
              <div className="addon" key={a.name}>
                <b>{a.name}</b>
                <span>+ ${a.price}</span>
                <p>{a.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="coverage">
        <div className="wrap">
          <div className="eyebrow">
            <span className="tc">Where we film</span>
            <span className="bar" />
          </div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>
            On site across
            <br />
            Southern Ontario
          </h2>
          <div className="cov">
            <div>
              <p className="lead">
                Home base is Brantford. Travel is included inside a 45 minute drive, and we quote a flat rate beyond
                that. Editing has no geography, so if you are sending film we will take it from anywhere in Canada.
              </p>
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
                src={coverage.src}
                focalX={coverage.focalX}
                focalY={coverage.focalY}
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
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Before you order</h2>
          <Faq items={faqs} />
        </div>
      </section>
    </>
  );
}
