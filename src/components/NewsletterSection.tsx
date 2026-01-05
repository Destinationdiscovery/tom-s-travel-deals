import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success(`Thanks ${name}! You'll receive exclusive deals soon.`);
    setEmail("");
    setName("");
  };

  return (
    <section id="newsletter" className="py-24 bg-hero-gradient relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Exclusive Member Benefits</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Never Miss a Deal Again
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10">
            Join my travel deals newsletter and be the first to know about flash sales, 
            last-minute getaways, and exclusive group vacation offers.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 pl-12 bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <span className="text-primary-foreground/60">👋</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-12 bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/60" />
            </div>

            <Button variant="warm" size="xl" type="submit" className="w-full gap-2">
              <Send className="h-5 w-5" />
              Subscribe to Deals Newsletter
            </Button>
          </form>

          <p className="text-sm text-primary-foreground/60 mt-6">
            No spam, ever. Unsubscribe anytime. Your email is safe with me.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
