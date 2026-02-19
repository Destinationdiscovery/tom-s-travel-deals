import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { compassArticles } from "@/data/compassArticles";

const BlogPreviewSection = () => {
  const articles = compassArticles.slice(0, 3);

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
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/compass/${article.slug}`}
              className="group block rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50"
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreviewSection;
