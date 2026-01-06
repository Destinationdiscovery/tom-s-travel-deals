import DealCard from "./DealCard";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import santoriniImg from "@/assets/deal-santorini.jpg";
import maldivesImg from "@/assets/deal-maldives.jpg";
import cruiseImg from "@/assets/deal-cruise.jpg";
import alpsImg from "@/assets/deal-alps.jpg";

const deals = [
  {
    image: santoriniImg,
    destination: "Santorini, Greece",
    description: "Stunning sunsets, white-washed villages, and crystal-clear waters. The ultimate romantic getaway.",
    duration: "7 nights",
    type: "last-minute" as const,
  },
  {
    image: maldivesImg,
    destination: "Maldives Paradise",
    description: "Overwater bungalows, pristine beaches, and world-class snorkeling. Pure luxury awaits.",
    duration: "5 nights",
    type: "popular" as const,
  },
  {
    image: cruiseImg,
    destination: "Caribbean Cruise",
    description: "Island hop through paradise with friends. All-inclusive fun on the high seas.",
    duration: "7 nights",
    type: "group" as const,
    groupSize: "10-20 people",
  },
  {
    image: alpsImg,
    destination: "Swiss Alps Adventure",
    description: "Breathtaking mountain views, charming villages, and outdoor adventures for the whole group.",
    duration: "6 nights",
    type: "group" as const,
    groupSize: "8-15 people",
  },
];

const DealsSection = () => {
  return (
    <section id="deals" className="py-24 bg-warm-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Featured Adventures
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Ready for Your Next Journey?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Handpicked travel experiences I personally recommend. These are destinations I've explored 
            or know will deliver unforgettable memories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal, index) => (
            <div 
              key={deal.destination} 
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <DealCard {...deal} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.open("https://tom.travelonly.com/experiences", "_blank")}
            className="gap-2"
          >
            View All Experiences <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;