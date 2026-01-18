import { Star, ArrowRight, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import cubaImg from "@/assets/deal-cuba.jpg";
import curacaoImg from "@/assets/curacao-hero.avif";
import mexicoImg from "@/assets/mexico-hero.webp";
import vegasImg from "@/assets/vegas-gallery-1.jpg";
import cruiseImg from "@/assets/cruise-hero.jpg";

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
    slug: "mexico-barcelo-riviera",
    image: mexicoImg,
    destination: "Barceló Maya Riviera Adults Only",
    country: "Riviera Maya, Mexico",
    teaser: "A grand, modern adults-only resort that delivers a luxury feel, incredible pools, excellent dining, and outstanding value for the Riviera Maya.",
    rating: 4.9,
    dateVisited: "September 2025",
    hasVideo: false,
  },
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
    slug: "curacao-blue-bay",
    image: curacaoImg,
    destination: "Villa in Blue Bay Resort",
    country: "Curaçao",
    teaser: "A luxury private villa with an infinity pool that offered space, privacy, and easy access to some of Curaçao's best beaches.",
    rating: 5,
    dateVisited: "November 2024",
    hasVideo: false,
  },
  {
    slug: "vegas-bellagio",
    image: vegasImg,
    destination: "Bellagio",
    country: "Las Vegas, USA",
    teaser: "After more than 30 trips to Vegas and stays all over the Strip, Bellagio is still the resort I come back to the most.",
    rating: 4.5,
    dateVisited: "February 2025",
    hasVideo: false,
  },
  {
    slug: "cruise-experience",
    image: cruiseImg,
    destination: "Cruising as a Travel Experience",
    country: "Caribbean & Alaska",
    teaser: "After more than 15 years of cruising in the Caribbean and Alaska, cruising still stands out as one of the easiest ways to travel if you plan it properly.",
    rating: 4.0,
    dateVisited: "15+ years experience",
    hasVideo: false,
  },
];

const TravelStoriesSection = () => {
  return (
    <section id="destinations" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
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

        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {destinations.map((dest, index) => (
                <CarouselItem key={dest.slug} className="pl-4 basis-full md:basis-1/3">
                  <Link 
                    to={`/destinations/${dest.slug}`}
                    className="group block h-full"
                  >
                    <article 
                      className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 h-full"
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>

        <div className="text-center mt-8">
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