import { Button } from "@/components/ui/button";
import { Sparkles, Send } from "lucide-react";

const NewsletterSection = () => {
  return (
    <section id="newsletter" className="py-24 bg-hero-gradient relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Travel Consultant Insights</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Not Sure If a Destination Is Right for You?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10">
            I send occasional emails with honest pros and cons, practical planning tips, 
            and real expectations from destinations I personally visit and review. 
            Have a destination in mind? Request a review and I'll give you my honest assessment before you book.
          </p>

          <Button 
            variant="warm" 
            size="xl" 
            className="gap-2"
            asChild
          >
            <a 
              href="https://form.jotform.com/tlaracy/honest-destination-advice-from-a-tr" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Send className="h-5 w-5" />
              Get Honest Destination Advice
            </a>
          </Button>

          <p className="text-sm text-primary-foreground/60 mt-6">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
