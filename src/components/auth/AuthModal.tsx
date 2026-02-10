import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptMessage?: string;
}

const AuthModal = ({ open, onOpenChange, promptMessage }: AuthModalProps) => {
  const { sendMagicLink } = useAuth();
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
      await sendMagicLink(trimmed);
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail("");
      setStatus("idle");
      setErrorMsg("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {status === "success" ? "Check your email!" : "Sign in to ReviewThenGo"}
          </DialogTitle>
          <DialogDescription>
            {status === "success"
              ? "We sent you a magic link. Click it to sign in — no password needed."
              : promptMessage || "Sign in to save unlimited reviews, track your history, and organize trip lists."}
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="h-12 w-12 text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Didn't get it? Check your spam folder or try again.
            </p>
            <Button variant="outline" onClick={() => { setStatus("idle"); setEmail(""); }}>
              Try another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                maxLength={255}
                autoFocus
              />
            </div>
            {status === "error" && (
              <p className="text-xs text-destructive">{errorMsg}</p>
            )}
            <Button type="submit" disabled={status === "loading"} className="w-full">
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Magic Link"
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              No password needed — we'll email you a sign-in link.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
