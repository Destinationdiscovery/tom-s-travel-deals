import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Loader2, Plus, Trash2, Upload, ChevronDown, ChevronRight } from "lucide-react";

interface List {
  id: string; slug: string; title: string; description: string | null;
  cover_image_url: string | null; season: string | null; trip_types: string[] | null;
  source: string; source_trip_id: string | null; is_published: boolean;
  published_at: string | null; sort_order: number;
}
interface Item {
  id: string; list_id: string; label: string; category: string | null;
  quantity: number | null; notes: string | null; amazon_url: string | null;
  image_url: string | null; sort_order: number;
}
interface TripOpt { id: string; trip_name: string }

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);

const emptyForm = { title: "", description: "", season: "", trip_types_csv: "", cover_image_url: "" };

const FeaturedPackingListsManager = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [items, setItems] = useState<Record<string, Item[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [trips, setTrips] = useState<TripOpt[]>([]);
  const [pickedTrip, setPickedTrip] = useState<string>("");

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("featured_packing_lists").select("*").order("sort_order", { ascending: false }).order("created_at", { ascending: false });
    setLists((data as List[]) ?? []);
    setLoading(false);
  };
  const fetchItems = async (listId: string) => {
    const { data } = await (supabase as any).from("featured_packing_list_items").select("*").eq("list_id", listId).order("sort_order", { ascending: true });
    setItems((prev) => ({ ...prev, [listId]: (data as Item[]) ?? [] }));
  };
  const fetchTrips = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any).from("trips").select("id, trip_name").eq("user_id", user.id).order("created_at", { ascending: false });
    setTrips((data as TripOpt[]) ?? []);
  };

  useEffect(() => { fetchAll(); fetchTrips(); }, []);

  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `packing-lists/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image_url: pub.publicUrl }));
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const createList = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    setSaving(true);
    const slug = `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const trip_types = form.trip_types_csv.split(",").map((s) => s.trim()).filter(Boolean);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await (supabase as any).from("featured_packing_lists").insert({
      slug, title: form.title.trim(), description: form.description.trim() || null,
      cover_image_url: form.cover_image_url || null, season: form.season || null,
      trip_types, source: "curated", created_by: user?.id,
    });
    setSaving(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "List created" });
    setForm({ ...emptyForm });
    fetchAll();
  };

  const publishFromTrip = async () => {
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
    toast({ title: "Published from trip" });
    fetchAll();
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
    fetchAll();
  };

  const addItem = async (listId: string) => {
    const label = prompt("Item name?");
    if (!label) return;
    const amazon_url = prompt("Amazon URL (optional)?") || null;
    await (supabase as any).from("featured_packing_list_items").insert({
      list_id: listId, label, amazon_url, sort_order: (items[listId]?.length ?? 0),
    });
    fetchItems(listId);
  };
  const removeItem = async (listId: string, id: string) => {
    await (supabase as any).from("featured_packing_list_items").delete().eq("id", id);
    fetchItems(listId);
  };

  const toggleExpand = (id: string) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
    if (!items[id]) fetchItems(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> Featured Packing Lists
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Curate reusable packing lists or publish one from an existing trip.</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold">Create curated list</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Season (summer, winter…)</Label><Input value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Trip types (comma separated: beach, city, hiking)</Label><Input value={form.trip_types_csv} onChange={(e) => setForm((f) => ({ ...f, trip_types_csv: e.target.value }))} /></div>
            <div className="md:col-span-2">
              <Label>Cover image</Label>
              <div className="flex items-start gap-3 mt-1">
                {form.cover_image_url ? <img src={form.cover_image_url} className="w-24 h-16 object-cover rounded border" /> : <div className="w-24 h-16 border border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">No image</div>}
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading…" : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                  </label>
                  <Input placeholder="…or paste URL" value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
          <Button onClick={createList} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create list
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold">Publish from an existing trip</h2>
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
            <Button onClick={publishFromTrip} disabled={!pickedTrip || saving}>Publish from trip</Button>
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
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleExpand(l.id)} className="mt-1">
                      {expanded[l.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {l.cover_image_url && <img src={l.cover_image_url} className="w-16 h-16 object-cover rounded border" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{l.title}</p>
                      <p className="text-xs text-muted-foreground">/{l.slug} · {l.source}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={l.is_published} onCheckedChange={() => togglePublish(l)} />
                      <span className="text-xs">{l.is_published ? "Live" : "Draft"}</span>
                      <Button size="icon" variant="ghost" onClick={() => deleteList(l.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {expanded[l.id] && (
                    <div className="mt-4 border-t pt-3 space-y-2">
                      {(items[l.id] ?? []).map((it) => (
                        <div key={it.id} className="flex items-center gap-2 text-sm">
                          <span className="flex-1">{it.label}{it.category ? ` · ${it.category}` : ""}</span>
                          {it.amazon_url && <a href={it.amazon_url} target="_blank" rel="noopener" className="text-xs text-primary">Amazon</a>}
                          <Button size="icon" variant="ghost" onClick={() => removeItem(l.id, it.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addItem(l.id)} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add item</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedPackingListsManager;
