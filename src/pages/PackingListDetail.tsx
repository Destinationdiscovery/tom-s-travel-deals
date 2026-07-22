import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Package, ArrowLeft } from "lucide-react";
import { PackingNarrative } from "@/components/gear/GearResults";

interface List {
  id: string; slug: string; title: string; description: string | null;
  cover_image_url: string | null; season: string | null; trip_types: string[] | null;
  narrative?: string | null;
}
interface Item {
  id: string; label: string; category: string | null; quantity: number | null;
  notes: string | null; amazon_url: string | null; image_url: string | null; sort_order: number;
}

const PackingListDetail = () => {
  const { slug } = useParams();
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: l } = await (supabase as any)
        .from("featured_packing_lists")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setList(l as List | null);
      if (l) {
        const { data: its } = await (supabase as any)
          .from("featured_packing_list_items")
          .select("*")
          .eq("list_id", (l as any).id)
          .order("sort_order", { ascending: true });
        setItems((its as Item[]) ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!list) return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-3xl text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Packing list not found</h1>
        <Link to="/packing-lists" className="text-primary hover:underline">Back to all packing lists</Link>
      </main>
      <Footer />
    </div>
  );

  const byCategory = items.reduce<Record<string, Item[]>>((acc, it) => {
    const k = it.category || "Essentials";
    (acc[k] ??= []).push(it);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${list.title} | ReviewThenGo packing list`}
        description={list.description ?? `${list.title}: a curated travel packing list with Amazon-linked items.`}
        url={`/packing-lists/${list.slug}`}
        image={list.cover_image_url ?? undefined}
      />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
        <Link to="/packing-lists" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> All packing lists
        </Link>
        {list.cover_image_url && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6 border border-border">
            <img src={list.cover_image_url} alt={list.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{list.title}</h1>
        {list.description && <p className="text-muted-foreground text-lg mb-4">{list.description}</p>}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {list.season && <span className="text-xs uppercase font-bold tracking-wider bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{list.season}</span>}
          {list.trip_types?.map((t) => (
            <span key={t} className="text-xs uppercase font-bold tracking-wider bg-muted text-muted-foreground px-2 py-1 rounded-full">{t}</span>
          ))}
        </div>

        {list.narrative && <PackingNarrative narrative={list.narrative} />}

        {items.length === 0 ? (
          <p className="text-muted-foreground">No items in this list yet.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(byCategory).map(([cat, its]) => (
              <div key={cat}>
                <h2 className="font-display text-xl font-bold mb-3">{cat}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {its.map((it) => (
                    <li key={it.id} className="bg-card border border-border rounded-xl p-3 flex gap-3">
                      <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {it.image_url ? <img src={it.image_url} alt={it.label} className="w-full h-full object-cover" /> : <Package className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{it.label}{it.quantity && it.quantity > 1 ? ` × ${it.quantity}` : ""}</p>
                        {it.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{it.notes}</p>}
                        {it.amazon_url && (
                          <a href={it.amazon_url} target="_blank" rel="noopener sponsored"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1">
                            View on Amazon <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-card border border-border rounded-2xl p-6 text-center">
          <h3 className="font-display text-xl font-bold mb-2">Want to save this to your own trip?</h3>
          <p className="text-sm text-muted-foreground mb-4">Start a free trip plan and copy in the items you actually need.</p>
          <Link to="/my-trips" className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold px-5 py-2.5 rounded-lg">
            Start my free trip plan
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PackingListDetail;
