import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadingProgress from "@/components/ReadingProgress";
import { getArticleBySlug, getRelatedArticles, type ContentBlock, type CompassArticle as CompassArticleType } from "@/data/compassArticles";
import { ArrowLeft, ArrowRight, Clock, User } from "lucide-react";
import CommentsSection from "@/components/comments/CommentsSection";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import AuthorBio from "@/components/AuthorBio";
import CompassArticleToolsCTA from "@/components/CompassArticleToolsCTA";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const CompassArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<(CompassArticleType & { tags?: string[]; updatedAt?: string; faq_items?: Array<{question: string; answer: string}>; internal_links?: Array<{text: string; url: string}>; primary_keyword?: string }) | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const relatedArticles = slug ? getRelatedArticles(slug, 3) : [];

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    const load = async () => {
      // Try database first
      const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle() as any;
      if (data) {
        setArticle({
          id: 9999, slug: data.slug, title: data.title, category: data.category,
          categoryColor: data.category_color, image: data.hero_image_url || "",
          excerpt: data.excerpt || "", author: data.author, datePublished: data.date_published,
          readTime: data.read_time, content: [], richContent: data.rich_content || [],
          tags: data.tags || [], updatedAt: data.updated_at || data.date_published,
          faq_items: data.faq_items || [], internal_links: data.internal_links || [],
          primary_keyword: data.primary_keyword || "",
        });
      } else {
        setArticle(getArticleBySlug(slug));
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  // Strip markdown syntax for clean meta description
  const stripMarkdown = (s: string) =>
    s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
     .replace(/\*\*([^*]+)\*\*/g, "$1")
     .replace(/\*([^*\n]+)\*/g, "$1")
     .replace(/[#>`_~]/g, "")
     .replace(/\s+/g, " ")
     .trim();

  // Build description from best available source
  const rawDescription = article?.excerpt
    || (article?.richContent?.find((b: any) => b.type === "text")?.value || (article?.richContent?.find((b: any) => b.type === "text") as any)?.content)
    || article?.content?.[0]
    || "";
  const cleanDescription = stripMarkdown(rawDescription).slice(0, 158);
  const jsonLdDescription = cleanDescription;

  // Convert datePublished to ISO if possible
  const toIso = (d?: string) => {
    if (!d) return undefined;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  };
  const publishedIso = toIso(article?.datePublished);
  const modifiedIso = toIso(article?.updatedAt) || publishedIso;

  // Compute word count from rich content for JSON-LD
  const wordCount = article ? (() => {
    const blocks = article.richContent || [];
    const text = blocks
      .map((b: any) => b.value || b.content || "")
      .join(" ");
    const fallback = article.content?.join(" ") || "";
    return (text + " " + fallback).trim().split(/\s+/).filter(Boolean).length;
  })() : 0;

  // Build BlogPosting JSON-LD (passed to SEOHead below)
  const blogPostingJsonLd = article ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "author": { "@type": "Person", "name": article.author },
    "datePublished": publishedIso || article.datePublished,
    "dateModified": modifiedIso || publishedIso || article.datePublished,
    "image": article.image,
    "description": jsonLdDescription,
    "inLanguage": "en-US",
    ...(wordCount > 0 ? { "wordCount": wordCount } : {}),
    "publisher": {
      "@type": "Organization",
      "name": "ReviewThenGo",
      "logo": { "@type": "ImageObject", "url": "https://www.reviewthengo.com/favicon.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://www.reviewthengo.com/compass/${slug}` },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".prose p"]
    },
    ...(article.tags?.length ? { "keywords": article.tags.join(", ") } : {}),
  } : null;

  // BreadcrumbList JSON-LD for richer SERP display
  const breadcrumbJsonLd = article ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.reviewthengo.com/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.reviewthengo.com/compass" },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://www.reviewthengo.com/compass/${slug}` },
    ],
  } : null;

  const combinedJsonLd = [blogPostingJsonLd, breadcrumbJsonLd].filter(Boolean);

  // Show "Updated" line when meaningfully different from publish date
  const showUpdated = (() => {
    if (!publishedIso || !modifiedIso) return false;
    const p = new Date(publishedIso).getTime();
    const m = new Date(modifiedIso).getTime();
    return m - p > 24 * 60 * 60 * 1000; // > 1 day later
  })();
  const updatedDisplay = modifiedIso
    ? new Date(modifiedIso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <p className="text-muted-foreground">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

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

  // Parse inline markdown: links [text](url), **bold**, *italic*
  const renderInlineMarkdown = (input: string): React.ReactNode[] => {
    if (!input) return [];
    const nodes: React.ReactNode[] = [];
    // Combined regex: links | bold | italic
    const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(input.slice(lastIndex, match.index));
      }
      if (match[1] && match[2]) {
        const url = match[2];
        const isInternal = url.startsWith("/") || url.startsWith("#");
        const rel = isInternal ? "noopener" : "sponsored noopener noreferrer";
        nodes.push(
          <a
            key={`lnk-${key++}`}
            href={url}
            target={isInternal ? undefined : "_blank"}
            rel={rel}
            className="!text-primary hover:!text-primary/80 underline underline-offset-2 font-medium decoration-primary/40 hover:decoration-primary"
          >
            {match[1]}
          </a>
        );
      } else if (match[3]) {
        nodes.push(<strong key={`b-${key++}`}>{match[3]}</strong>);
      } else if (match[4]) {
        nodes.push(<em key={`i-${key++}`}>{match[4]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < input.length) {
      nodes.push(input.slice(lastIndex));
    }
    return nodes;
  };

  const renderContentBlock = (block: any, index: number) => {
    const text = block.value || block.content || "";
    switch (block.type) {
      case "heading":
        return (
          <h2 key={index} className="font-display text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
            {renderInlineMarkdown(text)}
          </h2>
        );
      case "image":
        return (
          <figure key={index} className="my-8">
            <img
              src={text}
              alt={block.caption || "Article image"}
              loading="lazy"
              className="w-full rounded-xl object-cover"
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
            {renderInlineMarkdown(text)}
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={article.title}
        description={cleanDescription || article.excerpt || ""}
        image={article.image}
        url={`/compass/${slug}`}
        type="article"
        publishedTime={publishedIso}
        modifiedTime={modifiedIso}
        author={article.author}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/compass" },
          { name: article.title, url: `/compass/${slug}` },
        ]}
        jsonLd={combinedJsonLd.length > 0 ? combinedJsonLd : undefined}
        keywords={article.tags}
        faq={article.faq_items && article.faq_items.length > 0 ? article.faq_items : undefined}
      />
      <Header />
      <ReadingProgress />
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
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/compass">Blog</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{article.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

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
                {showUpdated && (
                  <span className="text-sm italic">
                    Updated {updatedDisplay}
                  </span>
                )}
              </div>
            </div>

            {/* Article Body */}
            <div className="bg-card rounded-2xl shadow-soft p-8 md:p-12">
              <div className="prose prose-lg dark:prose-invert max-w-none prose-a:!text-primary prose-a:no-underline">
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

            {/* FAQ Section */}
            {article.faq_items && article.faq_items.length > 0 && (
              <div className="bg-card rounded-2xl shadow-soft p-8 md:p-12 mt-8">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {article.faq_items.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left text-foreground">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-foreground/80">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Internal Links - Related on ReviewThenGo */}
            {article.internal_links && article.internal_links.length > 0 && (
              <div className="bg-card rounded-2xl shadow-soft p-8 md:p-12 mt-8">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Related on ReviewThenGo</h2>
                <ul className="space-y-2">
                  {article.internal_links.map((link, i) => {
                    const isInternal = link.url.startsWith("/") || link.url.startsWith("#");
                    return (
                      <li key={i}>
                        <a
                          href={link.url}
                          target={isInternal ? undefined : "_blank"}
                          rel={isInternal ? undefined : "noopener noreferrer"}
                          className="text-primary underline underline-offset-2 hover:opacity-80"
                        >
                          {link.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Programmatic tools CTA: auto-picks 3 relevant tools by article keywords */}
            <CompassArticleToolsCTA
              title={article.title}
              category={article.category}
              tags={article.tags}
            />

            <AuthorBio />

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
