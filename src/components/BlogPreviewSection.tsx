import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { compassArticles } from "@/data/compassArticles";
import { buildDeepLinks, detectCountry } from "@/components/AffiliateLinks";

const DESTINATION_KEYWORDS = ["mexico", "cuba", "curaçao", "curacao", "vegas", "japan", "canada", "banff", "caribbean", "cruise", "maldives", "santorini", "phuket", "alps", "cancun"];

interface UnifiedArticle {
  slug: string;
  title: string;
  category: string;
  categoryColor: string;
  image: string;
  excerpt: string;
  author: string;
  datePublished: string;
  readTime: string;
}

const BlogPreviewSection = () => {
  const country = useMemo(() => detectCountry(), []);

  const dbPostsQuery = useQuery({
    queryKey: ["blog-posts-homepage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, category, category_color, hero_image_url, excerpt, author, date_published, read_time")
        .order("date_published", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const articles = useMemo<UnifiedArticle[]>(() => {
    // Map hardcoded articles
    const hardcoded: UnifiedArticle[] = compassArticles.map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      categoryColor: a.categoryColor,
      image: a.image,
      excerpt: a.excerpt,
      author: a.author,
      datePublished: a.datePublished,
      readTime: a.readTime,
    }));

    // Map DB articles
    const dbArticles: UnifiedArticle[] = (dbPostsQuery.data ?? []).map((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      categoryColor: p.category_color,
      image: p.hero_image_url ?? "",
      excerpt: p.excerpt ?? "",
      author: p.author,
      datePublished: p.date_published,
      readTime: p.read_time,
    }));

    // Merge, deduplicate by slug (DB wins), sort newest first, take 3
    const slugMap = new Map<string, UnifiedArticle>();
    hardcoded.forEach((a) => slugMap.set(a.slug, a));
    dbArticles.forEach((a) => slugMap.set(a.slug, a)); // DB overwrites

    return Array.from(slugMap.values())
      .sort((a, b) => b.datePublished.localeCompare(a.datePublished))
      .slice(0, 3);
  }, [dbPostsQuery.data]);

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
                key={article.slug}
                className="rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 flex flex-col"
              >
                <Link
                  to={`/compass/${article.slug}`}
                  className="group block flex-1"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  )}
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
