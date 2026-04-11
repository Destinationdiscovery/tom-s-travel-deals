import { User } from "lucide-react";

const AuthorBio = () => (
  <div className="flex items-start gap-4 rounded-2xl bg-card border border-border p-6 mt-8">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
      <User className="h-6 w-6 text-primary" />
    </div>
    <div>
      <p className="font-display font-bold text-foreground text-sm">
        Tom — Travel Consultant &amp; Founder
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
        With over a decade of experience in travel consulting and thousands of destinations researched, Tom built ReviewThenGo to help travelers make confident booking decisions. Every article is grounded in real-world travel expertise.
      </p>
    </div>
  </div>
);

export default AuthorBio;
