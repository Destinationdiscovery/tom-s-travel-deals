import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import { Globe, Heart, MapPin, Camera, ShieldCheck, Scale } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import AuthorBio from "@/components/AuthorBio";
import heroImg from "@/assets/snowbird-caribbean-aerial.jpg";

const features = [
  {
    icon: Globe,
    title: "190+ Countries Covered",
    description: "From Caribbean beaches to Asian temples to European cities, we aggregate reviews for properties worldwide.",
  },
  {
    icon: Heart,
    title: "Passionate Travel Advocate",
    description: "Travel has transformed my life, and I built ReviewThenGo to help every traveler make confident decisions.",
  },
  {
    icon: Camera,
    title: "Real Experiences Shared",
    description: "No stock photos here. Our reviews feature real photos, videos, and real opinions from verified travelers.",
  },
];

const travelPhilosophy = [
  "Travel is about connection, not just destinations",
  "The best trips blend adventure with relaxation",
  "Every destination has a hidden gem worth finding",
  "Group travel creates memories that last forever",
  "Sometimes the unplanned moments are the best",
  "Sharing experiences helps others travel smarter",
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About ReviewThenGo: Built by Tom, Travel Consultant in Ontario"
        description="ReviewThenGo is built by Tom, a travel consultant with 10+ years in the industry. Our editorial standards: no pay-for-play, reviews aggregated from 10+ sources, transparent affiliate disclosure."
        url="/about"
        keywords={["about ReviewThenGo", "travel aggregator", "Tom Laracy", "Canadian travel consultant", "editorial standards", "travel review methodology"]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Tom Laracy",
            jobTitle: "Travel Consultant & Founder",
            worksFor: { "@type": "Organization", name: "ReviewThenGo" },
            url: "https://www.reviewthengo.com/about",
            sameAs: ["https://x.com/TomLaracyTravel", "https://tom.travelonly.com"],
            knowsAbout: [
              "Travel Planning",
              "Hotel Reviews",
              "All-Inclusive Resorts",
              "Canadian Travel",
              "Caribbean Travel",
              "Cruise Travel",
            ],
            address: {
              "@type": "PostalAddress",
              addressRegion: "Ontario",
              addressCountry: "CA",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ReviewThenGo",
            url: "https://www.reviewthengo.com",
            logo: "https://www.reviewthengo.com/favicon.png",
            founder: { "@type": "Person", name: "Tom Laracy" },
            foundingLocation: { "@type": "Place", name: "Ontario, Canada" },
            description:
              "Free all-in-one travel planning platform aggregating hotel reviews from 10+ sources, with itineraries, best-time-to-visit guides, flight deals, packing lists, currency rates, safety scores, and visa requirements.",
            knowsAbout: [
              "Hotel Reviews",
              "Resort Reviews",
              "Travel Itineraries",
              "Flight Deals",
              "Travel Safety",
            ],
            sameAs: ["https://x.com/TomLaracyTravel", "https://www.instagram.com/reviewthengo/"],
          },
        ]}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center">
          <img src={heroImg} alt="Aerial view of tropical destination" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-3">
              About <span className="text-primary-foreground">ReviewThenGo</span>
            </h1>
            <p className="text-white/80 text-lg">Built by a real traveler, for real travelers.</p>
          </div>
        </section>

        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                    Why <span className="text-gradient">ReviewThenGo</span> Exists
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                    ReviewThenGo started because I was planning a trip to Italy and spent three nights drowning in
                    contradictory reviews across TripAdvisor, Booking.com, Reddit, Google, and a dozen blogs. The
                    "best resort" on one site was a "tourist trap" on another. Sponsored top-10 lists were ranking
                    properties I'd personally never recommend. I wanted one place that pulled it all together,
                    honestly, with no agenda.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                    I'm Tom, a travel consultant with 10+ years in the industry, based in Ontario, Canada. I've
                    booked thousands of trips for real clients, walked the halls of resorts most travelers only
                    see in brochures, and learned which review sources actually predict whether you'll have a great
                    stay. ReviewThenGo is what I wish I'd had when I started planning my own trips.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    No pay-for-play. No sponsored rankings. No fake reviews. Properties cannot pay to influence a
                    verdict on this site, period. The tools are free because the goal is simple: help you book with
                    confidence the first time.
                  </p>
                </div>

                <div className="grid gap-6">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-8">
                {/* How We Aggregate */}
                <div className="bg-card rounded-3xl p-8 md:p-10 shadow-elevated">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="h-6 w-6 text-accent" />
                    <h3 className="font-display text-xl font-bold text-card-foreground">How We Aggregate Reviews</h3>
                  </div>
                  <ol className="space-y-4 text-card-foreground text-sm">
                    <li className="flex gap-3">
                      <span className="font-bold text-primary shrink-0">1.</span>
                      <span>We pull ratings and feedback from Google, TripAdvisor, Booking.com, Reddit, and more.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary shrink-0">2.</span>
                      <span>Recent verified stays are weighted 2× higher than older or unverified reviews.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary shrink-0">3.</span>
                      <span>We flag suspicious patterns (fake review bursts, generic language) automatically.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary shrink-0">4.</span>
                      <span>The result: a clear verdict with pros, cons, and a "worth it?" recommendation.</span>
                    </li>
                  </ol>
                </div>

                {/* No Pay-for-Play */}
                <div className="bg-card rounded-3xl p-8 md:p-10 shadow-elevated">
                  <div className="flex items-center gap-3 mb-6">
                    <Scale className="h-6 w-6 text-accent" />
                    <h3 className="font-display text-xl font-bold text-card-foreground">No Pay-for-Play. Ever</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Properties cannot pay to improve their ReviewThenGo verdict. Our revenue comes from clearly
                    disclosed affiliate links and advertising, never from review manipulation.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We believe travelers deserve unbiased information. That principle is non-negotiable.
                  </p>
                </div>

                {/* Travel Philosophy Card */}
                <div className="bg-card rounded-3xl p-8 md:p-10 shadow-elevated">
                  <h3 className="font-display text-xl font-bold text-card-foreground mb-6">
                    Our Travel Philosophy
                  </h3>
                  <div className="grid gap-3">
                    {travelPhilosophy.map((belief) => (
                      <div key={belief} className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-card-foreground">{belief}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                      "The world is a book, and those who do not travel read only one page.". Saint Augustine
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Bio */}
            <div className="max-w-3xl mx-auto mt-16">
              <AuthorBio />
            </div>

            {/* Editorial Standards */}
            <div className="max-w-3xl mx-auto mt-16 bg-card rounded-3xl p-8 md:p-10 shadow-elevated">
              <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">
                Editorial Standards
              </h2>
              <ul className="space-y-3 text-sm text-card-foreground/90 leading-relaxed">
                <li><strong>No pay-for-play.</strong> No property, hotel, airline, or brand can pay to influence a verdict, ranking, or recommendation on this site.</li>
                <li><strong>Aggregated review methodology.</strong> Verdicts pull from Google, TripAdvisor, Booking.com, Reddit, and other public sources, weighted toward recent verified stays.</li>
                <li><strong>Affiliate disclosure.</strong> Some outbound links to Expedia, Hotels.com, VRBO, and Amazon earn a commission at no extra cost to you. Full disclosure: <a href="/affiliate-disclosure" className="text-primary underline">affiliate-disclosure</a>.</li>
                <li><strong>Corrections.</strong> If you spot an inaccuracy, email <a href="mailto:hello@reviewthengo.com" className="text-primary underline">hello@reviewthengo.com</a> and we'll review and update within 7 days.</li>
                <li><strong>AI-assisted research.</strong> Some destination summaries and itineraries are generated with AI from public review data, then reviewed by Tom before publication. AI never overrides a verified first-hand review.</li>
              </ul>
            </div>

            {/* Press / Media */}
            <div className="max-w-3xl mx-auto mt-8 bg-card rounded-3xl p-8 md:p-10 shadow-elevated">
              <h2 className="font-display text-2xl font-bold text-card-foreground mb-3">
                Press &amp; Media
              </h2>
              <p className="text-sm text-card-foreground/90 leading-relaxed mb-2">
                Working on a travel story? Tom is available for expert commentary on Canadian travel trends, all-inclusive resorts, cruise travel, and the travel industry.
              </p>
              <p className="text-sm text-card-foreground/90 leading-relaxed">
                Reach out at <a href="mailto:press@reviewthengo.com" className="text-primary underline">press@reviewthengo.com</a> or via the <a href="/contact" className="text-primary underline">contact page</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
