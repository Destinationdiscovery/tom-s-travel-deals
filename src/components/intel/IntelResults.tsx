import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Newspaper, FileText, Loader2, ExternalLink, Check, Heart, Scale, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { IntelType, RequirementsData, AdvisoriesData, NewsData } from "@/hooks/useTravelIntel";

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

export const Citations = ({ citations }: { citations?: string[] }) => {
  if (!citations?.length) return null;
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground mb-2 font-medium">Sources</p>
      <div className="flex flex-wrap gap-2">
        {citations.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ExternalLink className="h-3.5 w-3.5" />
            {new URL(url).hostname.replace("www.", "")}
          </a>
        ))}
      </div>
    </div>
  );
};

export const IntelLoading = ({ type }: { type: IntelType }) => {
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

const AdvisoryBadge = ({ level }: { level: number }) => {
  const config: Record<number, { label: string; className: string }> = {
    1: { label: "Level 1. Exercise Normal Precautions", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
    2: { label: "Level 2. Exercise Increased Caution", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
    3: { label: "Level 3. Reconsider Travel", className: "bg-orange-500/15 text-orange-700 border-orange-500/30" },
    4: { label: "Level 4. Do Not Travel", className: "bg-red-500/15 text-red-700 border-red-500/30" },
  };
  const c = config[level] || config[1];
  return <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold border ${c.className}`}>{c.label}</span>;
};

export const RequirementsResult = ({ data }: { data: RequirementsData }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.visaRequired ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"}`}>
          {data.visaRequired ? <AlertTriangle className="h-5 w-5" /> : <Check className="h-5 w-5" />}
        </div>
        <h3 className="text-xl font-display font-bold">{data.visaRequired ? "Visa Required" : "No Visa Required"}</h3>
      </div>
      {data.visaTypes?.length > 0 && <Section icon={FileText} title="Visa Types" items={data.visaTypes} />}
      {data.documents?.length > 0 && <Section icon={FileText} title="Required Documents" items={data.documents} />}
      {data.healthRequirements?.length > 0 && <Section icon={Heart} title="Health Requirements" items={data.healthRequirements} />}
      {data.customsRules?.length > 0 && <Section icon={Scale} title="Customs Rules" items={data.customsRules} />}
      {data.localLaws?.length > 0 && <Section icon={Shield} title="Local Laws" items={data.localLaws} />}
      {data.importantNotes?.length > 0 && <Section icon={Info} title="Important Notes" items={data.importantNotes} />}
      <Citations citations={data.citations} />
    </div>
  </div>
);

export const AdvisoriesResult = ({ data }: { data: AdvisoriesData }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <AdvisoryBadge level={data.advisoryLevel} />
      {data.advisories?.map((adv, i) => (
        <div key={i} className="mt-5 p-4 rounded-xl bg-muted/50">
          <p className="text-xs text-primary font-medium mb-1">{adv.source}, {adv.level}</p>
          {adv.url ? (
            <a href={adv.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm mb-1 text-primary hover:underline inline-flex items-center gap-1">
              {adv.summary} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <p className="font-semibold text-sm mb-1">{adv.summary}</p>
          )}
          <p className="text-sm text-muted-foreground">{adv.details}</p>
        </div>
      ))}
      {data.healthAlerts?.length > 0 && <Section icon={Heart} title="Health Alerts" items={data.healthAlerts} />}
      {data.safetyTips?.length > 0 && <Section icon={Shield} title="Safety Tips" items={data.safetyTips} />}
      <Citations citations={data.citations} />
    </div>
  </div>
);

export const NewsResult = ({ data }: { data: NewsData }) => (
  <div className="space-y-4 animate-fade-in">
    {data.articles?.map((article, i) => (
      <div key={i} className="bg-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary mb-2">{article.category}</span>
            {article.url ? (
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-display font-bold text-lg leading-snug text-primary hover:underline inline-flex items-center gap-1.5">
                {article.title} <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            ) : (
              <h3 className="font-display font-bold text-lg leading-snug">{article.title}</h3>
            )}
            <p className="text-sm text-muted-foreground mt-2">{article.summary}</p>
            <p className="text-xs text-muted-foreground mt-3">{article.source} · {article.date}</p>
          </div>
        </div>
      </div>
    ))}
    <Citations citations={data.citations} />
  </div>
);
