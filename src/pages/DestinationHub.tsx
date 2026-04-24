import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Map, DollarSign, Plane, ShieldCheck, Brain, ArrowRight, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import SEOHead from "@/components/SEOHead";
import { DESTINATION_HUBS } from "@/data/destinationHubs";

const TOOL_LINKS = (cityName: string, citySlug: string) => [
  { to: `/best-time?dest=${encodeURIComponent(cityName)}`, label: `Best Time to Visit ${cityName}`, icon: Calendar, desc: "Weather, crowds, prices by month" },
  { to: `/itinerary?dest=${encodeURIComponent(cityName)}`, label: `${cityName} Itinerary Builder`, icon: Map, desc: "Day-by-day AI plan with costs" },
  { to: `/safety?dest=${encodeURIComponent(cityName)}`, label: `${cityName} Safety Score`, icon: ShieldCheck, desc: "Scam alerts, safe areas, health tips" },
  { to: `/flights?dest=${encodeURIComponent(cityName)}`, label: `Flights to ${cityName}`, icon: Plane, desc: "Cheapest months and routes" },
  { to: `/travel-intel?dest=${encodeURIComponent(cityName)}`, label: `Visa & Entry for ${cityName}`, icon: Brain, desc: "Visa rules, vaccines, advisories" },
  { to: `/currency?dest=${encodeURIComponent(cityName)}`, label: `${cityName} Currency`, icon: DollarSign, desc: "Live rates and money tips" },
];

const DestinationHub = () => {
  const { city } = useParams<{ city: string }>();
  const hub = DESTINATION_HUBS.find((h) => h.slug === city);

  if (!hub) {
    return <Navigate to="/destinations" replace />;
  }

  const tools = TOOL_LINKS(hub.name, hub.slug);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${hub.name} Travel Guide: Hotels, Best Time, Itinerary & Safety`}
        description={`Plan your ${hub.name} trip. ${hub.summary.slice(0, 110)}`}
        url={`/destinations/city/${hub.slug}`}
        keywords={[
          `${hub.name} travel guide`,
          `things to do in ${hub.name}`,
          `${hub.name} itinerary`,
          `best time to visit ${hub.name}`,
          `${hub.name} safety`,
          `flights to ${hub.name}`,
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Destinations", url: "/destinations" },
          { name: hub.name, url: `/destinations/city/${hub.slug}` },
        ]}
        faq={hub.faqs.map((f) => ({ question: f.q, answer: f.a }))}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: hub.name,
          description: hub.summary,
          url: `https://www.reviewthengo.com/destinations/city/${hub.slug}`,
          touristType: ["Leisure traveler", "Family traveler", "Solo traveler"],
          address: {
            "@type": "PostalAddress",
            addressCountry: hub.country,
          },
        }}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <main id="main-content" className="pt-24">
        {/* Hero */}
        <section className="container mx-auto px-4 py-12">
          <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/destinations" className="hover:text-primary">Destinations</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{hub.name}</span>
          </nav>
          <div className="flex items-center gap-2 text-primary mb-3">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">{hub.country} · {hub.region}</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            {hub.name} Travel Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">{hub.summary}</p>
        </section>

        {/* Quick facts */}
        <section className="container mx-auto px-4 pb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold text-card-foreground mb-3">Best Months to Visit</h2>
              <div className="flex flex-wrap gap-2">
                {hub.bestMonths.map((m) => (
                  <span key={m} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{m}</span>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold text-card-foreground mb-3">Why Visit {hub.name}</h2>
              <ul className="space-y-1.5 text-sm text-card-foreground/90">
                {hub.highlights.map((h) => (
                  <li key={h} className="flex gap-2"><span className="text-primary">•</span>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Tool grid */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            Plan Your {hub.name} Trip
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="group bg-card border border-border rounded-2xl p-5 hover:shadow-elevated hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground text-sm mb-1 group-hover:text-primary transition-colors">{tool.label}</h3>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Hotel reviews CTA */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Hotel &amp; Resort Reviews in {hub.name}
            </h2>
            <p className="text-muted-foreground mb-5 max-w-xl mx-auto">
              Search any property in {hub.name} for an aggregated review from 10+ sources, including pros, cons, and a clear "worth it?" verdict.
            </p>
            <Link
              to={`/reviews/${encodeURIComponent(hub.name.toLowerCase().replace(/\s+/g, "-"))}-hotels`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Search {hub.name} Hotels <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            {hub.name} Travel FAQ
          </h2>
          <div className="space-y-4 max-w-3xl">
            {hub.faqs.map((f) => (
              <div key={f.q} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-card-foreground mb-2">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related blog */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Looking for more {hub.region} travel inspiration?</p>
            <Link to="/compass" className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline">
              Read the Compass blog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DestinationHub;
