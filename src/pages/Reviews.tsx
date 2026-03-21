import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import StickySearchBar from "@/components/reviews/StickySearchBar";
import HotelResultCard from "@/components/reviews/HotelResultCard";
import BookingSidebar from "@/components/reviews/BookingSidebar";
import SearchLoadingStages from "@/components/SearchLoadingStages";
import { useTravelSearch, SearchResult, SearchActivity } from "@/hooks/useTravelSearch";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import { MapPin, Compass, ArrowLeft } from "lucide-react";

function slugToTitle(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugToQuery(slug: string) {
  return slug.replace(/-/g, " ");
}

const Reviews = () => {
  const { query: slug } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const displayTitle = slugToTitle(slug || "");
  const searchQuery = slugToQuery(slug || "");

  const { results, activities, citations, isLoading, error, search } = useTravelSearch();
  const { generateReview, isLoading: isGenerating } = useGenerateReview();
  const [generatingName, setGeneratingName] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery && searchQuery.length >= 3) {
      search(searchQuery);
    }
  }, [searchQuery]);

  const handleReviewIt = async (name: string) => {
    setGeneratingName(name);
    try {
      await generateReview(name);
      const reviewSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      navigate(`/review/${reviewSlug}`);
    } catch {
      setGeneratingName(null);
    }
  };

  const topResult = results[0];

  const faqItems = useMemo(() => [
    { question: `What are the best ${displayTitle.toLowerCase()}?`, answer: `ReviewThenGo aggregates ratings from Google, TripAdvisor, Booking.com and more to rank the top options. Search "${searchQuery}" for the latest verified results.` },
    { question: `Are these reviews trustworthy?`, answer: `Yes. We pull data from 10+ verified sources and weight recent stays 2x for accuracy. No pay-for-play.` },
    { question: `How do I book after reading reviews?`, answer: `Use the "Ready to Book?" sidebar to compare rates on Expedia, Hotels.com, and VRBO. Reviews and booking links are clearly separated.` },
  ], [displayTitle, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${displayTitle}: Real Reviews 2026`}
        description={`Honest ratings from Google, TripAdvisor + more. Top ${displayTitle.toLowerCase()} ranked with pros, cons, and verdicts.`}
        url={`/reviews/${slug}`}
        faq={faqItems}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Reviews", url: "/reviews" },
          { name: displayTitle, url: `/reviews/${slug}` },
        ]}
      />
      <Header />

      {/* Sticky search bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-3">
        <div className="container mx-auto px-4">
          <StickySearchBar placeholder={`Search another: Adults-only Punta Cana, Beach resorts Cancun…`} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
          {displayTitle}: Real Reviews 2026
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Honest, aggregated insights from verified travelers. No pay-for-play — just real ratings and verdicts.
        </p>

        {isLoading && <SearchLoadingStages />}

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-4 mb-6">
            {error}. Try a different search.
          </div>
        )}

        {!isLoading && !error && results.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main column */}
            <div className="flex-1 space-y-6">
              {results.slice(0, 5).map((r) => (
                <HotelResultCard
                  key={r.name}
                  name={r.name}
                  location={r.location}
                  type={r.type}
                  rating={r.rating}
                  description={r.description}
                  bestFor={r.bestFor}
                  priceRange={r.priceRange}
                  onReviewIt={() => handleReviewIt(r.name)}
                  isGenerating={generatingName === r.name}
                />
              ))}

              {/* Things to Do */}
              {activities.length > 0 && (
                <section className="mt-10">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    Things to Do Nearby
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activities.slice(0, 6).map((a) => (
                      <div key={a.name} className="bg-card rounded-xl border border-border p-4">
                        <h3 className="font-semibold text-sm text-foreground mb-1">{a.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{a.location} · {a.category}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-primary">{a.rating}/5</span>
                          <span className="text-xs text-muted-foreground">{a.priceRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Compare table */}
              {results.length > 1 && (
                <section className="mt-10">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Compare All Results
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-semibold text-foreground">Property</th>
                          <th className="text-left p-3 font-semibold text-foreground">Rating</th>
                          <th className="text-left p-3 font-semibold text-foreground">Price</th>
                          <th className="text-left p-3 font-semibold text-foreground">Best For</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.slice(0, 5).map((r) => (
                          <tr key={r.name} className="border-t border-border">
                            <td className="p-3 text-foreground font-medium">{r.name}</td>
                            <td className="p-3 text-primary font-bold">{r.rating}★</td>
                            <td className="p-3 text-muted-foreground">{r.priceRange}</td>
                            <td className="p-3 text-muted-foreground">{r.bestFor.slice(0, 2).join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Citations */}
              {citations.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Sources</p>
                  <ul className="space-y-1">
                    {citations.slice(0, 5).map((c, i) => (
                      <li key={i}>
                        <a href={c} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                          {c}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom search */}
              <div className="mt-10 bg-card rounded-2xl p-6 border border-border">
                <h2 className="font-display text-lg font-bold text-foreground mb-3">
                  Try another destination?
                </h2>
                <StickySearchBar placeholder="Search hotels, resorts, cities…" />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0">
              <BookingSidebar propertyName={topResult?.name} />
            </aside>
          </div>
        )}

        {!isLoading && !error && results.length === 0 && slug && (
          <div className="text-center py-16">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No results yet. Try searching above.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
