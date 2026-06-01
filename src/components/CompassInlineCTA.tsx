import { useState } from "react";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEmailSignup } from "@/lib/analytics";

interface CompassInlineCTAProps {
  /** Tag the lead with the article slug so we can attribute conversions. */
  articleSlug?: string;
  className?: string;
}

/**
 * Mid-article inline capture block for The Compass blog posts.
 */
const CompassInlineCTA = ({ articleSlug, className = "" }: CompassInlineCTAProps) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setSubmitting(true);
    try {
      const source = articleSlug ? `compass-inline-${articleSlug}` : "compass-inline";
      const { error } = await supabase.functions.invoke("subscribe", {
        body: { email: trimmed, source_slug: source, interests: ["compass", "blog"] },
      });
      if (error) throw error;
      trackEmailSignup(source);
      toast({ title: "You're on The Compass list.", description: "The next edition lands soon." });
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside
      className={`not-prose my-10 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 via-primary/5 to-accent/10 p-6 md:p-8 ${className}`}
      aria-label="Subscribe to The Compass"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/15">
          <Compass className="h-5 w-5 text-secondary" />
        </div>
        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
          Enjoying this? Get The Compass.
        </h3>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-5">
        One destination, fully briefed, every two weeks. Best time to visit, a sample itinerary, safety notes, and current flight and hotel deals. Short, free, no spam.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email address"
          className="flex-1 h-11"
        />
        <Button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {submitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </aside>
  );
};

export default CompassInlineCTA;
