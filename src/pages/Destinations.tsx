import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, ArrowRight, Play, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import santoriniImg from "@/assets/deal-santorini.jpg";
import maldivesImg from "@/assets/deal-maldives.jpg";
import cruiseImg from "@/assets/deal-cruise.jpg";
import alpsImg from "@/assets/deal-alps.jpg";

interface Destination {
  slug: string;
  image: string;
  destination: string;
  country: string;
  region: string;
  teaser: string;
  rating: number;
  dateVisited: string;
  hasVideo: boolean;
  tags: string[];
}

const destinations: Destination[] = [
  {
    slug: "santorini-greece",
    image: santoriniImg,
    destination: "Santorini",
    country: "Greece",
    region: "Europe",
    teaser: "The sunsets here changed my perspective on what 'breathtaking' really means. Here's everything you need to know before you go.",
    rating: 4.8,
    dateVisited: "October 2024",
    hasVideo: true,
    tags: ["Romance", "Beach", "Photography"],
  },
  {
    slug: "maldives-overwater",
    image: maldivesImg,
    destination: "Maldives",
    country: "Indian Ocean",
    region: "Asia",
    teaser: "Is the hype real? I spent a week in an overwater bungalow to find out. Spoiler: bring snorkel gear.",
    rating: 4.9,
    dateVisited: "March 2024",
    hasVideo: true,
    tags: ["Luxury", "Beach", "Snorkeling"],
  },
  {
    slug: "caribbean-cruise",
    image: cruiseImg,
    destination: "Caribbean Cruise",
    country: "Various Islands",
    region: "Caribbean",
    teaser: "Island hopping with a group of friends—here's what we loved, what surprised us, and what we'd do differently.",
    rating: 4.5,
    dateVisited: "January 2024",
    hasVideo: false,
    tags: ["Cruise", "Group Travel", "Beach"],
  },
  {
    slug: "swiss-alps",
    image: alpsImg,
    destination: "Swiss Alps",
    country: "Switzerland",
    region: "Europe",
    teaser: "Mountain views that make you feel tiny in the best way. Perfect for adventure seekers and nature lovers alike.",
    rating: 4.7,
    dateVisited: "August 2023",
    hasVideo: true,
    tags: ["Adventure", "Mountains", "Hiking"],
  },
];

const Destinations = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 bg-warm-gradient">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Destination Reviews
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real stories from real travels. Every destination here, I've walked those streets, 
              tasted that food, and captured those moments myself.
            </p>
          </div>
        </section>

        {/* Destinations Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">{destinations.length} destinations reviewed</p>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest, index) => (
                <Link 
                  key={dest.slug}
                  to={`/destinations/${dest.slug}`}
                  className="group block"
                >
                  <article 
                    className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 animate-fade-up h-full flex flex-col"
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
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
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

                      <p className="text-muted-foreground text-sm flex-1">
                        {dest.teaser}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {dest.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all pt-2">
                        Read My Review <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;