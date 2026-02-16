import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptMessage?: string;
}

const AuthModal = ({ open, onOpenChange, promptMessage }: AuthModalProps) => {
  const { signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("loading");
    try {
      await signInWithPassword(email.trim(), password);
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Invalid credentials");
      setStatus("error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await signUp(email.trim(), password);
      toast({
        title: "Registration successful",
        description: "Check your email to confirm your account before signing in.",
      });
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
      setStatus("idle");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setStatus("idle");
      setErrorMsg("");
      setMode("signin");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "signin" ? "Sign In" : "Register"}
          </DialogTitle>
          <DialogDescription>
            {promptMessage || "Sign in to save reviews, track history, and organize trips."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={mode === "signin" ? handleSignIn : handleRegister} className="flex flex-col gap-4 pt-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
            maxLength={255}
            autoFocus
          />
          <Input
            type="password"
            placeholder={mode === "register" ? "Password (min 6 chars)" : "Password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (status === "error") setStatus("idle"); }}
          />
          {mode === "register" && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (status === "error") setStatus("idle"); }}
            />
          )}
          {status === "error" && (
            <p className="text-xs text-destructive">{errorMsg}</p>
          )}
          <Button type="submit" disabled={status === "loading"} className="w-full">
            {status === "loading" ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {mode === "signin" ? "Signing in..." : "Registering..."}</>
            ) : (
              <><LogIn className="h-4 w-4 mr-2" /> {mode === "signin" ? "Sign In" : "Register"}</>
            )}
          </Button>
          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "register" : "signin"); setPassword(""); setConfirmPassword(""); setStatus("idle"); }}
            className="text-xs text-muted-foreground hover:text-foreground text-center"
          >
            {mode === "signin" ? "No account? Register" : "Already have an account? Sign In"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
