import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface EmailCaptureProps {
  sourceSlug?: string;
}

const EmailCapture = ({ sourceSlug }: EmailCaptureProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const { error } = await supabase.functions.invoke("subscribe", {
        body: { email: trimmed, source_slug: sourceSlug },
      });
      if (error) throw error;
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="font-display font-bold text-foreground">You're in!</p>
        <p className="text-sm text-muted-foreground mt-1">
          We'll send you exclusive deals and travel tips.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">
          Get Exclusive Travel Deals
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Join our list for insider rates and destination tips — no spam, ever.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          className="flex-1"
          maxLength={255}
        />
        <Button type="submit" disabled={status === "loading"} size="sm">
          {status === "loading" ? "..." : "Subscribe"}
        </Button>
      </form>
      {status === "error" && (
        <p className="text-xs text-destructive mt-2">{errorMsg}</p>
      )}
    </div>
  );
};

export default EmailCapture;
