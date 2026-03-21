import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, AlertTriangle, Newspaper, Globe, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTravelIntel, type IntelType } from "@/hooks/useTravelIntel";
import { IntelLoading, RequirementsResult, AdvisoriesResult, NewsResult } from "@/components/intel/IntelResults";
import heroBeach from "@/assets/hero-beach.jpg";
import aerialView from "@/assets/snowbird-caribbean-aerial.jpg";
import timesSquare from "@/assets/snowbird-times-square.jpg";

const intelCards = [
  {
    title: "Entry Requirements",
    description: "Visa policies, documents, and health requirements for your destination",
    icon: Shield,
    type: "requirements" as IntelType,
    image: heroBeach,
  },
  {
    title: "Safety Advisories",
    description: "Current travel advisories, health alerts, and safety tips",
    icon: AlertTriangle,
    type: "advisories" as IntelType,
    image: aerialView,
  },
  {
    title: "Travel News",
    description: "Latest travel news, policy changes, and trending destinations",
    icon: Newspaper,
    type: "news" as IntelType,
    image: timesSquare,
  },
];

const IntelPreviewSection = () => {
  const intel = useTravelIntel();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<IntelType>("requirements");

  const [reqCitizenship, setReqCitizenship] = useState("");
  const [reqDestination, setReqDestination] = useState("");
  const [advDestination, setAdvDestination] = useState("");
  const [newsDestination, setNewsDestination] = useState("");

  const handleSubmit = (type: IntelType) => {
    intel.clearAll();
    if (type === "requirements") intel.fetchIntel("requirements", reqDestination, reqCitizenship);
    else if (type === "advisories") intel.fetchIntel("advisories", advDestination);
    else intel.fetchIntel("news", newsDestination);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const handleCardClick = (card: typeof intelCards[0]) => {
    setActiveTab(card.type);
  };

  const hasResults = intel.requirementsData || intel.advisoriesData || intel.newsData;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Travel Advisories, Visa Requirements, and News
          </h2>
          <Link
            to="/travel-intel"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            Explore Intel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Tabbed Search */}
        <div className="max-w-2xl mb-8">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as IntelType)}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="requirements" className="gap-2"><FileText className="h-4 w-4 hidden sm:block" />Requirements</TabsTrigger>
              <TabsTrigger value="advisories" className="gap-2"><Shield className="h-4 w-4 hidden sm:block" />Advisories</TabsTrigger>
              <TabsTrigger value="news" className="gap-2"><Newspaper className="h-4 w-4 hidden sm:block" />News</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Your citizenship (e.g., Canada)" value={reqCitizenship} onChange={(e) => setReqCitizenship(e.target.value)} />
                <Input placeholder="Destination (e.g., Cuba)" value={reqDestination} onChange={(e) => setReqDestination(e.target.value)} />
                <Button onClick={() => handleSubmit("requirements")} disabled={intel.loading || reqCitizenship.trim().length < 2 || reqDestination.trim().length < 2} className="whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                  {intel.loading && activeTab === "requirements" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Check
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="advisories">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Destination (e.g., Cuba)" value={advDestination} onChange={(e) => setAdvDestination(e.target.value)} className="flex-1" />
                <Button onClick={() => handleSubmit("advisories")} disabled={intel.loading || advDestination.trim().length < 2} className="whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                  {intel.loading && activeTab === "advisories" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Check
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="news">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Destination (e.g., Cuba)" value={newsDestination} onChange={(e) => setNewsDestination(e.target.value)} className="flex-1" />
                <Button onClick={() => handleSubmit("news")} disabled={intel.loading || newsDestination.trim().length < 2} className="whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                  {intel.loading && activeTab === "news" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Get News
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Inline results */}
        <div ref={resultsRef}>
          {intel.loading && (
            <div className="mb-8 max-w-3xl">
              <IntelLoading type={activeTab} />
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
                  className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 p-6 text-left min-h-[200px] flex flex-col justify-end"
                >
                  <img src={card.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/15 backdrop-blur-sm">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-white group-hover:text-primary transition-colors mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-white/75">{card.description}</p>
                  </div>
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
