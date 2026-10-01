import { Link } from "@/lib/router-compat";
import { ArrowRight } from "lucide-react";

interface ToolIntroLink {
  to: string;
  label: string;
}

interface ToolIntroSectionProps {
  heading: string;
  paragraph: string;
  exampleQuestions: string[];
  crossLinks: ToolIntroLink[];
}

const ToolIntroSection = ({ heading, paragraph, exampleQuestions, crossLinks }: ToolIntroSectionProps) => (
  <section className="py-12 bg-muted/20 border-t border-border/50">
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
        {heading}
      </h2>
      <p className="text-muted-foreground text-base leading-relaxed mb-6">
        {paragraph}
      </p>
      {exampleQuestions.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-soft">
          <p className="text-sm font-semibold text-foreground mb-3">People also ask:</p>
          <ul className="space-y-2">
            {exampleQuestions.map((q) => (
              <li key={q} className="text-sm text-muted-foreground italic leading-relaxed">
                "{q}"
              </li>
            ))}
          </ul>
        </div>
      )}
      {crossLinks.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {crossLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors"
            >
              {link.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  </section>
);

export default ToolIntroSection;
