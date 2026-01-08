import { useParams, Link } from "react-router-dom";
import { Star, Check, X, ArrowLeft, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { gearReviews } from "@/data/gearReviews";

const GearReview = () => {
  const { slug } = useParams<{ slug: string }>();
  const gear = gearReviews.find((g) => g.slug === slug);

  if (!gear) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Gear not found</h1>
            <Link to="/gear">
              <Button variant="outline">Back to Gear Reviews</Button>
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Back Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Link to="/gear" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Gear Reviews
          </Link>
        </div>

        {/* Hero Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Product Image */}
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={gear.image}
                  alt={gear.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-primary text-primary-foreground">
                  {gear.category}
                </Badge>
                <p className="text-muted-foreground mb-2">{gear.brand}</p>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {gear.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < gear.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground font-semibold">{gear.rating}/5</span>
                </div>

                {/* Key Stats */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge variant="outline" className="text-sm">
                    Price: {gear.price}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Tested: {gear.testedOn}
                  </Badge>
                </div>

                <p className="text-muted-foreground mb-6 text-lg">
                  {gear.excerpt}
                </p>

                {/* Amazon Button */}
                <a href={gear.amazonLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 w-full md:w-auto">
                    Check Price on Amazon
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>

                {/* Affiliate Disclosure */}
                <p className="text-xs text-muted-foreground mt-4 italic">
                  This post contains affiliate links. If you purchase through these links, I may earn a small commission at no extra cost to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pros & Cons */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              The Verdict
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Pros */}
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    What I Love
                  </h3>
                  <ul className="space-y-3">
                    {gear.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Cons */}
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <X className="h-5 w-5 text-red-500" />
                    What Could Be Better
                  </h3>
                  <ul className="space-y-3">
                    {gear.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <X className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Full Review */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                My Experience
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {gear.fullReview}
              </p>
            </div>
          </div>
        </section>

        {/* Best For */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Best For
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {gear.bestFor.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <a href={gear.amazonLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                Check Price on Amazon
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Affiliate link – I may earn a small commission at no extra cost to you.
            </p>
          </div>
        </section>

        {/* Related Gear */}
        {relatedGear.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                More {gear.category} Reviews
              </h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < related.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {related.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GearReview;
