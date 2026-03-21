import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import { Globe, Heart, MapPin, Camera, ShieldCheck, Scale } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import heroImg from "@/assets/snowbird-caribbean-aerial.jpg";

const features = [
  {
    icon: Globe,
    title: "190+ Countries Covered",
    description: "From Caribbean beaches to Asian temples to European cities — we aggregate reviews for properties worldwide.",
  },
  {
    icon: Heart,
    title: "Passionate Travel Advocate",
    description: "Travel has transformed my life, and I built ReviewThenGo to help every traveler make confident decisions.",
  },
  {
    icon: Camera,
    title: "Real Experiences Shared",
    description: "No stock photos here — our reviews feature real photos, videos, and honest opinions from verified travelers.",
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
        title="About ReviewThenGo"
        description="ReviewThenGo aggregates real traveler reviews from 10+ sources into honest verdicts for hotels, resorts, and destinations worldwide. No pay-for-play, ever."
        url="/about"
        keywords={["about ReviewThenGo", "travel review aggregator", "honest hotel reviews", "real traveler feedback"]}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center">
          <img src={heroImg} alt="Aerial view of tropical destination" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-3">
              About <span className="text-primary-foreground">ReviewThenGo</span>
            </h1>
            <p className="text-white/80 text-lg">Real insights for real travelers — worldwide.</p>
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
                    Planning a trip shouldn't mean drowning in thousands of reviews across a dozen websites.
                    ReviewThenGo was built to solve that — we aggregate real traveler feedback from 10+ trusted
                    sources and distill it into clear, honest verdicts.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                    Whether you're checking a beach resort in Bali, a boutique hotel in Paris, or a golf club
                    in Dubai, you'll get the pros, cons, and a straight "worth it?" answer in seconds.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    No pay-for-play. No sponsored rankings. Just real insights so you can book with confidence.
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
                    <h3 className="font-display text-xl font-bold text-card-foreground">No Pay-for-Play — Ever</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Properties cannot pay to improve their ReviewThenGo verdict. Our revenue comes from clearly
                    disclosed affiliate links and advertising — never from review manipulation.
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
                      "The world is a book, and those who do not travel read only one page." — Saint Augustine
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
