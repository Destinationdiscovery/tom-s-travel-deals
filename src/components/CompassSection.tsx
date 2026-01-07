import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { compassArticles } from "@/data/compassArticles";
import { Button } from "@/components/ui/button";

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
            {compassArticles.map((article, index) => (
              <CarouselItem 
                key={article.id} 
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <Link 
                  to={`/compass/${article.slug}`}
                  className="group block relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-up"
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
                    <span className="inline-flex items-center gap-2 text-primary font-medium text-sm group/link">
                      Read More 
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6" />
        </Carousel>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/compass">
            <Button variant="outline" size="lg">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CompassSection;
