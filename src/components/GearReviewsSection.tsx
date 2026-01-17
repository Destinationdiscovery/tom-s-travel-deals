import { Star, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { gearReviews } from "@/data/gearReviews";

const GearReviewsSection = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Travel Gear Discovery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Items I've personally used and tested while traveling. Honest reviews from a travel consultant who's been there.
          </p>
        </div>

        <div className="relative px-12 mb-10">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {gearReviews.map((gear) => (
                <CarouselItem key={gear.id} className="pl-4 basis-full md:basis-1/3">
                  <Link to={`/gear/${gear.slug}`} className="block h-full">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/50 bg-card">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img
                          src={gear.image}
                          alt={gear.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                          {gear.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => {
                            const filled = i < Math.floor(gear.rating);
                            const half = i === Math.floor(gear.rating) && gear.rating % 1 !== 0;
                            return (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  filled
                                    ? "fill-primary text-primary"
                                    : half
                                    ? "fill-primary/50 text-primary"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{gear.brand}</p>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {gear.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {gear.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="bg-muted px-2 py-1 rounded">Tested: {gear.testedOn}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>

        <div className="text-center">
          <Link to="/gear">
            <Button variant="outline" size="lg" className="gap-2">
              View All Gear Reviews
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GearReviewsSection;
