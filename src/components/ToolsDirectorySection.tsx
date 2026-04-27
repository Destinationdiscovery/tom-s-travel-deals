import { Link } from "react-router-dom";
import { Search, Sun, Map, Plane, Backpack, DollarSign, Shield, Globe, ArrowRight } from "lucide-react";

const tools = [
  {
    icon: Search,
    title: "Hotel and Resort Reviews",
    href: "/destinations",
    description: "Search any hotel, resort, Airbnb, or all-inclusive worldwide. We aggregate reviews from 10+ trusted sources including Google, TripAdvisor, Booking.com, and Reddit to give you a clear verdict with pros, cons, and a recommendation.",
    questions: [
      "Best all-inclusive resorts in Cancun?",
      "Is Atlantis The Royal worth the price?",
      "Family-friendly hotels in Orlando reviews",
    ],
  },
  {
    icon: Sun,
    title: "Best Time to Visit Any Destination",
    href: "/best-time",
    description: "Find the best month to visit any country or city. Get weather forecasts by season, crowd levels, flight price trends, and local events and festivals so you can plan around the cheapest or best weather windows.",
    questions: [
      "Best time to visit Japan for cherry blossoms?",
      "Cheapest month to fly to Bali?",
      "When is rainy season in Costa Rica?",
    ],
  },
  {
    icon: Map,
    title: "Travel Itinerary Builder",
    href: "/itinerary",
    description: "Build a personalized day-by-day travel itinerary for any destination. Get detailed activity schedules, restaurant recommendations, estimated daily costs, transportation tips, and packing suggestions.",
    questions: [
      "5-day Tokyo itinerary on a budget?",
      "Romantic weekend in Paris plan?",
      "7-day Bali adventure itinerary?",
    ],
  },
  {
    icon: Plane,
    title: "Flight Deals and Cheap Flights",
    href: "/flights",
    description: "Search for the best upcoming flight deals on any route. Compare prices across airlines, find the cheapest months to fly, and book directly through Expedia with affiliate savings.",
    questions: [
      "Cheap flights from NYC to London?",
      "Toronto to Cancun flight deals?",
      "When are flights to Hawaii cheapest?",
    ],
  },
  {
    icon: Backpack,
    title: "Trip Packing Lists and Travel Gear",
    href: "/gear",
    description: "Get a personalized packing list for any trip based on your destination, weather, and activities. Each item includes product recommendations with real Amazon reviews and purchase links.",
    questions: [
      "What to pack for a Cancun beach trip?",
      "Japan winter packing list?",
      "Europe backpacking essentials?",
    ],
  },
  {
    icon: DollarSign,
    title: "Travel Currency Exchange Rates",
    href: "/currency",
    description: "Check live exchange rates, quick conversion tables, and travel money-saving tips for any destination currency. Convert USD, CAD, EUR, and more to any local currency with up-to-date rates.",
    questions: [
      "USD to Mexican Peso rate today?",
      "How much is 100 euros in yen?",
      "Best way to exchange money in Thailand?",
    ],
  },
  {
    icon: Shield,
    title: "Destination Safety Scores and Scam Alerts",
    href: "/safety",
    description: "Get safety ratings, common scam alerts, health tips, emergency contact numbers, safest areas, and areas to avoid for any travel destination worldwide.",
    questions: [
      "Is Mexico City safe for tourists?",
      "Common scams in Paris?",
      "Bali health tips for travelers?",
    ],
  },
  {
    icon: Globe,
    title: "Travel Advisories, Visa Requirements, and Entry Rules",
    href: "/travel-intel",
    description: "Check entry requirements, visa policies, and health documents needed for any destination based on your citizenship. Get current government safety advisories and the latest travel news.",
    questions: [
      "Do Canadians need a visa for Cuba?",
      "Thailand travel advisory 2026?",
      "COVID entry rules for Japan?",
    ],
  },
];

const ToolsDirectorySection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          Our 8 Free Travel Planning Tools
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          Everything you need to plan a trip from start to finish, without visiting multiple websites. Each tool is free, fast, and powered by real-time data.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="group bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all flex flex-col cursor-pointer"
              aria-label={`Open ${tool.title} tool`}
            >
              <div className="flex items-center gap-2 mb-3">
                <tool.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <h3 className="font-display font-semibold text-foreground text-sm">{tool.title}</h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3 flex-1">{tool.description}</p>
              <ul className="mb-4 space-y-1">
                {tool.questions.map((q) => (
                  <li key={q} className="text-xs text-muted-foreground/80 italic">"{q}"</li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-auto group-hover:gap-2 transition-all">
                Try this tool <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsDirectorySection;
