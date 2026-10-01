import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Faq } from "../components/Faq";
import { Photo } from "../components/Photo";
import { getSiteContent } from "../lib/content.functions";
import { submitQuote } from "../lib/quotes.functions";
import { EMPTY_CONTENT, sectionItems, slotImage } from "../lib/site-content";
import { ConsentCheckbox, QuotePrivacyNote } from "../components/Consent";

import { CONSENT_TEXT } from "../lib/legal-copy";
import { ShowcaseMedia } from "../components/ShowcaseMedia";

export const Route = createFileRoute("/clubs")({
  loader: () => getSiteContent(),
  head: () => ({
    meta: [
      { title: "Club Photography and Video | Aventura Sports Media" },
      { name: "description", content: "Matchday photography, social content and video for clubs, associations and school programs." },
      { property: "og:title", content: "Club Photography and Video | Aventura Sports Media" },
      { property: "og:description", content: "Content, photography and video for sports clubs and organizations in Southern Ontario." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/clubs" }],
  }),
  component: ClubsPage,
});

const services = [
  ["Matchday photography", "Action stills from your fixtures, edited and delivered in web and print sizes, ready for the site and the socials."],
  ["Social content", "Vertical clips cut from your own footage or ours, captioned and on brand, so there is always something to post."],
  ["Player and team video", "Season highlights, signings, milestones and anything worth marking."],
  ["Media days", "The full roster through in one booking. Consistent headshots and portraits so the whole account matches."],
  ["Promo cards", "Player announcements, awards and accolades as designed images built for posting."],
  ["Sponsor visible assets", "Content built so the people paying for the boards and the shirts actually get seen in it."],
] as const;

const levels = ["Men's or women's senior", "Youth club", "School program", "Other"];

const faqs = [
  { q: "Can you work from footage our coaches already film?", a: "Yes. We work with Veo, Hudl, Drive, Dropbox and other footage your coaches already collect. You provide access or downloadable files, and we cut from there." },
  { q: "Do you shoot every fixture or can we pick?", a: "You can pick individual fixtures, tournaments or media days, or arrange recurring coverage across a season." },
  { q: "Can our sponsors be featured in the content?", a: "Yes. Tell us which sponsors need visibility and where their branding appears, and we will plan shots and edits around that." },
  { q: "Can families buy their own reels off the back of your coverage?", a: "Yes, and clubs often set this up as a benefit for members. We can use the same coverage to make individual athlete reels." },
  { q: "How far do you travel?", a: "Home base is Brantford. Travel is included inside a 45 minute drive, and we quote a flat rate beyond that." },
];

type ClubForm = {
  organization: string;
  contact_name: string;
  role: string;
  contact_email: string;
  contact_phone: string;
  sport: string;
  level: string;
  wanted: string[];
  season_dates: string;
  details: string;
};

const initialForm: ClubForm = {
  organization: "",
  contact_name: "",
  role: "",
  contact_email: "",
  contact_phone: "",
  sport: "",
  level: "Men's or women's senior",
  wanted: [],
  season_dates: "",
  details: "",
};

function ClubQuoteForm() {
  const submit = useServerFn(submitQuote);
  const [form, setForm] = useState<ClubForm>(initialForm);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [authority, setAuthority] = useState(false);
  const [responsibility, setResponsibility] = useState(false);
  const [consentError, setConsentError] = useState("");

  function update<K extends keyof ClubForm>(key: K, value: ClubForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleService(label: string) {
    update("wanted", form.wanted.includes(label) ? form.wanted.filter((item) => item !== label) : [...form.wanted, label]);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!authority || !responsibility) {
      setConsentError("Tick both boxes so we know who is authorising this and who handles player consent.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const structuredDetails = [
        `Contact role: ${form.role || "Not provided"}`,
        `Level: ${form.level}`,
        `Services: ${form.wanted.join(", ") || "Not selected"}`,
        `Rough season dates: ${form.season_dates || "Not provided"}`,
        "",
        form.details,
      ].join("\n");
      await submit({
        data: {
          service_type: "team",
          organization: form.organization,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
          sport: form.sport,
          details: structuredDetails,
          terms_accepted: true,
          responsibility_accepted: true,
        },
      });
      setSuccess(true);
      setForm(initialForm);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit your quote request.");
    } finally {
      setBusy(false);
    }
  }

  if (success) return <div className="quote-note"><span>Thanks. We have your club details and will reply with a quote.</span></div>;

  return (
    <form className="quote-form" onSubmit={onSubmit}>
      <div className="q3">
        <label className="field"><span>Club or organization name</span><input required value={form.organization} onChange={(e) => update("organization", e.target.value)} /></label>
        <label className="field"><span>Contact name</span><input required value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} /></label>
        <label className="field"><span>Role</span><input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="Director, coach, manager" /></label>
      </div>
      <div className="q3">
        <label className="field"><span>Email</span><input required type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} /></label>
        <label className="field"><span>Phone</span><input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} /></label>
        <label className="field"><span>Sport</span><input required value={form.sport} onChange={(e) => update("sport", e.target.value)} /></label>
      </div>
      <div className="two">
        <label className="field"><span>Level</span><select value={form.level} onChange={(e) => update("level", e.target.value)}>{levels.map((level) => <option key={level}>{level}</option>)}</select></label>
        <label className="field"><span>Rough season dates</span><input value={form.season_dates} onChange={(e) => update("season_dates", e.target.value)} placeholder="August to October" /></label>
      </div>
      <fieldset className="club-services">
        <legend>What are you after?</legend>
        {services.map(([label]) => (
          <label key={label}><input type="checkbox" checked={form.wanted.includes(label)} onChange={() => toggleService(label)} /><span>{label}</span></label>
        ))}
      </fieldset>
      <label className="field"><span>Details</span><textarea required rows={5} value={form.details} onChange={(e) => update("details", e.target.value)} placeholder="Tell us about the fixtures, events, deadlines and deliverables you have in mind." /></label>
      <div className="consent-box">
        <ConsentCheckbox id="club_authority" checked={authority} onChange={(v) => { setAuthority(v); setConsentError(""); }}>
          {CONSENT_TEXT.clubAuthority}
        </ConsentCheckbox>
        <ConsentCheckbox id="club_responsibility" checked={responsibility} onChange={(v) => { setResponsibility(v); setConsentError(""); }}>
          {CONSENT_TEXT.clubResponsibility}
        </ConsentCheckbox>
        {consentError && <p className="consent-error">{consentError}</p>}
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-rec" type="submit" disabled={busy}><span className="dot" />{busy ? "Sending..." : "Request a quote"}</button>
      <QuotePrivacyNote />
    </form>
  );
}

function ClubsPage() {
  const content = Route.useLoaderData() ?? EMPTY_CONTENT;
  const hero = slotImage(content.images, "clubs_hero");
  const clubWork = sectionItems(content.showcase, "clubs_work");

  return (
    <>
      <section className="phead">
        <div className="hero-bg"><img src={hero.src} alt={hero.alt} style={{ objectPosition: `${hero.focalX}% ${hero.focalY}%` }} /><div className="lines" /><div className="veil" /><div className="grain" /></div>
        <div className="wrap">
          <Link className="crumb" to="/">&larr; Back to home</Link>
          <h1>Your club is a media operation now</h1>
          <p className="lead" style={{ marginTop: 20 }}>Sponsors want to be seen. Your website needs images that are not phone photos from the stands. Your socials need something to post on Monday morning. Most clubs handle that with whoever happens to own the best camera.</p>
          <div className="hero-cta" style={{ marginTop: 26 }}><a className="btn btn-rec" href="#quote"><span className="dot" />Request a quote</a><a className="btn btn-ghost" href="#services">See what we shoot</a></div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="eyebrow"><span className="tc">Who we cover</span><span className="bar" /></div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Two kinds of club, both covered</h2>
          <div className="paths">
            <div className="path"><h3>Clubs with a marketing budget</h3><p className="lead">You have sponsors, a website and an audience. You need assets that look like the level you play at. Matchday photography, video content for social, player announcements, season campaigns, and imagery your sponsors are visible in.</p></div>
            <div className="path"><h3>Youth clubs and associations</h3><p className="lead">You are competing for players and keeping families happy. Matchday content parents actually share, media days that give every athlete a proper photo, and recruiting coverage that makes your program the one they pick.</p></div>
          </div>
        </div>
      </section>

      <section id="services" className="section-deep">
        <div className="wrap">
          <div className="eyebrow"><span className="tc">Services</span><span className="bar" /></div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>What we do for clubs</h2>
          <div className="inc club-feature-grid">{services.map(([title, copy]) => <div key={title}><b>{title}</b><p>{copy}</p></div>)}</div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="eyebrow"><span className="tc">How it works</span><span className="bar" /></div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>How clubs work with us</h2>
          <div className="paths">
            <div className="path"><h3>You send the footage</h3><p className="lead">Veo, Hudl, or whatever your coaches already film. We cut it into content you can use all week.</p></div>
            <div className="path"><h3>We come and shoot it</h3><p className="lead">Photography, video, or both, at your fixtures and events.</p></div>
          </div>
        </div>
      </section>

      {clubWork.length > 0 && (
        <section className="section-deep">
          <div className="wrap">
            <div className="eyebrow"><span className="tc">Current work</span><span className="bar" /></div>
            <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Already doing this</h2>
            <div className="reels club-gallery">{clubWork.slice(0, 6).map((item) => <div className="reel" key={item.id}><ShowcaseMedia item={item} /><div className="meta"><b>{item.title}</b><span>{item.tag}</span></div></div>)}</div>
          </div>
        </section>
      )}

      <section id="quote">
        <div className="wrap">
          <div className="eyebrow"><span className="tc">Pricing</span><span className="bar" /></div>
          <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Quoted for the way you work</h2>
          <p className="lead" style={{ marginTop: 16 }}>Club work is priced per season or per booking, depending on how much coverage and editing you need.</p>
          <div className="book-split">
            <div className="quote" style={{ marginTop: 0 }}>
              <div className="quote-top"><h3>Book a call</h3><p>Talk it through with us first. Fifteen or thirty minutes, no charge and no obligation.</p></div>
              <div className="quote-form">
                <p style={{ color: "var(--mute)", fontSize: 14, lineHeight: 1.6 }}>Pick a time that works for your committee or coaching staff and we will go through what a season of coverage looks like.</p>
                <Link className="btn btn-rec" to="/book"><span className="dot" />Book a call</Link>
              </div>
            </div>
            <div className="quote" style={{ marginTop: 0 }}><div className="quote-top"><h3>Tell us about your club</h3><p>Send the outline and we will reply with a clear scope and price. Nothing is charged when you submit.</p></div><ClubQuoteForm /></div>
          </div>
        </div>
      </section>

      <section className="section-deep">
        <div className="wrap"><div className="eyebrow"><span className="tc">Questions</span><span className="bar" /></div><h2 style={{ fontSize: "clamp(30px,4.2vw,48px)" }}>Club coverage FAQ</h2><Faq items={faqs} /></div>
      </section>
    </>
  );
}
