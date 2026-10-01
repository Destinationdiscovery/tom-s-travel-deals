import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Mark } from "./Mark";

const services = [
  { to: "/reels", hash: undefined, label: "Highlight reels", desc: "Recruiting videos built from your game film" },
  { to: "/promo-cards", hash: undefined, label: "Promo cards", desc: "Player and team accolades, designed" },
  { to: "/photography", hash: undefined, label: "Photography services", desc: "Gameday, portraits, media day and team" },
  { to: "/gallery", hash: undefined, label: "Gallery", desc: "Game photos, clips and player cards we have made" },
  { to: "/clubs", hash: undefined, label: "For clubs and teams", desc: "Content, photography and video for organizations" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const dd = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  useEffect(() => {
    setLight(document.documentElement.getAttribute("data-theme") === "light");
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("aventura-theme", next);
    } catch {
      /* storage unavailable */
    }
    setLight(next === "light");
  }

  return (
    <header>
      <div className="wrap nav">
        <Link className="brand" to="/">
          <Mark />
          <div>
            <b>Aventura</b>
            <span>Sports Media</span>
          </div>
        </Link>
        <nav>
          <div
            className={open ? "dd open" : "dd"}
            ref={dd}
            onMouseEnter={() => {
              if (window.innerWidth > 900) setOpen(true);
            }}
            onMouseLeave={() => {
              if (window.innerWidth > 900) setOpen(false);
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
            >
              Services <span className="car">&#9660;</span>
            </button>
            <div className="dd-menu">
              {services.map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  {...(s.hash ? { hash: s.hash } : {})}
                  className={pathname === s.to && !s.hash ? "on" : undefined}
                >
                  {s.label}
                  <span>{s.desc}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link to="/" hash="about">
            About
          </Link>
          <Link to="/quote">Request a quote</Link>
          <Link to="/book">Book a call</Link>
          <Link to="/" hash="resources">
            Resources
          </Link>
        </nav>
        <div className="right">
          {user ? (
            <>
              {isAdmin && (
                <Link className="btn btn-ghost dashboard-link" to="/admin">
                  Dashboard
                </Link>
              )}
              <details className="account-menu">
                <summary><span className="account-label">Account</span><span className="menu-label">Menu</span></summary>
                <div className="account-menu-panel">
                  {isAdmin && <Link className="mobile-dashboard-link" to="/admin">Dashboard</Link>}
                  <Link to="/account">My account</Link>
                  <button type="button" onClick={signOut}>Sign out</button>
                </div>
              </details>
            </>
          ) : (
            <Link className="btn btn-ghost" to="/auth">
              Sign in
            </Link>
          )}
          <Link className="btn btn-rec" to="/order">
            <span className="dot" /> <span className="order-full">Start an order</span><span className="order-short">Order</span>
          </Link>
          <button
            className="tt"
            type="button"
            onClick={toggleTheme}
            aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
            title={light ? "Dark mode" : "Light mode"}
          >
            {light ? "\u2600" : "\u263D"}
          </button>
        </div>
      </div>
    </header>
  );
}
