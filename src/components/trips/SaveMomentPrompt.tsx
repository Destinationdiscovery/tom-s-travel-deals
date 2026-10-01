import { useState } from "react";
import { Bookmark, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  markPromptCompleted,
  setEmail as persistEmail,
  setTripName as persistTripName,
  getSession,
} from "@/lib/tripSession";

type Props = {
  hotelName: string;
  destination?: string;
  onDismiss: () => void;
};

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.07-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"/>
    <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.3 7.4 24 12 24z"/>
    <path fill="#FBBC05" d="M5.4 14.3c-.2-.7-.3-1.5-.3-2.3s.1-1.6.3-2.3V6.6H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l4-3.1z"/>
    <path fill="#EA4335" d="M12 4.7c1.7 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l4 3.1C6.3 6.8 8.9 4.7 12 4.7z"/>
  </svg>
);

const SaveMomentPrompt = ({ hotelName, destination, onDismiss }: Props) => {
  const { toast } = useToast();
  const initial = getSession();
  const [tripName, setTripName] = useState(initial.trip_name ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = tripName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      toast({ title: "Add a trip name", description: "Give this plan a quick name to keep going.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: "Check your email", description: "That email looks off. Please double-check.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    persistTripName(trimmedName);
    persistEmail(trimmedEmail);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/my-trips`,
        shouldCreateUser: true,
        data: { display_name: trimmedName, pending_trip_name: trimmedName },
      },
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Could not send the link", description: error.message, variant: "destructive" });
      return;
    }
    markPromptCompleted();
    setSubmitted(true);
  };

  const handleGoogle = async () => {
    if (tripName.trim()) persistTripName(tripName.trim());
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/my-trips` },
    });
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
    }
  };

  const dest = destination ? `?destination=${encodeURIComponent(destination)}` : "";

  if (submitted) {
    return (
      <div className="mt-4 rounded-2xl border-2 border-green-500/40 bg-green-500/5 p-5 sm:p-6 animate-fade-in">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground">
              {tripName.trim()} is saved
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check your email, we have sent you a link to access your plan from any device. Keep planning and everything adds to this trip automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { to: `/destinations${dest}`, label: "Review more hotels" },
            { to: `/itinerary${dest}`, label: "Build your itinerary" },
            { to: `/travel-intel${dest}`, label: "Check visa requirements" },
            { to: `/gear${dest}`, label: "Start packing list" },
          ].map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {card.label}
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          ))}
        </div>

        <button
          onClick={onDismiss}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-green-500/40 bg-green-500/5 p-5 sm:p-6 animate-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <Bookmark className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-bold text-foreground">{hotelName} saved</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Want to keep this with everything else for your trip? Name your trip and save it all in one place, free.
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        className="w-full mb-3 h-11 gap-2"
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder={`Name this trip, e.g. "${destination ?? "Mexico"} 2027" or "Italy Summer"`}
          className="h-11"
          required
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="h-11"
          required
        />
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save my trip plan free"}
        </Button>
      </form>

      <button
        onClick={onDismiss}
        className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
      >
        Keep browsing, I'll save later
      </button>

      <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
        No password needed. We'll send you a link to access your plan from any device. No spam.
      </p>
    </div>
  );
};

export default SaveMomentPrompt;
