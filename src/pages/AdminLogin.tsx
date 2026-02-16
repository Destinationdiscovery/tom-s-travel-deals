import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogOut, Mail, Loader2, Shield } from "lucide-react";

const AdminLogin = () => {
  const { user, isAdmin, sendMagicLink, signOut, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      await sendMagicLink(email.trim());
      setSent(true);
      toast({ title: "Magic link sent!", description: "Check your email and click the link to sign in." });
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to send link", variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 justify-center">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">Admin Access</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : user ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
              {isAdmin ? (
                <p className="text-sm text-emerald-600 font-medium">✓ Admin access granted</p>
              ) : (
                <p className="text-sm text-amber-600">Not an admin account</p>
              )}
              <Button variant="outline" onClick={signOut} className="gap-2 w-full">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          ) : sent ? (
            <div className="text-center space-y-2">
              <Mail className="h-8 w-8 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Check your email for the magic link.</p>
              <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
                Try again
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend} disabled={sending || !email.trim()} className="w-full gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send Magic Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
