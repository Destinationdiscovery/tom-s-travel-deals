import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Shield, AlertTriangle, Newspaper, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTravelIntel, type IntelType } from "@/hooks/useTravelIntel";
import { IntelLoading, RequirementsResult, AdvisoriesResult, NewsResult } from "@/components/intel/IntelResults";

const intelCards = [
  {
    title: "Entry Requirements",
    description: "Visa policies, documents, and health requirements for your destination",
    icon: Shield,
    type: "requirements" as IntelType,
    query: "Canada to Mexico",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Safety Advisories",
    description: "Current travel advisories, health alerts, and safety tips",
    icon: AlertTriangle,
    type: "advisories" as IntelType,
    query: "Thailand",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Travel News",
    description: "Latest travel news, policy changes, and trending destinations",
    icon: Newspaper,
    type: "news" as IntelType,
    query: "Caribbean",
    color: "bg-sky-500/10 text-sky-600",
  },
];

const IntelPreviewSection = () => {
  const [query, setQuery] = useState("");
  const intel = useTravelIntel();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [citizenshipPrompt, setCitizenshipPrompt] = useState(false);
  const [citizenship, setCitizenship] = useState("");
  const [pendingDest, setPendingDest] = useState("");

  const doSearch = (type: IntelType, dest: string, cit?: string) => {
    intel.clearAll();
    intel.fetchIntel(type, dest, cit);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setCitizenshipPrompt(false);
    // Auto-detect: "X to Y" = requirements, else advisories
    const match = trimmed.match(/^(.+?)\s+to\s+(.+)$/i);
    if (match) {
      doSearch("requirements", match[2].trim(), match[1].trim());
    } else {
      doSearch("advisories", trimmed);
    }
  };

  const handleCardClick = (card: typeof intelCards[0]) => {
    if (card.type === "requirements") {
      setQuery(card.query);
      const match = card.query.match(/^(.+?)\s+to\s+(.+)$/i);
      if (match) {
        doSearch("requirements", match[2].trim(), match[1].trim());
      } else {
        setPendingDest(card.query);
        setCitizenshipPrompt(true);
      }
    } else {
      setQuery(card.query);
      doSearch(card.type, card.query);
    }
  };

  const handleCitizenshipSubmit = () => {
    if (citizenship.trim().length >= 2) {
      setCitizenshipPrompt(false);
      doSearch("requirements", pendingDest, citizenship.trim());
    }
  };

  const hasResults = intel.requirementsData || intel.advisoriesData || intel.newsData;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Travel Intel
          </h2>
          <Link
            to="/travel-intel"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            Explore Intel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Inline Search */}
        <div className="max-w-2xl mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder='e.g. "Canada to Mexico" or "Thailand advisories"'
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button onClick={handleSearch} disabled={intel.loading || query.trim().length < 2} className="h-11 px-6">
              {intel.loading ? "Searching..." : "Get Intel"}
            </Button>
          </div>
        </div>

        {/* Citizenship prompt */}
        {citizenshipPrompt && (
          <div className="max-w-xl mb-8 bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="font-display text-lg font-bold mb-3">What's your citizenship?</h3>
            <p className="text-sm text-muted-foreground mb-4">We need your citizenship to check entry requirements for {pendingDest}.</p>
            <div className="flex gap-3">
              <Input
                placeholder="e.g. Canada, USA, UK..."
                value={citizenship}
                onChange={(e) => setCitizenship(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCitizenshipSubmit()}
                className="flex-1"
              />
              <Button onClick={handleCitizenshipSubmit} disabled={citizenship.trim().length < 2}>
                Check
              </Button>
            </div>
          </div>
        )}

        {/* Inline results */}
        <div ref={resultsRef}>
          {intel.loading && (
            <div className="mb-8 max-w-3xl">
              <IntelLoading type="advisories" />
            </div>
          )}
          {!intel.loading && intel.requirementsData && (
            <div className="mb-8 max-w-3xl">
              <RequirementsResult data={intel.requirementsData} />
            </div>
          )}
          {!intel.loading && intel.advisoriesData && (
            <div className="mb-8 max-w-3xl">
              <AdvisoriesResult data={intel.advisoriesData} />
            </div>
          )}
          {!intel.loading && intel.newsData && (
            <div className="mb-8 max-w-3xl">
              <NewsResult data={intel.newsData} />
            </div>
          )}
          {intel.error && (
            <div className="mb-8 p-4 rounded-xl bg-destructive/10 text-destructive text-sm max-w-2xl">
              {intel.error}
            </div>
          )}
        </div>

        {/* Category cards */}
        {!hasResults && !intel.loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {intelCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={() => handleCardClick(card)}
                  className="group rounded-2xl bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 p-6 text-left"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default IntelPreviewSection;
