import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Luggage, Loader2, Plus, Trash2, Upload, Star, ChevronDown, ChevronRight, Eye, Save } from "lucide-react";

interface Review {
  id: string; slug: string; product_name: string; brand: string | null;
  category: string | null; hero_image_url: string | null; rating: number | null;
  pros: string[] | null; cons: string[] | null; notes: string | null;
  used_on: string | null; affiliate_url: string | null; price_range: string | null;
  is_published: boolean; published_at: string | null;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);

const emptyForm = {
  product_name: "", brand: "", category: "", hero_image_url: "",
  rating: "5", pros_csv: "", cons_csv: "", notes: "", used_on: "",
  affiliate_url: "", price_range: "",
};

type EditDraft = {
  product_name: string; brand: string; category: string; hero_image_url: string;
  rating: string; pros_csv: string; cons_csv: string; notes: string; used_on: string;
  affiliate_url: string; price_range: string;
};

const toDraft = (r: Review): EditDraft => ({
  product_name: r.product_name ?? "",
  brand: r.brand ?? "",
  category: r.category ?? "",
  hero_image_url: r.hero_image_url ?? "",
  rating: r.rating != null ? String(r.rating) : "",
  pros_csv: (r.pros ?? []).join("\n"),
  cons_csv: (r.cons ?? []).join("\n"),
  notes: r.notes ?? "",
  used_on: r.used_on ?? "",
  affiliate_url: r.affiliate_url ?? "",
  price_range: r.price_range ?? "",
});

const FeaturedGearReviewsManager = () => {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [edits, setEdits] = useState<Record<string, EditDraft>>({});
  const [uploadingRow, setUploadingRow] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("featured_gear_reviews").select("*").order("created_at", { ascending: false });
    setRows((data as Review[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const uploadHero = async (file: File, onUrl: (url: string) => void, setBusy: (b: boolean) => void) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `gear-reviews/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
      onUrl(pub.publicUrl);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const createReview = async () => {
    if (!form.product_name.trim()) { toast({ title: "Product name required", variant: "destructive" }); return; }
    setSaving(true);
    const slug = `${slugify(form.product_name)}-${Math.random().toString(36).slice(2, 6)}`;
    const pros = form.pros_csv.split("\n").map((s) => s.trim()).filter(Boolean);
    const cons = form.cons_csv.split("\n").map((s) => s.trim()).filter(Boolean);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: created, error } = await (supabase as any).from("featured_gear_reviews").insert({
      slug, product_name: form.product_name.trim(), brand: form.brand.trim() || null,
      category: form.category.trim() || null, hero_image_url: form.hero_image_url || null,
      rating: form.rating ? Number(form.rating) : null,
      pros, cons, notes: form.notes.trim() || null,
      used_on: form.used_on.trim() || null,
      affiliate_url: form.affiliate_url.trim() || null,
      price_range: form.price_range.trim() || null,
      created_by: user?.id,
    }).select("id").single();
    setSaving(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Draft created — preview & edit below before publishing" });
    setForm({ ...emptyForm });
    await fetchRows();
    if (created?.id) setExpanded((e) => ({ ...e, [created.id]: true }));
  };

  const togglePublish = async (r: Review) => {
    await (supabase as any).from("featured_gear_reviews").update({
      is_published: !r.is_published,
      published_at: !r.is_published ? new Date().toISOString() : r.published_at,
    }).eq("id", r.id);
    fetchRows();
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete?")) return;
    await (supabase as any).from("featured_gear_reviews").delete().eq("id", id);
    fetchRows();
  };

  const startEdit = (r: Review) => {
    setEdits((e) => ({ ...e, [r.id]: toDraft(r) }));
    setExpanded((e) => ({ ...e, [r.id]: true }));
  };
  const cancelEdit = (id: string) => {
    setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
  };
  const saveEdit = async (id: string) => {
    const d = edits[id];
    if (!d) return;
    const pros = d.pros_csv.split("\n").map((s) => s.trim()).filter(Boolean);
    const cons = d.cons_csv.split("\n").map((s) => s.trim()).filter(Boolean);
    const { error } = await (supabase as any).from("featured_gear_reviews").update({
      product_name: d.product_name.trim(),
      brand: d.brand.trim() || null,
      category: d.category.trim() || null,
      hero_image_url: d.hero_image_url || null,
      rating: d.rating ? Number(d.rating) : null,
      pros, cons, notes: d.notes.trim() || null,
      used_on: d.used_on.trim() || null,
      affiliate_url: d.affiliate_url.trim() || null,
      price_range: d.price_range.trim() || null,
    }).eq("id", id);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Review updated" });
    cancelEdit(id);
    fetchRows();
  };

  const toggleExpand = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Luggage className="h-6 w-6 text-primary" /> Featured Gear Reviews
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create as draft, preview & edit, then toggle Live when ready.</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold">Add a gear review</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Product name</Label><Input value={form.product_name} onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))} /></div>
            <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} /></div>
            <div><Label>Category (backpack, shoes, tech…)</Label><Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></div>
            <div><Label>Rating (0-5, step 0.5)</Label><Input type="number" step="0.5" min="0" max="5" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} /></div>
            <div><Label>Price range ($, $$, $$$)</Label><Input value={form.price_range} onChange={(e) => setForm((f) => ({ ...f, price_range: e.target.value }))} /></div>
            <div><Label>Used on (e.g. Italy 2026, Japan 2025)</Label><Input value={form.used_on} onChange={(e) => setForm((f) => ({ ...f, used_on: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Affiliate URL</Label><Input value={form.affiliate_url} onChange={(e) => setForm((f) => ({ ...f, affiliate_url: e.target.value }))} /></div>
            <div className="md:col-span-2">
              <Label>Hero image</Label>
              <div className="flex items-start gap-3 mt-1">
                {form.hero_image_url ? <img src={form.hero_image_url} className="w-24 h-24 object-cover rounded border" /> : <div className="w-24 h-24 border border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">No image</div>}
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading…" : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0], (url) => setForm((f) => ({ ...f, hero_image_url: url })), setUploading)} />
                  </label>
                  <Input placeholder="…or paste URL" value={form.hero_image_url} onChange={(e) => setForm((f) => ({ ...f, hero_image_url: e.target.value }))} />
                </div>
              </div>
            </div>
            <div><Label>Pros (one per line)</Label><Textarea rows={4} value={form.pros_csv} onChange={(e) => setForm((f) => ({ ...f, pros_csv: e.target.value }))} /></div>
            <div><Label>Cons (one per line)</Label><Textarea rows={4} value={form.cons_csv} onChange={(e) => setForm((f) => ({ ...f, cons_csv: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Notes / long-form review</Label><Textarea rows={6} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <Button onClick={createReview} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create as draft
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">All gear reviews ({rows.length})</h2>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const d = edits[r.id];
              return (
                <Card key={r.id}>
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleExpand(r.id)} className="mt-1">
                        {expanded[r.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {r.hero_image_url ? <img src={r.hero_image_url} className="w-16 h-16 object-cover rounded border" /> : <div className="w-16 h-16 bg-muted rounded flex items-center justify-center"><Luggage className="h-5 w-5 text-muted-foreground" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{r.product_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.brand} · {r.category}</p>
                        <div className="flex items-center gap-1 text-xs mt-1">
                          {r.rating != null && <><Star className="h-3.5 w-3.5 fill-primary text-primary" /> {r.rating}</>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.is_published && (
                          <a href={`/gear-reviews/${r.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <Eye className="h-3.5 w-3.5" /> View
                          </a>
                        )}
                        <Switch checked={r.is_published} onCheckedChange={() => togglePublish(r)} />
                        <span className="text-xs">{r.is_published ? "Live" : "Draft"}</span>
                        <Button size="icon" variant="ghost" onClick={() => deleteRow(r.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {expanded[r.id] && (
                      <div className="border-t pt-3 space-y-3">
                        {!d ? (
                          <>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                              {r.used_on && <div><span className="text-muted-foreground">Used on: </span>{r.used_on}</div>}
                              {r.price_range && <div><span className="text-muted-foreground">Price: </span>{r.price_range}</div>}
                              {r.affiliate_url && <div className="md:col-span-2 truncate"><span className="text-muted-foreground">Affiliate: </span><a href={r.affiliate_url} target="_blank" rel="noopener" className="text-primary hover:underline">{r.affiliate_url}</a></div>}
                            </div>
                            {(r.pros?.length || r.cons?.length) ? (
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Pros</p>
                                  <ul className="list-disc pl-5 space-y-0.5">{(r.pros ?? []).map((p, i) => <li key={i}>{p}</li>)}</ul>
                                </div>
                                <div>
                                  <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Cons</p>
                                  <ul className="list-disc pl-5 space-y-0.5">{(r.cons ?? []).map((p, i) => <li key={i}>{p}</li>)}</ul>
                                </div>
                              </div>
                            ) : null}
                            {r.notes && <p className="text-sm whitespace-pre-wrap">{r.notes}</p>}
                            <Button size="sm" variant="outline" onClick={() => startEdit(r)}>Edit</Button>
                          </>
                        ) : (
                          <>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div><Label className="text-xs">Product name</Label><Input value={d.product_name} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, product_name: e.target.value } }))} /></div>
                              <div><Label className="text-xs">Brand</Label><Input value={d.brand} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, brand: e.target.value } }))} /></div>
                              <div><Label className="text-xs">Category</Label><Input value={d.category} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, category: e.target.value } }))} /></div>
                              <div><Label className="text-xs">Rating</Label><Input type="number" step="0.5" min="0" max="5" value={d.rating} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, rating: e.target.value } }))} /></div>
                              <div><Label className="text-xs">Price range</Label><Input value={d.price_range} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, price_range: e.target.value } }))} /></div>
                              <div><Label className="text-xs">Used on</Label><Input value={d.used_on} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, used_on: e.target.value } }))} /></div>
                              <div className="md:col-span-2"><Label className="text-xs">Affiliate URL</Label><Input value={d.affiliate_url} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, affiliate_url: e.target.value } }))} /></div>
                              <div className="md:col-span-2">
                                <Label className="text-xs">Hero image</Label>
                                <div className="flex items-start gap-3 mt-1">
                                  {d.hero_image_url ? <img src={d.hero_image_url} className="w-20 h-20 object-cover rounded border" /> : <div className="w-20 h-20 border border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">No image</div>}
                                  <div className="flex-1 space-y-2">
                                    <label className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md">
                                      {uploadingRow === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                      {uploadingRow === r.id ? "Uploading…" : "Upload"}
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0], (url) => setEdits((s) => ({ ...s, [r.id]: { ...d, hero_image_url: url } })), (b) => setUploadingRow(b ? r.id : null))} />
                                    </label>
                                    <Input placeholder="…or paste URL" value={d.hero_image_url} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, hero_image_url: e.target.value } }))} />
                                  </div>
                                </div>
                              </div>
                              <div><Label className="text-xs">Pros (one per line)</Label><Textarea rows={4} value={d.pros_csv} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, pros_csv: e.target.value } }))} /></div>
                              <div><Label className="text-xs">Cons (one per line)</Label><Textarea rows={4} value={d.cons_csv} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, cons_csv: e.target.value } }))} /></div>
                              <div className="md:col-span-2"><Label className="text-xs">Notes / long-form review</Label><Textarea rows={6} value={d.notes} onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...d, notes: e.target.value } }))} /></div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEdit(r.id)} className="gap-1"><Save className="h-3.5 w-3.5" /> Save changes</Button>
                              <Button size="sm" variant="ghost" onClick={() => cancelEdit(r.id)}>Cancel</Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedGearReviewsManager;
