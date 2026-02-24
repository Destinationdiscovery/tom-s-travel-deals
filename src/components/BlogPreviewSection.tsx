import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { compassArticles } from "@/data/compassArticles";
import { buildDeepLinks, detectCountry } from "@/components/AffiliateLinks";

const DESTINATION_KEYWORDS = ["mexico", "cuba", "curaçao", "curacao", "vegas", "japan", "canada", "banff", "caribbean", "cruise", "maldives", "santorini", "phuket", "alps", "cancun"];

const BlogPreviewSection = () => {
  const articles = compassArticles.slice(0, 3);
  const country = useMemo(() => detectCountry(), []);

  const getDestinationFromArticle = (title: string, excerpt: string): string | null => {
    const text = `${title} ${excerpt}`.toLowerCase();
    return DESTINATION_KEYWORDS.find(k => text.includes(k)) || null;
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            From the Blog
          </h2>
          <Link
            to="/compass"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            All Articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => {
            const dest = getDestinationFromArticle(article.title, article.excerpt);
            const expediaLink = dest ? buildDeepLinks(country, dest).expedia : null;
            return (
              <div
                key={article.id}
                className="rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 flex flex-col"
              >
                <Link
                  to={`/compass/${article.slug}`}
                  className="group block flex-1"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="p-5 flex flex-col gap-2">
                    <span
                      className={`text-xs font-semibold text-white px-2 py-0.5 rounded-full w-fit ${article.categoryColor}`}
                    >
                      {article.category}
                    </span>
                    <h3 className="font-display font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{article.author}</span>
                      <span>·</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
                {expediaLink && (
                  <div className="px-5 pb-4">
                    <a
                      href={expediaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-secondary text-secondary-foreground px-4 py-2 rounded-full hover:bg-secondary/90 transition-colors"
                    >
                      Find Deals
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogPreviewSection;
