import { createFileRoute } from "@tanstack/react-router";
import { Related } from "@/components/site/PageParts";
import { CONTACT_EMAIL } from "@/lib/site";
import { pageHead } from "@/lib/seo";

const TITLE = "About reviewthengo: how we check travel rules";
const DESCRIPTION =
  "Who runs reviewthengo and how we check flight compensation, EES and travel insurance rules: official sources first, always dated, honest status, public corrections.";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/about",
      modified: "2026-10-02",
      type: "AboutPage",
      crumbs: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ],
    }),
  component: About,
});

function About() {
  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">About</p>
        <h1>About reviewthengo</h1>
        <div className="about-body">
          <p className="lede">
            I am an avid traveller and a travel agent. I kept noticing that the rules that matter most to
            travellers, such as border systems, passenger rights, and what an airline or an insurer owes you,
            change quickly and sit scattered across government pages, press reports and sales pages.
            reviewthengo puts that information in one place, with the source and the date we last checked it, and
            a plain label when we are not sure.
          </p>
          <h2 className="s" id="method">
            How we check.
          </h2>
          <p>
            <strong>Official source first.</strong> We read the government or regulator text before any news
            report or blog.
          </p>
          <p>
            <strong>Always dated.</strong> Each entry shows the day we last checked it, not the day we wrote it.
          </p>
          <p>
            <strong>Honest status.</strong> We label what we cannot confirm as Unconfirmed, instead of rounding it
            into a fact. In force, Scheduled and Unconfirmed each mean something specific.
          </p>
          <p>
            <strong>Public corrections.</strong> When we get something wrong, the fix and the date are listed on the{" "}
            <a href="/corrections">corrections page</a>.
          </p>
          <h2 className="s">What we are not.</h2>
          <p>
            We are not lawyers, and nothing here is legal advice. We do not file or send anything for you. This
            site does not sell trips or take bookings. Ads and affiliate links, if any, are labelled and never
            change what a rule says. Read the <a href="/disclaimer">disclaimer</a>.
          </p>
          <h2 className="s">Contact.</h2>
          <p>
            Found a mistake or a newer source? Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We read every message and list corrections
            openly.
          </p>
        </div>
      </div>
      <Related current="/about" />
    </main>
  );
}
