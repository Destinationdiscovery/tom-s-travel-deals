import { Star, ArrowRight, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import santoriniImg from "@/assets/deal-santorini.jpg";
import maldivesImg from "@/assets/deal-maldives.jpg";
import cruiseImg from "@/assets/deal-cruise.jpg";
import cubaImg from "@/assets/deal-cuba.jpg";

interface DestinationPreview {
  slug: string;
  image: string;
  destination: string;
  country: string;
  teaser: string;
  rating: number;
  dateVisited: string;
  hasVideo: boolean;
}

const destinations: DestinationPreview[] = [
  {
    slug: "cuba-vila-gale",
    image: cubaImg,
    destination: "Vila Galé Paredón",
    country: "Cayo Coco, Cuba",
    teaser: "Better than expected for Cuba, delivering strong value at a fraction of typical Caribbean prices.",
    rating: 4,
    dateVisited: "December 2024",
    hasVideo: false,
  },
  {
    slug: "santorini-greece",
    image: santoriniImg,
    destination: "Santorini",
    country: "Greece",
    teaser: "The sunsets here changed my perspective on what 'breathtaking' really means. Here's everything you need to know before you go.",
    rating: 4.8,
    dateVisited: "October 2024",
    hasVideo: true,
  },
  {
    slug: "maldives-overwater",
    image: maldivesImg,
    destination: "Maldives",
    country: "Indian Ocean",
    teaser: "Is the hype real? I spent a week in an overwater bungalow to find out. Spoiler: bring snorkel gear.",
    rating: 4.9,
    dateVisited: "March 2024",
    hasVideo: true,
  },
];

const TravelStoriesSection = () => {
  return (
    <section id="destinations" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
            Real Experiences
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Destination Discovery
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Honest reviews from my travels - the good, the great, and everything in between. 
            Photos, videos, and tips from real experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest, index) => (
            <Link 
              key={dest.slug}
              to={`/destinations/${dest.slug}`}
              className="group block"
            >
              <article 
                className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.destination}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  
                  {dest.hasVideo && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Play className="h-3 w-3 fill-current" />
                      Video
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4">
                    <p className="text-primary-foreground/80 text-sm">{dest.country}</p>
                    <h3 className="font-display text-2xl font-bold text-primary-foreground">
                      {dest.destination}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(dest.rating) ? 'text-accent fill-accent' : 'text-muted-foreground'}`} 
                        />
                      ))}
                      <span className="text-sm font-medium text-foreground ml-1">{dest.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{dest.dateVisited}</span>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {dest.teaser}
                  </p>

                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Read My Review <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/destinations">
            <Button variant="outline" size="lg" className="gap-2">
              View All Destinations <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TravelStoriesSection;