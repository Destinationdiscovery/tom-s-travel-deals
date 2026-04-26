import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import { compassArticles, type CompassArticle } from "@/data/compassArticles";
import { ArrowRight, Clock } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import heroImg from "@/assets/blog-hero-nightsky.png";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Packing", "Guides", "Budget", "Insurance", "Timing"];

const Compass = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [allArticles, setAllArticles] = useState<CompassArticle[]>(compassArticles);

  useEffect(() => {
    supabase.functions.invoke("track-review-view", { body: { slug: "compass" } }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchDbPosts = async () => {
      const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false }) as any;
      if (data && data.length > 0) {
        const dbArticles: CompassArticle[] = data.map((p: any, i: number) => ({
          id: 1000 + i,
          slug: p.slug,
          title: p.title,
          category: p.category,
          categoryColor: p.category_color,
          image: p.hero_image_url || "",
          excerpt: p.excerpt || "",
          author: p.author,
          datePublished: p.date_published,
          readTime: p.read_time,
          content: [],
          richContent: p.rich_content || [],
        }));
        // DB posts first, then static (deduped by slug)
        const staticSlugs = new Set(dbArticles.map((a: CompassArticle) => a.slug));
        const merged = [...dbArticles, ...compassArticles.filter(a => !staticSlugs.has(a.slug))];
        setAllArticles(merged);
      }
    };
    fetchDbPosts();
  }, []);

  const filteredArticles = activeCategory === "All" 
    ? allArticles 
    : allArticles.filter(article => article.category === activeCategory);

  const blogListJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "ReviewThenGo Travel Blog",
    "url": "https://www.reviewthengo.com/compass",
    "description": "Insider travel tips, planning guides, and industry insights from a decade of travel consulting.",
    "blogPost": allArticles.slice(0, 50).map((a) => ({
      "@type": "BlogPosting",
      "headline": a.title,
      "url": `https://www.reviewthengo.com/compass/${a.slug}`,
      "image": a.image,
      "datePublished": a.datePublished,
      "author": { "@type": "Person", "name": a.author },
      ...(a.excerpt ? { "description": a.excerpt } : {}),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="The Compass | Travel Blog, Destination Guides & Industry Insights"
        description="Honest travel guides, destination journalism, and travel industry insights from a working travel consultant. New articles weekly. No fluff."
        url="/compass"
        keywords={["travel blog", "travel guides", "destination guides", "travel tips", "trip planning"]}
        jsonLd={blogListJsonLd}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/compass" },
        ]}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center pt-20">
        <img src={heroImg} alt="Starry night sky over mountains" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
            Travel Intel
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="text-primary">Travel</span> Blog
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
            Insider tips and travel wisdom from over a decade of experience as a travel consultant. 
            Practical advice to help you travel smarter.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border bg-background sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <Link
                key={article.id}
                to={`/compass/${article.slug}`}
                className="group block animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <article className="relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 h-full">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Category badge */}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-medium ${article.categoryColor}`}>
                      {article.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span>{article.datePublished}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                    
                    <h2 className="font-display text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    <span className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                      Read Article 
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Compass;
