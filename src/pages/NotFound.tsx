import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, MapPin, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const popularLinks = [
  { to: "/destinations", label: "Browse Destinations", icon: MapPin },
  { to: "/gear", label: "Trip Packing Toolkit", icon: Compass },
  { to: "/compass", label: "Read the Blog", icon: Compass },
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    navigate(`/destinations?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Search for destinations, gear, or browse our travel content."
        noindex
      />
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center pt-20 pb-16 px-4">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="font-display text-7xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-foreground font-semibold mb-2">Page not found</p>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved. Try searching or browse our popular sections below.
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-md mx-auto mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search a destination or resort..."
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button onClick={handleSearch} disabled={query.trim().length < 2} className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Search
            </Button>
          </div>

          {/* Popular links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            {popularLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="outline" className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
