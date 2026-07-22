import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Package, ArrowLeft, ClipboardList, Luggage, Plug, Heart, Shield, Shirt, Umbrella, Sparkles, Plus } from "lucide-react";
import { PackingNarrative } from "@/components/gear/GearResults";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface List {
  id: string; slug: string; title: string; description: string | null;
  cover_image_url: string | null; season: string | null; trip_types: string[] | null;
  narrative?: string | null; admin_notes?: string | null;
}
interface Item {
  id: string; label: string; category: string | null; quantity: number | null;
  notes: string | null; amazon_url: string | null; image_url: string | null;
  sort_order: number; is_custom?: boolean;
}

const categoryOrder = ["Packing", "Clothing", "Beach", "Tech", "Health", "Safety", "Comfort"];
const categoryIcons: Record<string, React.ElementType> = {
  Packing: Luggage, Clothing: Shirt, Beach: Umbrella, Tech: Plug, Health: Heart, Safety: Shield, Comfort: Heart,
};
const slugifyKey = (s: string) => (s || "list").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

const PackingListDetail = () => {
  const { slug } = useParams();
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [userItems, setUserItems] = useState<{ id: string; label: string; checked: boolean }[]>([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: l } = await (supabase as any)
        .from("featured_packing_lists").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      setList(l as List | null);
      if (l) {
        const { data: its } = await (supabase as any)
          .from("featured_packing_list_items").select("*").eq("list_id", (l as any).id).order("sort_order", { ascending: true });
        setItems((its as Item[]) ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  const storageKey = `rtg:featured-packing:${slug}`;
  const userItemsKey = `rtg:featured-packing-user:${slug}`;

  useEffect(() => {
    if (!slug) return;
    try { setChecked(JSON.parse(localStorage.getItem(storageKey) || "{}")); } catch {}
    try { setUserItems(JSON.parse(localStorage.getItem(userItemsKey) || "[]")); } catch {}
  }, [slug]);
  useEffect(() => { if (slug) localStorage.setItem(storageKey, JSON.stringify(checked)); }, [checked, slug]);
  useEffect(() => { if (slug) localStorage.setItem(userItemsKey, JSON.stringify(userItems)); }, [userItems, slug]);

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const cat = it.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(it);
    }
    const ordered: { category: string; items: Item[] }[] = [];
    for (const c of categoryOrder) if (map.has(c)) { ordered.push({ category: c, items: map.get(c)! }); map.delete(c); }
    for (const [c, arr] of map) ordered.push({ category: c, items: arr });
    return ordered;
  }, [items]);

  const affiliateItems = useMemo(() => items.filter((i) => i.amazon_url), [items]);
  const totalPacked = items.filter((i) => checked[i.id]).length + userItems.filter((u) => u.checked).length;
  const totalCount = items.length + userItems.length;

  const addUserItem = () => {
    const label = newItem.trim();
    if (!label) return;
    setUserItems((prev) => [...prev, { id: crypto.randomUUID(), label, checked: false }]);
    setNewItem("");
  };

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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${list.title} | ReviewThenGo packing list`}
        description={list.description ?? `${list.title}: a curated travel packing list.`}
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

        {/* Checklist */}
        {items.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border/50">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Packing checklist</h3>
                </div>
                <p className="text-xs text-muted-foreground">{totalPacked} of {totalCount} items packed</p>
              </div>

              <div className="space-y-5 mt-4">
                {grouped.map(({ category, items: catItems }) => {
                  const Icon = categoryIcons[category] || Package;
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">{category}</h4>
                        <span className="text-xs text-muted-foreground">
                          ({catItems.filter((i) => checked[i.id]).length}/{catItems.length})
                        </span>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-1">
                        {catItems.map((it) => {
                          const id = `pack-${slugifyKey(it.id)}`;
                          return (
                            <li key={it.id} className="flex items-start gap-2.5">
                              <Checkbox
                                id={id}
                                checked={!!checked[it.id]}
                                onCheckedChange={(v) => setChecked((prev) => ({ ...prev, [it.id]: !!v }))}
                                className="mt-0.5"
                              />
                              <label htmlFor={id} className={`text-sm cursor-pointer leading-snug ${it.is_custom ? "text-primary font-medium" : "text-foreground"}`}>
                                {it.label}
                                {it.is_custom && <span className="ml-1.5 text-[9px] uppercase font-bold tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded">Tom's pick</span>}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}

                {/* Visitor additions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">My additions</h4>
                    <span className="text-xs text-muted-foreground">({userItems.filter((u) => u.checked).length}/{userItems.length})</span>
                  </div>
                  {userItems.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-1 mb-3">
                      {userItems.map((u) => (
                        <li key={u.id} className="flex items-start gap-2.5">
                          <Checkbox
                            id={`user-${u.id}`}
                            checked={u.checked}
                            onCheckedChange={(v) => setUserItems((prev) => prev.map((x) => x.id === u.id ? { ...x, checked: !!v } : x))}
                            className="mt-0.5"
                          />
                          <label htmlFor={`user-${u.id}`} className="text-sm cursor-pointer leading-snug text-emerald-600 dark:text-emerald-400 font-medium flex-1">
                            {u.label}
                          </label>
                          <button
                            onClick={() => setUserItems((prev) => prev.filter((x) => x.id !== u.id))}
                            className="text-xs text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                          >×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 pl-1">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addUserItem()}
                      placeholder="Add your own item…"
                      className="h-9"
                    />
                    <Button onClick={addUserItem} size="sm" variant="secondary" className="gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 pl-1">Saved on this device.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin notes */}
        {list.admin_notes && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold">A few notes from Tom</h3>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground/90">{list.admin_notes}</div>
            </div>
          </div>
        )}

        {/* Affiliate cards (optional, below) */}
        {affiliateItems.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <h2 className="font-display text-xl font-bold mb-3">Gear picks Tom uses</h2>
            <p className="text-xs text-muted-foreground mb-4">Affiliate links, may earn a commission at no cost to you.</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {affiliateItems.map((it) => (
                <li key={it.id} className="bg-card border border-border rounded-xl p-3 flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                    {it.image_url ? <img src={it.image_url} alt={it.label} className="w-full h-full object-cover" /> : <Package className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{it.label}</p>
                    {it.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{it.notes}</p>}
                    <a href={it.amazon_url!} target="_blank" rel="noopener sponsored"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1">
                      View on Amazon <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
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
