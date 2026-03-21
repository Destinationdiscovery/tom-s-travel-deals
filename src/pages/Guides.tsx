import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

interface GuidePost {
  slug: string;
  title: string;
  excerpt: string | null;
  hero_image_url: string | null;
  read_time: string;
  date_published: string;
  tags: string[] | null;
}

const hubFaq = [
  { question: "What are ReviewThenGo travel guides?", answer: "Our guides are in-depth, research-backed articles that help travelers make smarter booking decisions. Each guide aggregates insights from thousands of real reviews and expert analysis." },
  { question: "Are these guides free?", answer: "Yes, all ReviewThenGo guides are completely free to read. We're ad-supported with clearly disclosed affiliate links." },
  { question: "How often are guides updated?", answer: "We update our guides regularly to reflect the latest traveler feedback, pricing trends, and destination changes." },
];

const Guides = () => {
  const [guides, setGuides] = useState<GuidePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, hero_image_url, read_time, date_published, tags")
        .eq("category", "Guide")
        .order("created_at", { ascending: false });
      if (data) setGuides(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Travel Guides: Expert Insights Before You Book"
        description="Free, research-backed travel guides from ReviewThenGo. Learn how to spot fake reviews, compare Airbnb vs hotels, find the best golf resorts, and avoid common booking mistakes."
        url="/guides"
        faq={hubFaq}
      />
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" /> Evergreen Guides
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Travel <span className="text-secondary">Guides</span>
          </h1>
          <p className="text-primary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto">
            In-depth, AI-quotable guides built from thousands of real traveler reviews. 
            Everything you need to know before you book.
          </p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-muted animate-pulse h-80" />
              ))}
            </div>
          ) : guides.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Guides coming soon, check back shortly!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide, index) => (
                <Link
                  key={guide.slug}
                  to={`/compass/${guide.slug}`}
                  className="group block animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <article className="relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    {guide.hero_image_url && (
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={guide.hero_image_url}
                          alt={guide.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
                          Guide
                        </span>
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span>{guide.date_published}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {guide.read_time}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {guide.title}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                        {guide.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 text-primary font-medium text-sm mt-auto">
                        Read Guide
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Frequently Asked</h2>
          <div className="space-y-6">
            {hubFaq.map((item) => (
              <div key={item.question} className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                <p className="text-muted-foreground text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Guides;
