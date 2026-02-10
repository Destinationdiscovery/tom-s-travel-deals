import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getArticleBySlug, getRelatedArticles, ContentBlock } from "@/data/compassArticles";
import { ArrowLeft, ArrowRight, Clock, User } from "lucide-react";
import CommentsSection from "@/components/comments/CommentsSection";
import { Button } from "@/components/ui/button";

const CompassArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const relatedArticles = slug ? getRelatedArticles(slug, 3) : [];

  useEffect(() => {
    if (article) {
      document.title = `${article.title} - ReviewThenGo`;
    }
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
  }, [article]);

  // JSON-LD structured data for SEO
  useEffect(() => {
    if (!article || !slug) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.title,
      "author": { "@type": "Person", "name": article.author },
      "datePublished": article.datePublished,
      "image": article.image,
      "description": article.content?.[0] || "",
      "publisher": { "@type": "Organization", "name": "ReviewThenGo" }
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [article, slug]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Article Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The article you are looking for does not exist.
          </p>
          <Link to="/compass">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to The Compass
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case "heading":
        return (
          <h2 key={index} className="font-display text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
            {block.value}
          </h2>
        );
      case "image":
        return (
          <figure key={index} className="my-8">
            <img
              src={block.value}
              alt={block.caption || "Article image"}
              className="w-full rounded-xl shadow-soft"
            />
            {block.caption && (
              <figcaption className="text-sm text-muted-foreground mt-3 text-center italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      case "text":
      default:
        return (
          <p key={index} className="text-foreground/90 leading-relaxed mb-6">
            {block.value}
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back link */}
        <div className="absolute top-24 left-0 right-0">
          <div className="container mx-auto px-4">
            <Link 
              to="/compass"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to The Compass
            </Link>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="relative -mt-32 pb-16">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            {/* Article Header */}
            <div className="bg-card rounded-2xl shadow-elevated p-8 md:p-12 mb-8">
              {/* Category */}
              <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${article.categoryColor} mb-6`}>
                {article.category}
              </span>
              
              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {article.title}
              </h1>
              
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.author}
                </span>
                <span>{article.datePublished}</span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </span>
              </div>
            </div>

            {/* Article Body */}
            <div className="bg-card rounded-2xl shadow-soft p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                {article.richContent && article.richContent.length > 0 ? (
                  // Render rich content with images and headings
                  article.richContent.map((block, index) => renderContentBlock(block, index))
                ) : (
                  // Fallback to simple text paragraphs
                  article.content.map((paragraph, index) => (
                    <p key={index} className="text-foreground/90 leading-relaxed mb-6 last:mb-0">
                      {paragraph}
                    </p>
                  ))
                )}
              </div>

            </div>

            {/* Comments Section */}
            <div className="bg-card rounded-2xl shadow-soft p-8 md:p-12 mt-8">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Questions or Thoughts on This Article?
              </h3>
              <CommentsSection pageSlug={slug!} pageType="compass" />
            </div>
          </article>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              More from The Compass
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/compass/${related.slug}`}
                  className="group block"
                >
                  <article className="relative overflow-hidden rounded-xl bg-card shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-white text-xs font-medium ${related.categoryColor}`}>
                        {related.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/compass">
                <Button variant="outline">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default CompassArticle;
