import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package, Loader2, Plus, Trash2, Upload, Eye, ArrowLeft, Search, Sparkles, Save, ExternalLink, RefreshCw,
} from "lucide-react";
import { useGearIntel, type GearItem } from "@/hooks/useGearIntel";
import { PackingResultCard, PackingNarrative, GearLoading, ProductReviewPanel } from "@/components/gear/GearResults";
import PackingChecklist from "@/components/gear/PackingChecklist";

// ---------- types ----------
interface List {
  id: string; slug: string; title: string; description: string | null;
  cover_image_url: string | null; season: string | null; trip_types: string[] | null;
  source: string; source_trip_id: string | null; is_published: boolean;
  published_at: string | null; sort_order: number;
  narrative?: string | null; source_query?: string | null;
  admin_notes?: string | null;
}
interface Item {
  id: string; list_id: string; label: string; category: string | null;
  quantity: number | null; notes: string | null; amazon_url: string | null;
  image_url: string | null; sort_order: number;
  is_custom?: boolean;
  // client-only extras from AI generate
  _brand?: string; _price?: string; _reason?: string;
}
interface TripOpt { id: string; trip_name: string }

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);

const gearItemToRow = (g: GearItem, listId: string, sortOrder: number): Omit<Item, "id"> => ({
  list_id: listId,
  label: g.name,
  category: g.category || null,
  quantity: 1,
  notes: g.reason || null,
  amazon_url: g.amazonUrl || null,
  image_url: g.imageUrl || null,
  sort_order: sortOrder,
});

const itemToGearItem = (it: Item): GearItem => ({
  name: it.label,
  brand: it._brand ?? "",
  priceRange: it._price ?? "",
  reason: it.notes ?? "",
  category: it.category ?? "Packing",
  amazonUrl: it.amazon_url ?? "",
  imageUrl: it.image_url ?? undefined,
});

// ---------- component ----------
const FeaturedPackingListsManager = () => {
  const [view, setView] = useState<"browse" | "editor">("browse");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<TripOpt[]>([]);
  const [pickedTrip, setPickedTrip] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("featured_packing_lists")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });
    setLists((data as List[]) ?? []);
    setLoading(false);
  };
  const fetchTrips = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any).from("trips").select("id, trip_name").eq("user_id", user.id).order("created_at", { ascending: false });
    setTrips((data as TripOpt[]) ?? []);
  };
  useEffect(() => { fetchAll(); fetchTrips(); }, []);

  // ---------- create empty draft and open editor ----------
  const createBlankAndOpen = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const slug = `list-${Math.random().toString(36).slice(2, 8)}`;
    const { data: created, error } = await (supabase as any).from("featured_packing_lists").insert({
      slug, title: "Untitled packing list", source: "curated", created_by: user?.id,
    }).select("id").single();
    setSaving(false);
    if (error || !created) { toast({ title: "Failed to create", description: error?.message, variant: "destructive" }); return; }
    await fetchAll();
    setEditingId(created.id);
    setView("editor");
  };

  const importFromTrip = async () => {
    if (!pickedTrip) return;
    const trip = trips.find((t) => t.id === pickedTrip);
    if (!trip) return;
    setSaving(true);
    const { data: packing } = await (supabase as any).from("trip_packing_items").select("*").eq("trip_id", pickedTrip);
    const slug = `${slugify(trip.trip_name)}-packing-${Math.random().toString(36).slice(2, 6)}`;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: newList, error } = await (supabase as any).from("featured_packing_lists").insert({
      slug, title: `${trip.trip_name} packing list`,
      description: `Packing list from my ${trip.trip_name} trip.`,
      source: "trip", source_trip_id: pickedTrip, created_by: user?.id,
    }).select("id").single();
    if (error || !newList) { setSaving(false); toast({ title: "Failed", description: error?.message, variant: "destructive" }); return; }
    if (packing && packing.length > 0) {
      const rows = (packing as any[]).map((p, i) => ({
        list_id: newList.id, label: p.label, category: p.category,
        quantity: p.quantity ?? 1, notes: p.notes, amazon_url: p.amazon_url, image_url: p.image_url,
        sort_order: i,
      }));
      await (supabase as any).from("featured_packing_list_items").insert(rows);
    }
    setSaving(false);
    setPickedTrip("");
    await fetchAll();
    setEditingId(newList.id);
    setView("editor");
  };

  const togglePublish = async (l: List) => {
    await (supabase as any).from("featured_packing_lists").update({
      is_published: !l.is_published,
      published_at: !l.is_published ? new Date().toISOString() : l.published_at,
    }).eq("id", l.id);
    fetchAll();
  };

  const deleteList = async (id: string) => {
    if (!confirm("Delete this list?")) return;
    await (supabase as any).from("featured_packing_lists").delete().eq("id", id);
    if (editingId === id) { setEditingId(null); setView("browse"); }
    fetchAll();
  };

  if (view === "editor" && editingId) {
    return (
      <PackingListEditor
        listId={editingId}
        onBack={() => { setEditingId(null); setView("browse"); fetchAll(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> Featured Packing Lists
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Generate a list using the same tool your visitors use, then edit, add notes and publish.</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold">Start a new list</h2>
          <p className="text-xs text-muted-foreground">Creates a draft and opens the editor. Inside, run the packing AI on a destination and refine.</p>
          <Button onClick={createBlankAndOpen} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} New packing list
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold">Import from an existing trip</h2>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Trip</Label>
              <Select value={pickedTrip} onValueChange={setPickedTrip}>
                <SelectTrigger><SelectValue placeholder="Choose a trip…" /></SelectTrigger>
                <SelectContent>
                  {trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.trip_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={importFromTrip} disabled={!pickedTrip || saving}>Import as draft</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">All lists ({lists.length})</h2>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : lists.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lists yet.</p>
        ) : (
          <div className="space-y-2">
            {lists.map((l) => (
              <Card key={l.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  {l.cover_image_url ? (
                    <img src={l.cover_image_url} className="w-16 h-16 object-cover rounded border" />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{l.title}</p>
                    <p className="text-xs text-muted-foreground">/{l.slug} · {l.source}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {l.is_published && (
                      <a href={`/packing-lists/${l.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <Eye className="h-3.5 w-3.5" /> View
                      </a>
                    )}
                    <Switch checked={l.is_published} onCheckedChange={() => togglePublish(l)} />
                    <span className="text-xs">{l.is_published ? "Live" : "Draft"}</span>
                    <Button size="sm" variant="secondary" onClick={() => { setEditingId(l.id); setView("editor"); }}>Edit</Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteList(l.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== EDITOR ====================

interface EditorProps { listId: string; onBack: () => void }

const useDebouncedCallback = <T extends (...args: any[]) => void>(fn: T, delay = 500) => {
  const t = useRef<number | null>(null);
  return (...args: Parameters<T>) => {
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => fn(...args), delay);
  };
};

const PackingListEditor = ({ listId, onBack }: EditorProps) => {
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const { loading: genLoading, error, packingData, reviewData, reviewLoading, fetchPackingList, fetchProductReview, clearReview } = useGearIntel();

  const load = async () => {
    setLoading(true);
    const { data: l } = await (supabase as any).from("featured_packing_lists").select("*").eq("id", listId).maybeSingle();
    const { data: its } = await (supabase as any).from("featured_packing_list_items").select("*").eq("list_id", listId).order("sort_order", { ascending: true });
    setList(l as List | null);
    setItems((its as Item[]) ?? []);
    setQuery(((l as any)?.source_query) ?? "");
    setLoading(false);
  };
  useEffect(() => { load(); }, [listId]);

  // debounced list-meta save
  const saveListDebounced = useDebouncedCallback(async (patch: Partial<List>) => {
    await (supabase as any).from("featured_packing_lists").update(patch).eq("id", listId);
  }, 500);
  const patchList = (p: Partial<List>) => { setList((prev) => prev ? { ...prev, ...p } : prev); saveListDebounced(p); };

  // debounced item save
  const saveItemDebounced = useDebouncedCallback(async (id: string, patch: Partial<Item>) => {
    const clean: any = { ...patch }; delete clean._brand; delete clean._price; delete clean._reason;
    await (supabase as any).from("featured_packing_list_items").update(clean).eq("id", id);
  }, 500);
  const patchItem = (id: string, p: Partial<Item>) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, ...p } : it));
    saveItemDebounced(id, p);
  };

  const generate = async () => {
    if (query.trim().length < 2) return;
    clearReview();
    await fetchPackingList(query.trim());
  };

  // when AI returns data, add items to DB (skip duplicates by label) and store narrative + query
  useEffect(() => {
    if (!packingData || !list) return;
    (async () => {
      const existingLabels = new Set(items.map((i) => i.label.toLowerCase()));
      const newOnes = packingData.items.filter((g) => !existingLabels.has(g.name.toLowerCase()));
      const startOrder = items.length;
      let insertedRows: Item[] = [];
      if (newOnes.length) {
        const rows = newOnes.map((g, i) => gearItemToRow(g, listId, startOrder + i));
        const { data: inserted } = await (supabase as any).from("featured_packing_list_items").insert(rows).select("*");
        insertedRows = (inserted as Item[]) ?? [];
      }
      await (supabase as any).from("featured_packing_lists").update({
        narrative: packingData.narrative ?? null,
        source_query: query.trim(),
      }).eq("id", listId);
      setList((prev) => prev ? { ...prev, narrative: packingData.narrative ?? null, source_query: query.trim() } : prev);
      if (insertedRows.length) setItems((prev) => [...prev, ...insertedRows]);
      toast({ title: `Added ${insertedRows.length} items` });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packingData]);

  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `packing-lists/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
      patchList({ cover_image_url: pub.publicUrl });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const addManualItem = async () => {
    const { data: inserted } = await (supabase as any).from("featured_packing_list_items").insert({
      list_id: listId, label: "New item", category: "Packing", sort_order: items.length, is_custom: true,
    }).select("*").single();
    if (inserted) setItems((prev) => [...prev, inserted as Item]);
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    await (supabase as any).from("featured_packing_list_items").delete().eq("id", id);
  };

  const togglePublish = async () => {
    if (!list) return;
    const next = !list.is_published;
    await (supabase as any).from("featured_packing_lists").update({
      is_published: next, published_at: next ? new Date().toISOString() : list.published_at,
    }).eq("id", listId);
    setList((prev) => prev ? { ...prev, is_published: next } : prev);
    toast({ title: next ? "Published" : "Reverted to draft" });
  };

  const gearItems = useMemo(() => items.map(itemToGearItem), [items]);

  if (loading || !list) return <div className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" onClick={onBack} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> All lists</Button>
        <div className="flex items-center gap-3">
          {list.is_published && (
            <a href={`/packing-lists/${list.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <Eye className="h-4 w-4" /> View live
            </a>
          )}
          <Switch checked={list.is_published} onCheckedChange={togglePublish} />
          <span className="text-sm">{list.is_published ? "Live" : "Draft"}</span>
        </div>
      </div>

      {/* Meta */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={list.title} onChange={(e) => patchList({ title: e.target.value })} />
            </div>
            <div>
              <Label>Season</Label>
              <Input value={list.season ?? ""} onChange={(e) => patchList({ season: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={2} value={list.description ?? ""} onChange={(e) => patchList({ description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Trip types (comma separated)</Label>
              <Input
                value={(list.trip_types ?? []).join(", ")}
                onChange={(e) => patchList({ trip_types: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Cover image</Label>
              <div className="flex items-start gap-3 mt-1">
                {list.cover_image_url
                  ? <img src={list.cover_image_url} className="w-24 h-16 object-cover rounded border" />
                  : <div className="w-24 h-16 border border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">No image</div>}
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading…" : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                  </label>
                  <Input placeholder="…or paste URL" value={list.cover_image_url ?? ""} onChange={(e) => patchList({ cover_image_url: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Save className="h-3 w-3" /> Autosaves as you type.</p>
        </CardContent>
      </Card>

      {/* Generate (same tool as public /gear) */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Generate with the packing AI</h2>
          </div>
          <p className="text-xs text-muted-foreground">Same tool your visitors use on /gear. New items get appended; duplicates by name are skipped.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="e.g. Sorrento beach trip August"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
            </div>
            <Button onClick={generate} disabled={genLoading || query.trim().length < 2} className="gap-1.5">
              {genLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : list.source_query ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {list.source_query ? "Regenerate" : "Generate"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Live product review panel (when admin clicks Review This on a card) */}
      {reviewLoading && <GearLoading label="Researching product reviews..." />}
      {reviewData && !reviewLoading && <ProductReviewPanel review={reviewData} onBack={clearReview} />}

      {/* Preview / edit: same visual layout as /gear tool */}
      {!reviewData && (
        <>
          {/* Narrative editor */}
          <Card>
            <CardContent className="p-5 space-y-2">
              <Label className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> Trip briefing (shown to visitors)</Label>
              <Textarea
                rows={6}
                value={list.narrative ?? ""}
                onChange={(e) => patchList({ narrative: e.target.value })}
                placeholder="AI briefing will appear here after generating. Edit freely."
              />
            </CardContent>
          </Card>

          {list.narrative && <PackingNarrative narrative={list.narrative} />}

          {items.length > 0 && (
            <PackingChecklist items={gearItems} querySlug={list.slug} />
          )}

          {/* Editable cards grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((it) => (
                <Card key={it.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-[1fr_140px_auto] gap-2">
                      <Input value={it.label} onChange={(e) => patchItem(it.id, { label: e.target.value })} placeholder="Item name" />
                      <Input value={it.category ?? ""} onChange={(e) => patchItem(it.id, { category: e.target.value })} placeholder="Category" />
                      <Button size="icon" variant="ghost" onClick={() => removeItem(it.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {it.image_url && (
                      <div className="h-32 rounded-md overflow-hidden bg-muted">
                        <img src={it.image_url} alt={it.label} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <Input
                      value={it.amazon_url ?? ""}
                      onChange={(e) => patchItem(it.id, { amazon_url: e.target.value })}
                      placeholder="Amazon / affiliate URL"
                    />
                    <div>
                      <Label className="text-xs">Notes (shown on public page)</Label>
                      <Textarea
                        rows={3}
                        value={it.notes ?? ""}
                        onChange={(e) => patchItem(it.id, { notes: e.target.value })}
                        placeholder="Why this item, how you used it, tips…"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => fetchProductReview(it.label)}>
                        <Sparkles className="h-3 w-3" /> Review this
                      </Button>
                      {it.amazon_url && (
                        <a href={it.amazon_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
                          Open link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Read-only visual preview of the public card (uses actual PackingResultCard) */}
          {items.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Public preview</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gearItems.map((g, i) => (
                  <PackingResultCard key={i} item={g} onReview={(name) => fetchProductReview(name)} />
                ))}
              </div>
            </div>
          )}

          <Button onClick={addManualItem} variant="outline" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add item manually
          </Button>
        </>
      )}
    </div>
  );
};

export default FeaturedPackingListsManager;
