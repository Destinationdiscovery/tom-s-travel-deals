import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTravelIntel, type IntelType } from "@/hooks/useTravelIntel";
import { Shield, FileText, Newspaper, Loader2, Globe } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/snowbird-beach-sunset.jpg";
import { IntelLoading, RequirementsResult, AdvisoriesResult, NewsResult } from "@/components/intel/IntelResults";

const TravelIntel = () => {
  const { loading, error, requirementsData, advisoriesData, newsData, fetchIntel } = useTravelIntel();
  const [activeTab, setActiveTab] = useState<IntelType>("requirements");

  const [reqCitizenship, setReqCitizenship] = useState("");
  const [reqDestination, setReqDestination] = useState("");
  const [advDestination, setAdvDestination] = useState("");
  const [newsDestination, setNewsDestination] = useState("");

  useEffect(() => {
    supabase.functions.invoke("track-review-view", { body: { slug: "travel-intel" } }).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const type = params.get("type") as IntelType | null;
    if (q && q.trim().length >= 2 && type) {
      if (type === "advisories") {
        setActiveTab("advisories");
        setAdvDestination(q);
        fetchIntel("advisories", q.trim());
      } else if (type === "news") {
        setActiveTab("news");
        setNewsDestination(q);
        fetchIntel("news", q.trim());
      } else if (type === "requirements") {
        setActiveTab("requirements");
        setReqDestination(q);
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (type: IntelType) => {
    if (type === "requirements") fetchIntel("requirements", reqDestination, reqCitizenship);
    else if (type === "advisories") fetchIntel("advisories", advDestination);
    else fetchIntel("news", newsDestination);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Visa Requirements, Travel Advisories & Destination News | Know Before You Go"
        description="Free travel intelligence tool: check visa and entry requirements, government safety advisories, and destination news for any country before your trip."
        url="/travel-intel"
        keywords={["visa requirements", "entry requirements", "travel advisory", "destination news", "know before you go"]}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center">
        <img src={heroImg} alt="Travel destination sunset" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Know Before You Go</h1>
          <p className="text-white/80 text-lg max-w-lg mx-auto">Visa requirements, safety advisories, and destination news, powered by real-time data.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as IntelType)}>
          <TabsList className="w-full grid grid-cols-3 mb-8">
            <TabsTrigger value="requirements" className="gap-2"><FileText className="h-4 w-4 hidden sm:block" />Requirements</TabsTrigger>
            <TabsTrigger value="advisories" className="gap-2"><Shield className="h-4 w-4 hidden sm:block" />Advisories</TabsTrigger>
            <TabsTrigger value="news" className="gap-2"><Newspaper className="h-4 w-4 hidden sm:block" />News</TabsTrigger>
          </TabsList>

          <TabsContent value="requirements">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Your citizenship (e.g., Canada)" value={reqCitizenship} onChange={(e) => setReqCitizenship(e.target.value)} />
              <Input placeholder="Destination (e.g., Cuba)" value={reqDestination} onChange={(e) => setReqDestination(e.target.value)} />
              <Button onClick={() => handleSubmit("requirements")} disabled={loading || reqCitizenship.trim().length < 2 || reqDestination.trim().length < 2} className="whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {loading && activeTab === "requirements" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Check
              </Button>
            </div>
            {loading && activeTab === "requirements" && <IntelLoading type="requirements" />}
            {!loading && requirementsData && <div className="mt-6"><RequirementsResult data={requirementsData} /></div>}
          </TabsContent>

          <TabsContent value="advisories">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Destination (e.g., Cuba)" value={advDestination} onChange={(e) => setAdvDestination(e.target.value)} className="flex-1" />
              <Button onClick={() => handleSubmit("advisories")} disabled={loading || advDestination.trim().length < 2} className="whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {loading && activeTab === "advisories" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Check
              </Button>
            </div>
            {loading && activeTab === "advisories" && <IntelLoading type="advisories" />}
            {!loading && advisoriesData && <div className="mt-6"><AdvisoriesResult data={advisoriesData} /></div>}
          </TabsContent>

          <TabsContent value="news">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Destination (e.g., Cuba)" value={newsDestination} onChange={(e) => setNewsDestination(e.target.value)} className="flex-1" />
              <Button onClick={() => handleSubmit("news")} disabled={loading || newsDestination.trim().length < 2} className="whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {loading && activeTab === "news" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Get News
              </Button>
            </div>
            {loading && activeTab === "news" && <IntelLoading type="news" />}
            {!loading && newsData && <div className="mt-6"><NewsResult data={newsData} /></div>}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TravelIntel;
