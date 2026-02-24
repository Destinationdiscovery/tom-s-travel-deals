import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rtg-email-popup-dismissed";
const DISMISS_DAYS = 7;

const EmailCapturePopup = () => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 86400000) return;
    }
    const timer = setTimeout(() => setVisible(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("subscribe", {
        body: { email: trimmed, source_slug: "popup" },
      });
      if (error) throw error;
      toast({ title: "You're in! 🎉", description: "Check your inbox for weekly deals." });
      dismiss();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative bg-card rounded-2xl shadow-elevated max-w-md w-full p-8">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4 mx-auto">
          <Mail className="h-6 w-6 text-secondary" />
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
          Get Weekly Exclusive Deals
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Join 5,000+ Canadian travelers getting the best deals, reviews, and tips delivered weekly.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email address"
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
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default EmailCapturePopup;
