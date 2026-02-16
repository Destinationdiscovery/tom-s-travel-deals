import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Compass, LogOut, Loader2, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminLoginDialog = () => {
  const { user, isAdmin, signInWithPassword, signOut, sendMagicLink, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    try {
      await signInWithPassword(email.trim(), password);
      toast({ title: "Signed in successfully" });
    } catch (e: unknown) {
      toast({
        title: "Sign in failed",
        description: e instanceof Error ? e.message : "Invalid credentials",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setSendingLink(true);
    try {
      await sendMagicLink(email.trim());
      setMagicLinkSent(true);
      toast({ title: "Check your email for a login link" });
    } catch (e: unknown) {
      toast({
        title: "Failed to send magic link",
        description: e instanceof Error ? e.message : "Something went wrong",
        variant: "destructive",
      });
    }
    setSendingLink(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center focus:outline-none"
          aria-label="Admin access"
        >
          <Compass className="h-8 w-8 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start" sideOffset={8}>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="space-y-3 text-center">
            <div className="flex items-center gap-2 justify-center">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Admin Access</span>
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {isAdmin ? (
              <p className="text-xs text-emerald-600 font-medium">✓ Admin access granted</p>
            ) : (
              <p className="text-xs text-amber-600">Not an admin account</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                setOpen(false);
              }}
              className="gap-2 w-full"
            >
              <LogOut className="h-3 w-3" /> Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Admin Sign In</span>
            </div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 text-sm"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              className="h-9 text-sm"
            />
            <Button
              onClick={handleSignIn}
              disabled={submitting || !email.trim() || !password}
              size="sm"
              className="w-full"
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Sign In
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {magicLinkSent ? (
              <p className="text-xs text-center text-muted-foreground">
                ✓ Check your email for a login link
              </p>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMagicLink}
                disabled={sendingLink || !email.trim()}
                className="w-full"
              >
                {sendingLink && <Loader2 className="h-3 w-3 animate-spin" />}
                Send Magic Link
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default AdminLoginDialog;
