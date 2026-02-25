import { useState, useEffect } from "react";
import { Loader2, Pencil, RotateCcw, Save, X, Luggage } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import gearWaterHammock from "@/assets/gear-water-hammock-main.jpg";
import gearPhoneHolder from "@/assets/gear-phone-holder-main.jpg";
import gearPackingCubes from "@/assets/gear-packing-cubes-main.jpg";
import gearThermacell from "@/assets/gear-thermacell-main.jpg";

interface SlotData {
  title: string;
  description: string;
  price: string;
  affiliateUrl: string;
  imageUrl: string;
  isCustom: boolean;
  dbId: string | null;
}

const DEFAULTS: Omit<SlotData, "isCustom" | "dbId">[] = [
  { title: "Beach Essentials", description: "Sunscreen, beach towels, waterproof gear", price: "$15 - $40", affiliateUrl: "", imageUrl: gearWaterHammock },
  { title: "Tech & Gadgets", description: "Adapters, chargers, travel tech", price: "$10 - $35", affiliateUrl: "", imageUrl: gearPhoneHolder },
  { title: "Packing & Organization", description: "Cubes, bags, and compression sacks", price: "$20 - $45", affiliateUrl: "", imageUrl: gearPackingCubes },
  { title: "Outdoor & Adventure", description: "Bug protection, hiking, and comfort gear", price: "$15 - $50", affiliateUrl: "", imageUrl: gearThermacell },
];

const FeaturedGearManager = () => {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", affiliateUrl: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => { fetchAndMerge(); }, []);

  const fetchAndMerge = async () => {
    setLoading(true);
    const { data } = await supabase.from("featured_gear_cards").select("*").order("slot_number") as any;
    const merged: SlotData[] = DEFAULTS.map((d) => ({ ...d, isCustom: false, dbId: null }));
    if (data) {
      data.forEach((row: any) => {
        const idx = row.slot_number - 1;
        if (idx >= 0 && idx < 4) {
          merged[idx] = {
            title: row.title,
            description: row.description || "",
            price: row.price || "",
            affiliateUrl: row.affiliate_url || "",
            imageUrl: row.image_url || DEFAULTS[idx].imageUrl,
            isCustom: true,
            dbId: row.id,
          };
        }
      });
    }
    setSlots(merged);
    setLoading(false);
  };

  const startEdit = (idx: number) => {
    const s = slots[idx];
    setForm({ title: s.title, description: s.description, price: s.price, affiliateUrl: s.affiliateUrl });
    setImageFile(null);
    setImagePreview("");
    setEditingSlot(idx);
  };

  const cancelEdit = () => { setEditingSlot(null); setImageFile(null); setImagePreview(""); };

  const handleImageFile = (file: File | null) => {
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview("");
  };

  const handleSave = async (slotIdx: number) => {
    setSaving(true);
    try {
      let imageUrl = slots[slotIdx].imageUrl;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const fileName = `gear-slot-${slotIdx + 1}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("blog-images").upload(fileName, imageFile, { contentType: imageFile.type });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }

      const payload = {
        slot_number: slotIdx + 1,
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price.trim(),
        affiliate_url: form.affiliateUrl.trim(),
        image_url: imageUrl,
      };

      const existing = slots[slotIdx];
      if (existing.isCustom && existing.dbId) {
        const { error } = await supabase.from("featured_gear_cards").update(payload as any).eq("id", existing.dbId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("featured_gear_cards").insert(payload as any);
        if (error) throw error;
      }

      toast({ title: "Saved!", description: `Slot ${slotIdx + 1} updated.` });
      setEditingSlot(null);
      fetchAndMerge();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleRevert = async (slotIdx: number) => {
    const s = slots[slotIdx];
    if (!s.isCustom || !s.dbId) return;
    const { error } = await supabase.from("featured_gear_cards").delete().eq("id", s.dbId) as any;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Reverted", description: `Slot ${slotIdx + 1} back to default.` }); setEditingSlot(null); fetchAndMerge(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
        <Luggage className="h-6 w-6" /> Featured Gear Manager
      </h1>
      <p className="text-sm text-muted-foreground">Click Edit on any card to update it. Cards link to your Amazon affiliate URLs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {slots.map((slot, idx) => {
          const isEditing = editingSlot === idx;
          return (
            <Card key={idx} className="overflow-hidden flex flex-col">
              <div className="relative">
                <img src={isEditing && imagePreview ? imagePreview : slot.imageUrl} alt={slot.title} className="w-full aspect-[16/10] object-contain bg-muted" />
                {slot.price && (
                  <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{slot.price}</span>
                )}
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                {!isEditing ? (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Slot {idx + 1} {slot.isCustom && <span className="text-primary">(Custom)</span>}</p>
                    <p className="font-semibold text-foreground text-sm">{slot.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{slot.description}</p>
                    {slot.affiliateUrl && <p className="text-xs text-primary mt-1 truncate">{slot.affiliateUrl}</p>}
                    <div className="flex gap-2 mt-auto pt-3">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => startEdit(idx)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      {slot.isCustom && (
                        <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleRevert(idx)}>
                          <RotateCcw className="h-3 w-3" /> Revert
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-primary">Editing Slot {idx + 1}</p>
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">Price (e.g. "$29.99" or "$20 - $30")</Label>
                      <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">Affiliate URL</Label>
                      <Input value={form.affiliateUrl} onChange={e => setForm(f => ({ ...f, affiliateUrl: e.target.value }))} className="h-8 text-xs" placeholder="https://amazon.com/..." />
                    </div>
                    <div>
                      <Label className="text-xs">New Image (optional)</Label>
                      <input type="file" accept="image/*" onChange={e => handleImageFile(e.target.files?.[0] || null)} className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer file:text-xs" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="gap-1.5" onClick={() => handleSave(idx)} disabled={saving}>
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={cancelEdit}>
                        <X className="h-3 w-3" /> Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedGearManager;
