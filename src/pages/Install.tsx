import { useState, useEffect } from "react";
import { Download, Share, MoreVertical, CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setIsInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <>
      <SEOHead
        title="Install ReviewThenGo App"
        description="Install ReviewThenGo on your device for fast access to travel reviews, gear guides, and expert insights — even offline."
      />
      <Header />
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="space-y-3">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
              <Smartphone className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Install ReviewThenGo
            </h1>
            <p className="text-muted-foreground text-base">
              Get instant access from your home screen — loads fast, works offline.
            </p>
          </div>

          {isInstalled ? (
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-6 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Already Installed!
              </h2>
              <p className="text-muted-foreground text-sm">
                ReviewThenGo is on your home screen. Open it anytime for fast travel insights.
              </p>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstall} variant="hero" size="xl" className="w-full">
              <Download className="h-5 w-5 mr-2" />
              Install App
            </Button>
          ) : isIOS ? (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5 text-left">
              <h2 className="font-display text-lg font-semibold text-foreground text-center">
                Add to Home Screen on iPhone
              </h2>
              <ol className="space-y-4 text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap the <Share className="inline h-4 w-4 text-primary -mt-0.5" /> <strong>Share</strong> button in Safari's toolbar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  <span>Tap <strong>"Add"</strong> — that's it!</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5 text-left">
              <h2 className="font-display text-lg font-semibold text-foreground text-center">
                Install on Android
              </h2>
              <ol className="space-y-4 text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap the <MoreVertical className="inline h-4 w-4 text-primary -mt-0.5" /> <strong>menu</strong> button in Chrome</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  <span>Confirm by tapping <strong>"Install"</strong></span>
                </li>
              </ol>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Offline Ready", icon: "📶" },
              { label: "Fast Launch", icon: "⚡" },
              { label: "No App Store", icon: "🚀" },
            ].map((f) => (
              <div key={f.label} className="rounded-lg bg-muted/50 p-3 text-center">
                <span className="text-2xl">{f.icon}</span>
                <p className="text-xs font-medium text-muted-foreground mt-1">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Install;
