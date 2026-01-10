import { useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gearReviews, gearCategories } from "@/data/gearReviews";

const Gear = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredGear = activeCategory === "All" 
    ? gearReviews 
    : gearReviews.filter(gear => gear.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Travel Gear Discovery
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Items I've personally used and tested while traveling. Honest, expert reviews from a travel consultant who's been there.
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {gearCategories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Gear Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGear.map((gear) => (
                <Link key={gear.id} to={`/gear/${gear.slug}`}>
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
                      <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">
                        {gear.price}
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
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
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
              ))}
            </div>

            {filteredGear.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No gear reviews in this category yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Gear;
