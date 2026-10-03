import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ADMIN_DEVICE_KEY = "rtg-admin-device";

async function checkAdmin(uid: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", uid)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

/** Logo: single click goes home, double-click or long press opens admin login. */
export default function AdminLogoTrigger() {
  const [open, setOpen] = useState(false);
  const clickTimer = useRef<number | null>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      setOpen(true);
      return;
    }
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      window.location.href = "/";
    }, 280);
  };

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setOpen(true);
    }, 900);
  };
  const endPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
  };

  return (
    <>
      <a
        className="mark"
        href="/"
        onClick={onClick}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onTouchMove={endPress}
        onContextMenu={(e) => e.preventDefault()}
      >
        review<span>then</span>go
      </a>
      {open && <AdminLoginModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState<{ email: string; admin: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (u) setSignedIn({ email: u.email ?? "", admin: await checkAdmin(u.id) });
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err || !data.user) {
      setError(err?.message ?? "Sign in failed");
      setBusy(false);
      return;
    }
    const admin = await checkAdmin(data.user.id);
    if (!admin) {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setBusy(false);
      return;
    }
    localStorage.setItem(ADMIN_DEVICE_KEY, "1");
    window.location.href = "/admin";
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSignedIn(null);
  };

  return (
    <div className="adm-overlay" role="dialog" aria-modal="true" aria-label="Admin sign in" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow">Admin</p>
        {signedIn ? (
          <>
            <p className="adm-small">Signed in as {signedIn.email}</p>
            <div className="adm-actions">
              {signedIn.admin && (
                <a className="btn solid" href="/admin">
                  Open dashboard
                </a>
              )}
              <button className="btn" type="button" onClick={signOut}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="adm-form">
            <label>
              Email
              <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="adm-error">{error}</p>}
            <div className="adm-actions">
              <button className="btn solid" type="submit" disabled={busy}>
                {busy ? "Signing in" : "Sign in"}
              </button>
              <button className="btn" type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
