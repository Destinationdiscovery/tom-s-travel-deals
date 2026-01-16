import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ArrowLeft, Lightbulb, ExternalLink, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { gearReviews } from "@/data/gearReviews";
import heroBeach from "@/assets/hero-beach.jpg";
const GearReview = () => {
  const { slug } = useParams<{ slug: string }>();
  const gear = gearReviews.find((g) => g.slug === slug);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!gear) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Gear not found</h1>
            <Link to="/gear">
              <Button variant="outline">Back to Gear Discovery</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedGear = gearReviews.filter(
    (g) => g.category === gear.category && g.id !== gear.id
  ).slice(0, 3);

  const gallery = gear.gallery || [gear.image];

  const ratingLabels: Record<string, string> = {
    buildQuality: "Build Quality",
    portability: "Portability",
    value: "Value",
    easeOfUse: "Ease of Use",
    durability: "Durability",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={heroBeach}
            alt="Travel Gear Discovery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container mx-auto">
              <Link 
                to="/gear" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Gear Discovery
              </Link>
              <Badge className="mb-3 bg-primary text-primary-foreground">
                {gear.category}
              </Badge>
              <p className="text-white/80 text-sm mb-1">{gear.brand}</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {gear.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Summary Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => {
                        const filled = i < Math.floor(gear.rating);
                        const half = i === Math.floor(gear.rating) && gear.rating % 1 !== 0;
                        return (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${
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
                    <span className="text-2xl font-bold text-foreground">{gear.rating}/5</span>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {gear.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Badge variant="outline" className="text-sm">
                      Price: {gear.price}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Tested: {gear.testedOn}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* My Experience */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  My Experience
                </h2>
                <div className="space-y-4">
                  {gear.fullReview.map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              {/* Amazon CTA */}
              {gear.amazonLink && (
                <Card className="border-primary bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardContent className="p-6 text-center">
                    <ShoppingCart className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      Interested in this gear?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You can check out the exact {gear.name} I use and read more reviews on Amazon.
                    </p>
                    <a
                      href={gear.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        View on Amazon
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      Affiliate link – I may earn a small commission at no extra cost to you.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Tom's Tips */}
              {gear.tips && gear.tips.length > 0 && (
                <section className="bg-muted/30 rounded-lg p-6">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    Tom's Tips
                  </h2>
                  <ol className="space-y-4">
                    {gear.tips.map((tip, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </span>
                        <p className="text-muted-foreground leading-relaxed pt-1">
                          {tip}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Photo Gallery */}
              {gallery.length > 1 && (
                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Photos
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${gear.name} - Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Gear */}
              {relatedGear.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    More {gear.category} Reviews
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {relatedGear.map((related) => (
                      <Link key={related.id} to={`/gear/${related.slug}`}>
                        <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                          <div className="aspect-square bg-muted relative overflow-hidden">
                            <img
                              src={related.image}
                              alt={related.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => {
                                const filled = i < Math.floor(related.rating);
                                const half = i === Math.floor(related.rating) && related.rating % 1 !== 0;
                                return (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
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
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {related.name}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Rating Breakdown */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                      Rating Breakdown
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(gear.ratings).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{ratingLabels[key]}</span>
                            <span className="font-medium text-foreground">{value}/5</span>
                          </div>
                          <Progress value={value * 20} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Best For */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                      Best For
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {gear.bestFor.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Buy Button */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <a 
                      href={gear.amazonLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button size="lg" className="w-full gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Buy on Amazon
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <p className="text-xs text-muted-foreground mt-4 text-center italic">
                      Affiliate link – I may earn a small commission at no extra cost to you.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GearReview;