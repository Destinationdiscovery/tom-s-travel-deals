import { useEffect, useState } from "react";
import { useParams, Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Star, Check, X, ExternalLink, ArrowLeft, Luggage } from "lucide-react";

interface Review {
  id: string; slug: string; product_name: string; brand: string | null;
  category: string | null; hero_image_url: string | null; rating: number | null;
  pros: string[] | null; cons: string[] | null; notes: string | null;
  used_on: string | null; first_used_at: string | null;
  affiliate_url: string | null; price_range: string | null;
  gallery_image_urls: string[] | null;
}

const GearReviewDetail = () => {
  const { slug } = useParams();
  const [r, setR] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("featured_gear_reviews")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setR(data as Review | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!r) return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-3xl text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Gear review not found</h1>
        <Link to="/gear-reviews" className="text-primary hover:underline">Back to all gear reviews</Link>
      </main>
      <Footer />
    </div>
  );

  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: r.product_name,
    ...(r.brand ? { brand: { "@type": "Brand", name: r.brand } } : {}),
    ...(r.hero_image_url ? { image: r.hero_image_url } : {}),
    ...(r.category ? { category: r.category } : {}),
    ...(r.notes ? { description: r.notes.slice(0, 300) } : {}),
    ...(r.rating != null ? {
      review: {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
        author: { "@type": "Person", name: "Tom" },
      },
      aggregateRating: { "@type": "AggregateRating", ratingValue: r.rating, reviewCount: 1, bestRating: 5 },
    } : {}),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${r.product_name} review | ReviewThenGo`}
        description={r.notes ? r.notes.slice(0, 155) : `Honest review of the ${r.product_name}.`}
        url={`/gear-reviews/${r.slug}`}
        {...(r.hero_image_url && { image: r.hero_image_url })}
        jsonLd={[productJsonLd]}
      />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
        <Link to="/gear-reviews" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> All gear reviews
        </Link>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-muted flex items-center justify-center">
            {r.hero_image_url ? (
              <img src={r.hero_image_url} alt={r.product_name} className="w-full h-full object-cover" />
            ) : <Luggage className="h-16 w-16 text-muted-foreground" />}
          </div>
          <div>
            {r.brand && <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{r.brand}</p>}
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{r.product_name}</h1>
            {r.rating != null && (
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-5 w-5 ${n <= Math.round(r.rating!) ? "fill-primary text-primary" : "text-muted"}`} />
                ))}
                <span className="ml-1 text-sm font-semibold">{r.rating.toFixed(1)} / 5</span>
              </div>
            )}
            {r.category && <p className="text-sm text-muted-foreground mb-1">Category: {r.category}</p>}
            {r.price_range && <p className="text-sm text-muted-foreground mb-1">Price: {r.price_range}</p>}
            {r.used_on && <p className="text-sm text-muted-foreground mb-1">Used on: {r.used_on}</p>}
            {r.affiliate_url && (
              <a href={r.affiliate_url} target="_blank" rel="noopener sponsored"
                className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold px-5 py-2.5 rounded-lg">
                Buy on Amazon <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {r.gallery_image_urls && r.gallery_image_urls.length > 0 && (() => {
          const all = [r.hero_image_url, ...r.gallery_image_urls].filter(Boolean) as string[];
          return (
            <div className="mb-8">
              <h2 className="font-display text-lg font-bold mb-3">More photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {r.gallery_image_urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => { setLightboxIndex(all.indexOf(url)); setLightboxOpen(true); }}
                    className="aspect-square rounded-xl overflow-hidden border border-border group focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <img src={url} alt={`${r.product_name} photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </button>
                ))}
              </div>
              <ImageLightbox images={all} initialIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} />
            </div>
          );
        })()}


        {(r.pros?.length || r.cons?.length) ? (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {r.pros && r.pros.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-display text-lg font-bold mb-3">Pros</h2>
                <ul className="space-y-2">
                  {r.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {r.cons && r.cons.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-display text-lg font-bold mb-3">Cons</h2>
                <ul className="space-y-2">
                  {r.cons.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" /> <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {r.notes && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h2 className="font-display text-lg font-bold mb-3">My notes</h2>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{r.notes}</div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GearReviewDetail;
