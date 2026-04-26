import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEmailSignup } from "@/lib/analytics";

const NewsletterCTASection = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("subscribe", {
        body: { email: trimmed, source_slug: "newsletter-cta", interests: ["weekly"] },
      });
      if (error) throw error;
      trackEmailSignup("newsletter-cta");
      toast({ title: "You're in! 🎉", description: "Check your inbox for The Compass Weekly." });
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            The Compass Weekly
          </h2>
          <p className="text-muted-foreground text-base mb-6">
            Get hand-picked travel deals, packing tips, and travel news. Every week, free.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
              className="flex-1 h-11"
            />
            <Button type="submit" disabled={submitting} className="h-11 px-6 font-semibold">
              {submitting ? "Subscribing..." : (
                <>
                  Subscribe <Send className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTASection;
