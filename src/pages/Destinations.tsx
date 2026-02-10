import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, ArrowRight, Play, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImg from "@/assets/snowbird-caribbean-aerial.jpg";
import cubaImg from "@/assets/deal-cuba.jpg";
import curacaoImg from "@/assets/curacao-hero.avif";
import mexicoImg from "@/assets/mexico-hero.webp";
import vegasImg from "@/assets/vegas-gallery-1.jpg";
import cruiseImg from "@/assets/cruise-hero.jpg";

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
    slug: "mexico-barcelo-riviera",
    image: mexicoImg,
    destination: "Barceló Maya Riviera Adults Only",
    country: "Riviera Maya, Mexico",
    region: "Caribbean",
    teaser: "A grand, modern adults-only resort that delivers a luxury feel, incredible pools, excellent dining, and outstanding value for the Riviera Maya.",
    rating: 4.9,
    dateVisited: "September 2025",
    hasVideo: false,
    tags: ["Adults-Only", "Luxury", "All-Inclusive", "Pool"],
  },
  {
    slug: "cuba-vila-gale",
    image: cubaImg,
    destination: "Vila Galé Paredón",
    country: "Cayo Coco, Cuba",
    region: "Caribbean",
    teaser: "Better than expected for Cuba, delivering strong value at a fraction of typical Caribbean prices.",
    rating: 4,
    dateVisited: "December 2024",
    hasVideo: false,
    tags: ["Budget", "Beach", "All-Inclusive"],
  },
  {
    slug: "curacao-blue-bay",
    image: curacaoImg,
    destination: "Villa in Blue Bay Resort",
    country: "Curaçao",
    region: "Caribbean",
    teaser: "A luxury private villa with an infinity pool that offered space, privacy, and easy access to some of Curaçao's best beaches.",
    rating: 5,
    dateVisited: "November 2024",
    hasVideo: false,
    tags: ["Villa", "Luxury", "Beach", "Privacy"],
  },
  {
    slug: "vegas-bellagio",
    image: vegasImg,
    destination: "Bellagio",
    country: "Las Vegas, USA",
    region: "North America",
    teaser: "After more than 30 trips to Vegas and stays all over the Strip, Bellagio is still the resort I come back to the most. It's upscale without feeling stuffy, perfectly located, and consistently delivers the full Vegas experience.",
    rating: 4.5,
    dateVisited: "February 2025",
    hasVideo: false,
    tags: ["Casino", "Luxury", "City", "Iconic"],
  },
  {
    slug: "cruise-experience",
    image: cruiseImg,
    destination: "Cruising as a Travel Experience",
    country: "Caribbean & Alaska",
    region: "Multiple",
    teaser: "After more than 15 years of cruising in the Caribbean and Alaska, cruising still stands out as one of the easiest ways to travel if you plan it properly and know what to expect.",
    rating: 4.0,
    dateVisited: "15+ years experience",
    hasVideo: false,
    tags: ["Cruise", "Caribbean", "Alaska", "Multi-destination"],
  },
];

const Destinations = () => {
  useEffect(() => {
    document.title = "Destination Reviews - ReviewThenGo";
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center pt-20">
          <img src={heroImg} alt="Aerial view of a Caribbean beach" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-sky-300">My</span> Reviews
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
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