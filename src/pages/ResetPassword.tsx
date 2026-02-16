import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Supabase handles the recovery token from the URL hash automatically
    // via onAuthStateChange — no manual extraction needed
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match");
      setStatus("error");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Lock className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Set Your Password</h1>
          <p className="text-sm text-muted-foreground">Enter a new password for your account</p>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="h-12 w-12 text-emerald-500" />
            <p className="text-foreground font-medium">Password set successfully!</p>
            <p className="text-sm text-muted-foreground">You can now sign in with your email and password.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setStatus("idle"); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setStatus("idle"); }}
              />
            </div>
            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              Set Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
