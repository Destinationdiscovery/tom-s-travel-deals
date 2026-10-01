import { useState, useEffect, useRef } from "react";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEmailSignup } from "@/lib/analytics";

const STORAGE_KEY = "rtg-email-popup-dismissed";
const SUBSCRIBED_KEY = "rtg-email-popup-subscribed";
const DISMISS_DAYS = 3;

const INTEREST_OPTIONS = [
  { id: "destinations", label: "Destinations" },
  { id: "deals", label: "Deals" },
  { id: "gear", label: "Gear" },
  { id: "blog", label: "Blog" },
];

const EmailCapturePopup = () => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;
    // Don't show inside the admin portal
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/gear-admin")) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 86400000) return;
    }

    const show = () => setVisible(true);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    const timer = setTimeout(show, 60000);

    return () => {
      clearTimeout(timer);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("subscribe", {
        body: { email: trimmed, source_slug: "compass-exit-popup", interests },
      });
      if (error) throw error;
      trackEmailSignup("compass-exit-popup");
      toast({ title: "You're on The Compass list.", description: "Look for the next edition in your inbox." });
      localStorage.setItem(SUBSCRIBED_KEY, String(Date.now()));
      setVisible(false);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const popupRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!visible) return;
    setTimeout(() => emailInputRef.current?.focus(), 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { dismiss(); return; }
      if (e.key !== "Tab" || !popupRef.current) return;
      const focusable = popupRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter signup"
    >
      <div ref={popupRef} className="relative bg-card rounded-2xl shadow-elevated max-w-md w-full p-8">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Close newsletter popup"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4 mx-auto">
          <Mail className="h-6 w-6 text-secondary" />
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
          The Compass. Travel intel, every two weeks.
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          One short email with a featured destination, best time to go, a sample itinerary, safety read, and live flight and hotel deals. No spam, just signal.
        </p>

        {/* Interest checkboxes */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleInterest(opt.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                interests.includes(opt.id)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={emailInputRef}
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
