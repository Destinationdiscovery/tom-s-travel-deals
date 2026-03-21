import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight } from "lucide-react";

const ALL_TRENDING = [
  { label: "Best hotels in Cancun 2026", path: "/reviews/best-hotels-cancun-2026" },
  { label: "Is Thailand worth it?", path: "/reviews/is-thailand-worth-it" },
  { label: "Best time to visit Greece", path: "/best-time?q=Greece" },
  { label: "Tokyo itinerary 5 days", path: "/itinerary?q=Tokyo+5+days" },
  { label: "Mexico peso exchange rate", path: "/currency?q=Mexico" },
  { label: "NYC to London flights", path: "/flights?q=NYC+to+London" },
  { label: "Bali packing list", path: "/gear?q=Bali+beach+trip" },
  { label: "Dubai all-inclusive reviews", path: "/reviews/dubai-all-inclusive-resorts" },
  { label: "Best time Bali 2026", path: "/best-time?q=Bali" },
  { label: "Caribbean cruise reviews", path: "/reviews/caribbean-cruise-reviews" },
  { label: "Paris weekend itinerary", path: "/itinerary?q=Paris+weekend" },
  { label: "Euro exchange rate tips", path: "/currency?q=Europe" },
  { label: "Punta Cana resort reviews", path: "/reviews/punta-cana-resort-reviews" },
  { label: "Japan cherry blossom 2026", path: "/best-time?q=Japan" },
  { label: "Toronto to Cancun flights", path: "/flights?q=Toronto+to+Cancun" },
  { label: "Maldives honeymoon reviews", path: "/reviews/maldives-honeymoon-resorts" },
  { label: "Italy 7 day itinerary", path: "/itinerary?q=Italy+7+days" },
  { label: "Costa Rica packing list", path: "/gear?q=Costa+Rica+adventure+trip" },
  { label: "Best time Portugal", path: "/best-time?q=Portugal" },
  { label: "LA to Tokyo flight deals", path: "/flights?q=LA+to+Tokyo" },
  { label: "Turks and Caicos reviews", path: "/reviews/turks-and-caicos-resorts" },
  { label: "Swiss franc travel tips", path: "/currency?q=Switzerland" },
  { label: "Vietnam backpacking guide", path: "/gear?q=Vietnam+backpacking" },
  { label: "Best time to visit Iceland", path: "/best-time?q=Iceland" },
  { label: "Aruba all-inclusive 2026", path: "/reviews/aruba-all-inclusive-resorts" },
  { label: "Morocco itinerary 5 days", path: "/itinerary?q=Morocco+5+days" },
  { label: "Hawaiian resort reviews", path: "/reviews/hawaii-resort-reviews" },
  { label: "Best time South Africa", path: "/best-time?q=South+Africa" },
  { label: "London hotel reviews", path: "/reviews/london-hotel-reviews" },
  { label: "British pound exchange", path: "/currency?q=United+Kingdom" },
  { label: "NYC to Paris deals", path: "/flights?q=NYC+to+Paris" },
  { label: "Santorini honeymoon", path: "/reviews/santorini-honeymoon-hotels" },
  { label: "Peru itinerary 10 days", path: "/itinerary?q=Peru+10+days" },
  { label: "Thailand packing essentials", path: "/gear?q=Thailand+beach+trip" },
  { label: "Best time Croatia", path: "/best-time?q=Croatia" },
  { label: "Cuba resort reviews", path: "/reviews/cuba-all-inclusive-resorts" },
  { label: "Australian dollar tips", path: "/currency?q=Australia" },
  { label: "Lisbon weekend itinerary", path: "/itinerary?q=Lisbon+weekend" },
  { label: "Jamaica family resorts", path: "/reviews/jamaica-family-resorts" },
  { label: "Best time to visit Egypt", path: "/best-time?q=Egypt" },
  { label: "Ski trip packing list", path: "/gear?q=Ski+trip+essentials" },
  { label: "Chicago to Miami flights", path: "/flights?q=Chicago+to+Miami" },
  { label: "Tulum boutique hotels", path: "/reviews/tulum-boutique-hotels" },
  { label: "Turkish lira exchange", path: "/currency?q=Turkey" },
  { label: "Barcelona 3 day plan", path: "/itinerary?q=Barcelona+3+days" },
  { label: "Best time New Zealand", path: "/best-time?q=New+Zealand" },
  { label: "Dominican Republic reviews", path: "/reviews/dominican-republic-resorts" },
  { label: "Camping gear essentials", path: "/gear?q=Camping+trip+essentials" },
  { label: "Vancouver to Hawaii", path: "/flights?q=Vancouver+to+Hawaii" },
  { label: "Best time to visit Norway", path: "/best-time?q=Norway" },
];

const TrendingQueriesSection = () => {
  const displayed = useMemo(() => {
    const shuffled = [...ALL_TRENDING].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, []);

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-secondary" />
          Trending Now
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayed.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="group flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all text-sm font-medium text-foreground hover:text-primary"
            >
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingQueriesSection;
