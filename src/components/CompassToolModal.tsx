import { useEffect, useState } from "react";
import { X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEmailSignup } from "@/lib/analytics";

interface CompassToolModalProps {
  open: boolean;
  onClose: () => void;
  toolSlug: string;
}

/**
 * Shown once per session after a user completes a tool run
 * (best-time, itinerary, safety, currency, flights, gear).
 */
const CompassToolModal = ({ open, onClose, toolSlug }: CompassToolModalProps) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setSubmitting(true);
    try {
      const source = `compass-tool-${toolSlug}`;
      const { error } = await supabase.functions.invoke("subscribe", {
        body: { email: trimmed, source_slug: source, interests: ["compass", toolSlug] },
      });
      if (error) throw error;
      trackEmailSignup(source);
      toast({ title: "You're on The Compass list.", description: "We'll send the next edition straight to your inbox." });
      onClose();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to The Compass"
    >
      <div className="relative bg-card rounded-2xl shadow-elevated max-w-md w-full p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4 mx-auto">
          <Compass className="h-6 w-6 text-secondary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
          Liked this? Get one trip ready to go, every two weeks.
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-5">
          The Compass picks a destination and packages the best time to go, a sample itinerary, safety notes, and live flight and hotel deals into a single short email.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={submitting}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 whitespace-nowrap"
          >
            {submitting ? "..." : "Subscribe"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Free. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default CompassToolModal;
