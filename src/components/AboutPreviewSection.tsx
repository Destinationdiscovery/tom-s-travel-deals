import { Link } from "@/lib/router-compat";
import { Info } from "lucide-react";

const AboutPreviewSection = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">About ReviewThenGo</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            ReviewThenGo is an all-in-one travel planning tool built and maintained by Tom in Ontario, Canada.
            It is designed for travelers who are tired of visiting 10+ websites to plan a single trip.
            ReviewThenGo aggregates unbiased reviews from trusted sources and offers 8 free tools covering every
            stage of trip planning — from researching destinations and reading hotel reviews to building itineraries,
            finding flight deals, checking safety scores, and packing. The site is completely free to use and supported
            by clearly disclosed affiliate links. No property pays for positive reviews.
          </p>
          <Link to="/about" className="text-sm font-medium text-primary hover:underline">
            Read the full story →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutPreviewSection;
