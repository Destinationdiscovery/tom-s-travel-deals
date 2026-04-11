import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Saved me hours of research before our Bali trip. The aggregated reviews gave me confidence to book the right resort.",
    name: "Sarah M.",
    role: "Family Traveler",
    stars: 5,
  },
  {
    quote: "The review aggregation is exactly what I needed to compare resorts side-by-side for our honeymoon. Highly recommend.",
    name: "James K.",
    role: "Honeymoon Planner",
    stars: 5,
  },
  {
    quote: "Best free travel planning tool I've found. The itinerary builder and packing lists are incredibly useful.",
    name: "Rachel T.",
    role: "Solo Traveler",
    stars: 5,
  },
  {
    quote: "The itinerary builder alone is worth bookmarking. We used it for a 10-person group trip and it kept everything organized.",
    name: "David L.",
    role: "Group Trip Organizer",
    stars: 5,
  },
];

const TestimonialsSection = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          What Travelers Are Saying
        </h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Real feedback from travelers who planned their trips with ReviewThenGo.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-card rounded-2xl border border-border p-6 shadow-soft flex flex-col"
          >
            <Quote className="h-5 w-5 text-primary/40 mb-3" />
            <p className="text-sm text-foreground leading-relaxed flex-1">
              "{t.quote}"
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="font-semibold text-foreground text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
