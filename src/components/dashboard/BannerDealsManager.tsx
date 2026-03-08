import { useState, useEffect } from "react";
import { Loader2, Pencil, RotateCcw, Save, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SlotData {
  image_url: string;
  affiliate_url: string;
  sale_label: string;
  alt_text: string;
  dbId: string | null;
}

const DEFAULTS: SlotData[] = [
  { image_url: "", affiliate_url: "https://expedia.com/affiliate/7ymxnWK", sale_label: "", alt_text: "Expedia's Annual Vacation Sale", dbId: null },
  { image_url: "", affiliate_url: "https://www.hotels.com/affiliate/FvZz7Rm", sale_label: "", alt_text: "Hotels.com Big Spring Sale", dbId: null },
];

const BannerDealsManager = () => {
  const [slots, setSlots] = useState<(SlotData | null)[]>([null, null]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ affiliate_url: "", sale_label: "", alt_text: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const { data } = await supabase.from("banner_deals").select("*").order("slot_number") as any;
    const merged: (SlotData | null)[] = [null, null];
    if (data) {
      data.forEach((row: any) => {
        const idx = row.slot_number - 1;
        if (idx >= 0 && idx < 2) {
          merged[idx] = {
            image_url: row.image_url,
            affiliate_url: row.affiliate_url,
            sale_label: row.sale_label || "",
            alt_text: row.alt_text || "",
            dbId: row.id,
          };
        }
      });
    }
    setSlots(merged);
    setLoading(false);
  };

  const startEdit = (idx: number) => {
    const s = slots[idx] || DEFAULTS[idx];
    setForm({ affiliate_url: s.affiliate_url, sale_label: s.sale_label, alt_text: s.alt_text });
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
    const existingImage = slots[slotIdx]?.image_url || "";
    if (!imageFile && !existingImage) {
      toast({ title: "Image required", description: "Please upload a banner image.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let imageUrl = existingImage;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const fileName = `banner-slot-${slotIdx + 1}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("blog-images").upload(fileName, imageFile, { contentType: imageFile.type });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }

      const payload = {
        slot_number: slotIdx + 1,
        image_url: imageUrl,
        affiliate_url: form.affiliate_url.trim() || DEFAULTS[slotIdx].affiliate_url,
        sale_label: form.sale_label.trim() || null,
        alt_text: form.alt_text.trim() || null,
      };

      const existing = slots[slotIdx];
      if (existing?.dbId) {
        const { error } = await supabase.from("banner_deals").update(payload as any).eq("id", existing.dbId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banner_deals").insert(payload as any);
        if (error) throw error;
      }

      toast({ title: "Saved!", description: `Banner ${slotIdx + 1} updated.` });
      setEditingSlot(null);
      fetchSlots();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (slotIdx: number) => {
    const s = slots[slotIdx];
    if (!s?.dbId) return;
    const { error } = await supabase.from("banner_deals").delete().eq("id", s.dbId) as any;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Reset", description: `Banner ${slotIdx + 1} reset to default.` }); setEditingSlot(null); fetchSlots(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const labels = ["Left Banner (Slot 1)", "Right Banner (Slot 2)"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <ImageIcon className="h-6 w-6 text-violet-400" />
          </div>
          Banner Deals Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage the 2 promotional banners at the top of the Travel Deals section.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[0, 1].map((idx) => {
          const slot = slots[idx];
          const isEditing = editingSlot === idx;
          const displayImage = isEditing && imagePreview ? imagePreview : slot?.image_url;

          return (
            <Card key={idx} className="overflow-hidden flex flex-col border-l-4 border-l-violet-500/50">
              {displayImage && (
                <div className="relative">
                  <img src={displayImage} alt={slot?.alt_text || labels[idx]} className="w-full h-32 object-cover" />
                  {slot?.sale_label && !isEditing && (
                    <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {slot.sale_label}
                    </span>
                  )}
                </div>
              )}

              <CardContent className="p-4 flex-1 flex flex-col">
                {!isEditing ? (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{labels[idx]}</p>
                    {!slot ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Using default banner</p>
                        <Button variant="outline" size="sm" onClick={() => startEdit(idx)}>
                          <Pencil className="h-3 w-3 mr-1" /> Customize
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-primary truncate">{slot.affiliate_url}</p>
                        {slot.sale_label && <p className="text-xs font-bold text-secondary mt-1">Label: {slot.sale_label}</p>}
                        {slot.alt_text && <p className="text-xs text-muted-foreground mt-1">Alt: {slot.alt_text}</p>}
                        <div className="flex gap-2 mt-auto pt-3">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => startEdit(idx)}>
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleDelete(idx)}>
                            <RotateCcw className="h-3 w-3" /> Reset
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-primary">Editing {labels[idx]}</p>
                    <div>
                      <Label className="text-xs">Banner Image *</Label>
                      <input type="file" accept="image/*" onChange={e => handleImageFile(e.target.files?.[0] || null)} className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer file:text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">Affiliate URL</Label>
                      <Input value={form.affiliate_url} onChange={e => setForm(f => ({ ...f, affiliate_url: e.target.value }))} className="h-8 text-xs" placeholder="https://expedia.com/affiliate/..." />
                    </div>
                    <div>
                      <Label className="text-xs">Sale Label (badge overlay)</Label>
                      <Input value={form.sale_label} onChange={e => setForm(f => ({ ...f, sale_label: e.target.value }))} className="h-8 text-xs" placeholder='e.g. "Save 40%"' />
                    </div>
                    <div>
                      <Label className="text-xs">Alt Text</Label>
                      <Input value={form.alt_text} onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))} className="h-8 text-xs" placeholder="Describe the banner" />
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

export default BannerDealsManager;
