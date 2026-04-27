import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface ToolExample {
  question: string;
  answer: string;
  ctaQuery: string;
  ctaLabel?: string;
}

export interface ToolFAQ {
  q: string;
  a: string;
}

interface ToolAEOContentProps {
  hookQuestion: string;
  intro: string;
  examples: ToolExample[];
  faqs: ToolFAQ[];
  toolPath: string;
  /** Query param name for prefill. Defaults to "q". */
  queryParam?: string;
}

const ToolAEOContent = ({
  hookQuestion,
  intro,
  examples,
  faqs,
  toolPath,
  queryParam = "q",
}: ToolAEOContentProps) => {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="container mx-auto px-4 py-12 max-w-5xl">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* Hook + intro */}
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          {hookQuestion}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{intro}</p>
      </div>

      {/* Worked examples */}
      <div className="mb-12">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Real answers from this tool
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((ex) => {
            const href = queryParam
              ? `${toolPath}?${queryParam}=${encodeURIComponent(ex.ctaQuery)}`
              : `${toolPath.replace(/\/$/, "")}/${encodeURIComponent(ex.ctaQuery)}`;
            return (
            <Link
              key={ex.question}
              to={href}
              aria-label={`Open answer: ${ex.question}`}
              className="group rounded-xl border border-border bg-card p-5 flex flex-col hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <h4 className="font-display font-semibold text-foreground text-base mb-2 leading-snug group-hover:text-primary transition-colors">
                {ex.question}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{ex.answer}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all mt-auto">
                {ex.ctaLabel ?? "Get the full answer"} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      {faqs.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" /> Frequently asked questions
          </h3>
          <Accordion type="single" collapsible className="rounded-xl border border-border bg-card divide-y divide-border">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-0 px-4">
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </section>
  );
};

export default ToolAEOContent;
