import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";

import packingImg from "@/assets/curacao-gallery-6.webp";
import guidesImg from "@/assets/deal-santorini.jpg";
import budgetImg from "@/assets/deal-cruise.jpg";
import insuranceImg from "@/assets/deal-alps.jpg";
import timingImg from "@/assets/deal-maldives.jpg";

const articles = [
  {
    id: 1,
    title: "Essential Packing Tips for Beach Destinations",
    category: "Packing",
    image: packingImg,
    excerpt: "Master the art of packing light while having everything you need for sun, sand, and adventure.",
    categoryColor: "bg-blue-500",
  },
  {
    id: 2,
    title: "Destination Guides: Where to Go Next",
    category: "Guides",
    image: guidesImg,
    excerpt: "Curated recommendations for every type of traveler, from romantic getaways to family adventures.",
    categoryColor: "bg-emerald-500",
  },
  {
    id: 3,
    title: "Budget Travel Hacks That Actually Work",
    category: "Budget",
    image: budgetImg,
    excerpt: "Smart strategies to stretch your travel budget without sacrificing comfort or experience.",
    categoryColor: "bg-amber-500",
  },
  {
    id: 4,
    title: "Travel Insurance: What You Really Need",
    category: "Insurance",
    image: insuranceImg,
    excerpt: "Understanding coverage options and why the right policy can save your trip.",
    categoryColor: "bg-purple-500",
  },
  {
    id: 5,
    title: "Best Times to Visit Popular Destinations",
    category: "Timing",
    image: timingImg,
    excerpt: "Seasonal guides to help you plan the perfect trip with ideal weather and fewer crowds.",
    categoryColor: "bg-teal-500",
  },
];

const CompassSection = () => {
  return (
    <section id="compass" className="py-24 bg-warm-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Travel Intel
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            The Compass
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insider tips and travel wisdom from over a decade of experience as a travel consultant.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {articles.map((article, index) => (
              <CarouselItem 
                key={article.id} 
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div 
                  className="group relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image with gradient overlay */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Category badge */}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-medium ${article.categoryColor}`}>
                      {article.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <button className="inline-flex items-center gap-2 text-primary font-medium text-sm group/link">
                      Read More 
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6" />
        </Carousel>
      </div>
    </section>
  );
};

export default CompassSection;
