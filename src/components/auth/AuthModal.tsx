import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
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
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail("");
      setPassword("");
      setStatus("idle");
      setErrorMsg("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Sign In</DialogTitle>
          <DialogDescription>
            {promptMessage || "Sign in to access your account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSignIn} className="flex flex-col gap-4 pt-2">
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
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (status === "error") setStatus("idle"); }}
          />
          {status === "error" && (
            <p className="text-xs text-destructive">{errorMsg}</p>
          )}
          <Button type="submit" disabled={status === "loading"} className="w-full">
            {status === "loading" ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</>
            ) : (
              <><LogIn className="h-4 w-4 mr-2" /> Sign In</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
