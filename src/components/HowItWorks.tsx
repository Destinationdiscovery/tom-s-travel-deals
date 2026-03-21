import { Search, FileText, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Search Any Property",
    description: "Enter any hotel, resort, Airbnb, or destination. We pull reviews from 10+ trusted sources instantly.",
  },
  {
    icon: FileText,
    step: "2",
    title: "Read the Verdict",
    description: "Get a clear summary with real pros, cons, ratings, and a clear \"worth it?\" verdict, no fluff.",
  },
  {
    icon: CheckCircle,
    step: "3",
    title: "Book with Confidence",
    description: "Make your decision backed by thousands of real traveler experiences. No more review paralysis.",
  },
];

const HowItWorks = () => (
  <section className="py-16 md:py-20 bg-background" aria-labelledby="how-it-works-heading">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 id="how-it-works-heading" className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
          How ReviewThenGo Works
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Aggregated insights from real travelers, in three simple steps.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                <Icon className="h-7 w-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default HowItWorks;
