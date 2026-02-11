import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTravelIntel, type IntelType, type RequirementsData, type AdvisoriesData, type NewsData } from "@/hooks/useTravelIntel";
import { Shield, AlertTriangle, Newspaper, FileText, Loader2, ExternalLink, Check, Heart, Scale, Globe, Info } from "lucide-react";
import heroImg from "@/assets/snowbird-beach-sunset.jpg";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";

// Simple loading component
const IntelLoading = ({ type }: { type: IntelType }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + (90 - p) * 0.04));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const labels: Record<IntelType, string[]> = {
    requirements: ["Searching entry requirements...", "Checking visa policies..."],
    advisories: ["Scanning travel advisories...", "Checking safety alerts..."],
    news: ["Finding latest news...", "Gathering trending stories..."],
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="bg-card rounded-2xl p-8 shadow-soft">
        <Progress value={progress} className="h-2 mb-6" />
        {labels[type].map((label, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Advisory level badge
const AdvisoryBadge = ({ level }: { level: number }) => {
  const config: Record<number, { label: string; className: string }> = {
    1: { label: "Level 1 — Exercise Normal Precautions", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
    2: { label: "Level 2 — Exercise Increased Caution", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
    3: { label: "Level 3 — Reconsider Travel", className: "bg-orange-500/15 text-orange-700 border-orange-500/30" },
    4: { label: "Level 4 — Do Not Travel", className: "bg-red-500/15 text-red-700 border-red-500/30" },
  };
  const c = config[level] || config[1];
  return <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold border ${c.className}`}>{c.label}</span>;
};

// Citations
const Citations = ({ citations }: { citations?: string[] }) => {
  if (!citations?.length) return null;
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Sources</p>
      <div className="flex flex-wrap gap-2">
        {citations.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />
            {new URL(url).hostname.replace("www.", "")}
          </a>
        ))}
      </div>
    </div>
  );
};

// Requirements results
const RequirementsResult = ({ data }: { data: RequirementsData }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.visaRequired ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"}`}>
          {data.visaRequired ? <AlertTriangle className="h-5 w-5" /> : <Check className="h-5 w-5" />}
        </div>
        <h3 className="text-xl font-display font-bold">{data.visaRequired ? "Visa Required" : "No Visa Required"}</h3>
      </div>

      {data.visaTypes?.length > 0 && (
        <Section icon={FileText} title="Visa Types" items={data.visaTypes} />
      )}
      {data.documents?.length > 0 && (
        <Section icon={FileText} title="Required Documents" items={data.documents} />
      )}
      {data.healthRequirements?.length > 0 && (
        <Section icon={Heart} title="Health Requirements" items={data.healthRequirements} />
      )}
      {data.customsRules?.length > 0 && (
        <Section icon={Scale} title="Customs Rules" items={data.customsRules} />
      )}
      {data.localLaws?.length > 0 && (
        <Section icon={Shield} title="Local Laws" items={data.localLaws} />
      )}
      {data.importantNotes?.length > 0 && (
        <Section icon={Info} title="Important Notes" items={data.importantNotes} />
      )}
      <Citations citations={data.citations} />
    </div>
  </div>
);

// Linkify URLs in text
const LinkifiedText = ({ text }: { text: string }) => {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const parts = text.split(urlRegex);
  return (
    <span>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
            {new URL(part).hostname.replace("www.", "")}
            <ExternalLink className="h-3 w-3 inline" />
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const Section = ({ icon: Icon, title, items }: { icon: React.ElementType; title: string; items: string[] }) => (
  <div className="mt-5">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4 text-primary" />
      <h4 className="font-semibold text-sm">{title}</h4>
    </div>
    <ul className="space-y-1.5 pl-6">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-muted-foreground list-disc"><LinkifiedText text={item} /></li>
      ))}
    </ul>
  </div>
);

// Advisories results
const AdvisoriesResult = ({ data }: { data: AdvisoriesData }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <AdvisoryBadge level={data.advisoryLevel} />

      {data.advisories?.map((adv, i) => (
        <div key={i} className="mt-5 p-4 rounded-xl bg-muted/50">
          <p className="text-xs text-primary font-medium mb-1">{adv.source} — {adv.level}</p>
          <p className="font-semibold text-sm mb-1">{adv.summary}</p>
          <p className="text-sm text-muted-foreground">{adv.details}</p>
        </div>
      ))}

      {data.healthAlerts?.length > 0 && (
        <Section icon={Heart} title="Health Alerts" items={data.healthAlerts} />
      )}
      {data.safetyTips?.length > 0 && (
        <Section icon={Shield} title="Safety Tips" items={data.safetyTips} />
      )}
      <Citations citations={data.citations} />
    </div>
  </div>
);

// News results
const NewsResult = ({ data }: { data: NewsData }) => (
  <div className="space-y-4 animate-fade-in">
    {data.articles?.map((article, i) => (
      <div key={i} className="bg-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary mb-2">{article.category}</span>
            <h3 className="font-display font-bold text-lg leading-snug">{article.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{article.summary}</p>
            <p className="text-xs text-muted-foreground mt-3">{article.source} · {article.date}</p>
          </div>
        </div>
      </div>
    ))}
    <Citations citations={data.citations} />
  </div>
);

const TravelIntel = () => {
  const { loading, error, requirementsData, advisoriesData, newsData, fetchIntel } = useTravelIntel();
  const [activeTab, setActiveTab] = useState<IntelType>("requirements");

  useEffect(() => {
    document.title = "Know Before You Go - ReviewThenGo";
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
  }, []);
  // Form states
  const [reqCitizenship, setReqCitizenship] = useState("");
  const [reqDestination, setReqDestination] = useState("");
  const [advDestination, setAdvDestination] = useState("");
  const [newsDestination, setNewsDestination] = useState("");

  const handleSubmit = (type: IntelType) => {
    if (type === "requirements") fetchIntel("requirements", reqDestination, reqCitizenship);
    else if (type === "advisories") fetchIntel("advisories", advDestination);
    else fetchIntel("news", newsDestination);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center">
        <img src={heroImg} alt="Travel destination sunset" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-sky-300" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Know Before You Go</h1>
          <p className="text-white/80 text-lg max-w-lg mx-auto">Visa requirements, safety advisories, and destination news — powered by real-time data.</p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as IntelType)}>
          <TabsList className="w-full grid grid-cols-3 mb-8">
            <TabsTrigger value="requirements" className="gap-2"><FileText className="h-4 w-4 hidden sm:block" />Requirements</TabsTrigger>
            <TabsTrigger value="advisories" className="gap-2"><Shield className="h-4 w-4 hidden sm:block" />Advisories</TabsTrigger>
            <TabsTrigger value="news" className="gap-2"><Newspaper className="h-4 w-4 hidden sm:block" />News</TabsTrigger>
          </TabsList>

          {/* Requirements Tab */}
          <TabsContent value="requirements">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Your citizenship (e.g., Canada)" value={reqCitizenship} onChange={(e) => setReqCitizenship(e.target.value)} />
              <Input placeholder="Destination (e.g., Cuba)" value={reqDestination} onChange={(e) => setReqDestination(e.target.value)} />
              <Button onClick={() => handleSubmit("requirements")} disabled={loading || reqCitizenship.trim().length < 2 || reqDestination.trim().length < 2} className="whitespace-nowrap">
                {loading && activeTab === "requirements" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Check
              </Button>
            </div>
            {loading && activeTab === "requirements" && <IntelLoading type="requirements" />}
            {!loading && requirementsData && <div className="mt-6"><RequirementsResult data={requirementsData} /></div>}
          </TabsContent>

          {/* Advisories Tab */}
          <TabsContent value="advisories">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Destination (e.g., Cuba)" value={advDestination} onChange={(e) => setAdvDestination(e.target.value)} className="flex-1" />
              <Button onClick={() => handleSubmit("advisories")} disabled={loading || advDestination.trim().length < 2} className="whitespace-nowrap">
                {loading && activeTab === "advisories" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Check
              </Button>
            </div>
            {loading && activeTab === "advisories" && <IntelLoading type="advisories" />}
            {!loading && advisoriesData && <div className="mt-6"><AdvisoriesResult data={advisoriesData} /></div>}
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Destination (e.g., Cuba)" value={newsDestination} onChange={(e) => setNewsDestination(e.target.value)} className="flex-1" />
              <Button onClick={() => handleSubmit("news")} disabled={loading || newsDestination.trim().length < 2} className="whitespace-nowrap">
                {loading && activeTab === "news" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Get News
              </Button>
            </div>
            {loading && activeTab === "news" && <IntelLoading type="news" />}
            {!loading && newsData && <div className="mt-6"><NewsResult data={newsData} /></div>}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TravelIntel;
