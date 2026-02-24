import { useState, useEffect } from "react";
import { Star, Loader2, Pencil, RotateCcw, Save, X, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import dealTemptation from "@/assets/deal-temptation-cancun.png";
import dealRiu from "@/assets/deal-riu-plaza-toronto.png";
import dealOutrigger from "@/assets/deal-outrigger-honua-kai.png";
import dealFlights from "@/assets/deal-flights-clean.jpg";
import dealGarza from "@/assets/deal-garza-blanca-clean.jpg";
import dealPhuket from "@/assets/deal-phuket-clean.jpg";

interface SlotData {
  name: string;
  location: string;
  affiliateUrl: string;
  originalPrice: number;
  salePrice: number;
  originalPriceWeekly: number | null;
  salePriceWeekly: number | null;
  rating: number;
  imageUrl: string;
  expiresAt: string | null;
  isCustom: boolean;
  dbId: string | null;
}

const DEFAULTS: Omit<SlotData, "isCustom" | "dbId">[] = [
  { name: "Temptation Cancun Resort All Inclusive — Adults Only", location: "Cancun, Mexico", affiliateUrl: "https://expedia.com/affiliate/sCSkKSm", originalPrice: 389, salePrice: 249, originalPriceWeekly: null, salePriceWeekly: null, rating: 4.3, imageUrl: dealTemptation, expiresAt: "2026-04-30" },
  { name: "Hotel Riu Plaza Toronto", location: "Toronto, Canada", affiliateUrl: "https://expedia.com/affiliate/4XUFIIR", originalPrice: 279, salePrice: 179, originalPriceWeekly: null, salePriceWeekly: null, rating: 4.1, imageUrl: dealRiu, expiresAt: "2026-03-31" },
  { name: "OUTRIGGER Honua Kai Resort & Spa", location: "Lahaina, Hawaii", affiliateUrl: "https://expedia.com/affiliate/N2Bmgth", originalPrice: 499, salePrice: 329, originalPriceWeekly: null, salePriceWeekly: null, rating: 4.6, imageUrl: dealOutrigger, expiresAt: "2026-05-15" },
  { name: "Save on Eligible Flights to Top Destinations", location: "Multiple Destinations", affiliateUrl: "https://expedia.com/affiliate/bPJ1N3S", originalPrice: 650, salePrice: 399, originalPriceWeekly: null, salePriceWeekly: null, rating: 4.0, imageUrl: dealFlights, expiresAt: "2026-04-15" },
  { name: "Garza Blanca Resort & Spa Cancun", location: "Punta Sam, Mexico", affiliateUrl: "https://www.hotels.com/affiliate/gUxIS8k", originalPrice: 459, salePrice: 299, originalPriceWeekly: null, salePriceWeekly: null, rating: 4.5, imageUrl: dealGarza, expiresAt: "2026-05-01" },
  { name: "Phuket Moonlit Bay Seaview Resort & Spa", location: "Ratsada, Thailand", affiliateUrl: "https://expedia.com/affiliate/av1oUFB", originalPrice: 199, salePrice: 119, originalPriceWeekly: null, salePriceWeekly: null, rating: 4.2, imageUrl: dealPhuket, expiresAt: "2026-04-20" },
];

const FeaturedDealsManager = () => {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [form, setForm] = useState({ name: "", location: "", affiliateUrl: "", originalPrice: "", salePrice: "", originalPriceWeekly: "", salePriceWeekly: "", rating: "", expiresAt: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => { fetchAndMerge(); }, []);

  const fetchAndMerge = async () => {
    setLoading(true);
    const { data } = await supabase.from("featured_deals").select("*").order("slot_number") as any;
    const merged: SlotData[] = DEFAULTS.map((d, i) => ({ ...d, isCustom: false, dbId: null }));
    if (data) {
      data.forEach((row: any) => {
        const idx = row.slot_number - 1;
        if (idx >= 0 && idx < 6) {
          merged[idx] = {
            name: row.name,
            location: row.location,
            affiliateUrl: row.affiliate_url,
            originalPrice: Number(row.original_price),
            salePrice: Number(row.sale_price),
            originalPriceWeekly: row.original_price_weekly ? Number(row.original_price_weekly) : null,
            salePriceWeekly: row.sale_price_weekly ? Number(row.sale_price_weekly) : null,
            rating: Number(row.rating),
            imageUrl: row.image_url,
            expiresAt: row.expires_at ? row.expires_at.split("T")[0] : null,
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
    setForm({
      name: s.name, location: s.location, affiliateUrl: s.affiliateUrl,
      originalPrice: String(s.originalPrice), salePrice: String(s.salePrice),
      originalPriceWeekly: s.originalPriceWeekly ? String(s.originalPriceWeekly) : "",
      salePriceWeekly: s.salePriceWeekly ? String(s.salePriceWeekly) : "",
      rating: String(s.rating), expiresAt: s.expiresAt || "",
    });
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
        const fileName = `deal-slot-${slotIdx + 1}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("blog-images").upload(fileName, imageFile, { contentType: imageFile.type });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }

      const op = Number(form.originalPrice);
      const sp = Number(form.salePrice);
      const slotNumber = slotIdx + 1;

      const opw = form.originalPriceWeekly ? Number(form.originalPriceWeekly) : null;
      const spw = form.salePriceWeekly ? Number(form.salePriceWeekly) : null;

      const payload = {
        slot_number: slotNumber,
        name: form.name.trim(),
        location: form.location.trim(),
        affiliate_url: form.affiliateUrl.trim(),
        original_price: op,
        sale_price: sp,
        original_label: `$${op}/night`,
        sale_label: `$${sp}/night`,
        original_price_weekly: opw,
        sale_price_weekly: spw,
        original_label_weekly: opw ? `$${opw.toLocaleString()}/week` : null,
        sale_label_weekly: spw ? `$${spw.toLocaleString()}/week` : null,
        rating: Number(form.rating),
        image_url: imageUrl,
        image_position: "center",
        expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      const existing = slots[slotIdx];
      if (existing.isCustom && existing.dbId) {
        const { error } = await supabase.from("featured_deals").update(payload as any).eq("id", existing.dbId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("featured_deals").insert(payload as any);
        if (error) throw error;
      }

      toast({ title: "Saved!", description: `Slot ${slotNumber} updated.` });
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
    const { error } = await supabase.from("featured_deals").delete().eq("id", s.dbId) as any;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Reverted", description: `Slot ${slotIdx + 1} back to default.` }); setEditingSlot(null); fetchAndMerge(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
        <Star className="h-6 w-6" /> Featured Deals Manager
      </h1>
      <p className="text-sm text-muted-foreground">Click Edit on any card to change it.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {slots.map((slot, idx) => {
          const isEditing = editingSlot === idx;
          const hasNightly = slot.originalPrice > 0 && slot.salePrice > 0;
          const hasWeekly = (slot.originalPriceWeekly ?? 0) > 0 && (slot.salePriceWeekly ?? 0) > 0;
          const original = hasNightly ? slot.originalPrice : hasWeekly ? slot.originalPriceWeekly! : 1;
          const sale = hasNightly ? slot.salePrice : hasWeekly ? slot.salePriceWeekly! : 0;
          const pct = Math.round((1 - sale / original) * 100);

          return (
            <Card key={idx} className="overflow-hidden flex flex-col">
              {/* Card preview */}
              <div className="relative">
                <span className="absolute top-2 left-2 z-10 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{pct}% OFF</span>
                <img src={isEditing && imagePreview ? imagePreview : slot.imageUrl} alt={slot.name} className="w-full h-40 object-cover" />
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                {!isEditing ? (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Slot {idx + 1}</p>
                    <p className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">{slot.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{slot.location}</p>
                    {slot.originalPrice > 0 && slot.salePrice > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground line-through">${slot.originalPrice}</span>
                        <span className="text-sm font-bold text-secondary">${slot.salePrice}/night</span>
                      </div>
                    )}
                    {slot.originalPriceWeekly && slot.salePriceWeekly && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground line-through">${slot.originalPriceWeekly.toLocaleString()}</span>
                        <span className="text-sm font-bold text-secondary">${slot.salePriceWeekly.toLocaleString()}/week</span>
                      </div>
                    )}
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
                  /* Inline edit form */
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-primary">Editing Slot {idx + 1}</p>
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">Location</Label>
                      <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">Affiliate URL</Label>
                      <Input value={form.affiliateUrl} onChange={e => setForm(f => ({ ...f, affiliateUrl: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Original $/night</Label>
                        <Input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className="h-8 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Sale $/night</Label>
                        <Input type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Original $/week</Label>
                        <Input type="number" value={form.originalPriceWeekly} onChange={e => setForm(f => ({ ...f, originalPriceWeekly: e.target.value }))} className="h-8 text-xs" placeholder="Optional" />
                      </div>
                      <div>
                        <Label className="text-xs">Sale $/week</Label>
                        <Input type="number" value={form.salePriceWeekly} onChange={e => setForm(f => ({ ...f, salePriceWeekly: e.target.value }))} className="h-8 text-xs" placeholder="Optional" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Rating</Label>
                        <Input type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="h-8 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Expires</Label>
                        <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="h-8 text-xs" />
                      </div>
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

export default FeaturedDealsManager;
