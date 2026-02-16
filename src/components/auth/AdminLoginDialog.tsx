import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Compass, LogOut, Loader2, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminLoginDialog = () => {
  const { user, isAdmin, signInWithPassword, signUp, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleRegister = async () => {
    if (!email.trim() || !password || password.length < 6) return;
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password);
      toast({
        title: "Registration successful",
        description: "Check your email to confirm your account before signing in.",
      });
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      toast({
        title: "Registration failed",
        description: e instanceof Error ? e.message : "Something went wrong",
        variant: "destructive",
      });
    }
    setSubmitting(false);
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
        ) : mode === "signin" ? (
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
            <button
              type="button"
              onClick={() => { setMode("register"); setPassword(""); }}
              className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
            >
              No account? Register
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Admin Register</span>
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
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 text-sm"
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              className="h-9 text-sm"
            />
            <Button
              onClick={handleRegister}
              disabled={submitting || !email.trim() || password.length < 6 || password !== confirmPassword}
              size="sm"
              className="w-full"
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Register
            </Button>
            <button
              type="button"
              onClick={() => { setMode("signin"); setPassword(""); setConfirmPassword(""); }}
              className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
            >
              Already have an account? Sign In
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default AdminLoginDialog;
