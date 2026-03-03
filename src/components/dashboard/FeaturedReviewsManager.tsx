import { useState, useEffect, useCallback } from "react";
import { Star, Loader2, Pencil, RotateCcw, Save, X, Upload, Search, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import AIReviewResult from "@/components/AIReviewResult";

interface SlotData {
  property_name: string;
  location: string;
  slug: string;
  rating: number;
  summary: string;
  image_url: string;
  affiliate_url: string;
  sale_label: string;
  dbId: string | null;
}

const EMPTY_SLOT: SlotData = {
  property_name: "", location: "", slug: "", rating: 4.0, summary: "",
  image_url: "", affiliate_url: "", sale_label: "", dbId: null,
};

const FeaturedReviewsManager = () => {
  const [slots, setSlots] = useState<(SlotData | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ property_name: "", location: "", slug: "", rating: "", summary: "", affiliate_url: "", sale_label: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // Review search for admin
  const [searchQuery, setSearchQuery] = useState("");
  const { suggestions } = useSearchSuggestions(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { review, isLoading: reviewLoading, generateReview, clearReview } = useGenerateReview();

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const { data } = await supabase.from("featured_reviews").select("*").order("slot_number") as any;
    const merged: (SlotData | null)[] = [null, null, null, null];
    if (data) {
      data.forEach((row: any) => {
        const idx = row.slot_number - 1;
        if (idx >= 0 && idx < 4) {
          merged[idx] = {
            property_name: row.property_name,
            location: row.location || "",
            slug: row.slug,
            rating: Number(row.rating),
            summary: row.summary || "",
            image_url: row.image_url || "",
            affiliate_url: row.affiliate_url || "",
            sale_label: row.sale_label || "",
            dbId: row.id,
          };
        }
      });
    }
    setSlots(merged);
    setLoading(false);
  };

  const startEdit = (idx: number) => {
    const s = slots[idx] || EMPTY_SLOT;
    setForm({
      property_name: s.property_name, location: s.location, slug: s.slug,
      rating: String(s.rating), summary: s.summary,
      affiliate_url: s.affiliate_url, sale_label: s.sale_label,
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
    if (!form.property_name.trim() || !form.slug.trim()) {
      toast({ title: "Missing fields", description: "Property name and slug are required.", variant: "destructive" });
      return;
    }
    // Validate slug exists in cached_reviews
    const { data: match } = await supabase.from("cached_reviews").select("id").eq("slug", form.slug.trim()).maybeSingle();
    if (!match) {
      toast({ title: "Slug not found", description: "This slug doesn't match any cached review. The 'Read Review' link won't work.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let imageUrl = slots[slotIdx]?.image_url || "";
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const fileName = `review-slot-${slotIdx + 1}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("blog-images").upload(fileName, imageFile, { contentType: imageFile.type });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }

      const payload = {
        slot_number: slotIdx + 1,
        property_name: form.property_name.trim(),
        location: form.location.trim() || null,
        slug: form.slug.trim(),
        rating: Number(form.rating) || 4.0,
        summary: form.summary.trim() || null,
        image_url: imageUrl || null,
        affiliate_url: form.affiliate_url.trim() || null,
        sale_label: form.sale_label.trim() || null,
      };

      const existing = slots[slotIdx];
      if (existing?.dbId) {
        const { error } = await supabase.from("featured_reviews").update(payload as any).eq("id", existing.dbId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("featured_reviews").insert(payload as any);
        if (error) throw error;
      }

      toast({ title: "Saved!", description: `Slot ${slotIdx + 1} updated.` });
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
    const { error } = await supabase.from("featured_reviews").delete().eq("id", s.dbId) as any;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Removed", description: `Slot ${slotIdx + 1} cleared.` }); setEditingSlot(null); fetchSlots(); }
  };

  const handleSearchSelect = (name: string) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    clearReview();
    generateReview(name);
  };

  const addReviewToSlot = useCallback((slotIdx: number) => {
    if (!review) return;
    const rd = review.review_data as any;
    setForm({
      property_name: review.property_name || "",
      location: review.location || "",
      slug: review.slug || "",
      rating: String(rd?.overallRating || 4.0),
      summary: rd?.summary || "",
      affiliate_url: "",
      sale_label: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditingSlot(slotIdx);
  }, [review]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
        <MapPin className="h-6 w-6" /> Featured Reviews Manager
      </h1>
      <p className="text-sm text-muted-foreground">Manage the 4 review cards shown on the homepage. Search for a property to preview and add to a slot.</p>

      {/* Admin review search */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm font-semibold">Search & Preview a Property</Label>
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim().length >= 2) handleSearchSelect(searchQuery.trim()); }}
                placeholder="Search a hotel, resort, or destination..."
                className="pl-10"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-20 max-h-60 overflow-y-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onMouseDown={() => handleSearchSelect(s.name)}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground font-medium">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={() => searchQuery.trim().length >= 2 && handleSearchSelect(searchQuery.trim())} disabled={reviewLoading || searchQuery.trim().length < 2} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {reviewLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Review preview with "Add to Slot" buttons */}
          {(review || reviewLoading) && (
            <div className="mt-3">
              <AIReviewResult review={review} isLoading={reviewLoading} error={null} onNewReview={clearReview} />
              {review && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[0, 1, 2, 3].map((i) => (
                    <Button key={i} variant="outline" size="sm" onClick={() => addReviewToSlot(i)}>
                      Add to Slot {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4 Slot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {slots.map((slot, idx) => {
          const isEditing = editingSlot === idx;
          const isEmpty = !slot;

          return (
            <Card key={idx} className="overflow-hidden flex flex-col">
              {/* Image preview */}
              {(slot?.image_url || (isEditing && imagePreview)) && (
                <div className="relative">
                  <img
                    src={isEditing && imagePreview ? imagePreview : slot?.image_url}
                    alt={slot?.property_name || ""}
                    className="w-full h-40 object-cover"
                  />
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
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Slot {idx + 1}</p>
                    {isEmpty ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-sm text-muted-foreground mb-3">Empty slot</p>
                        <Button variant="outline" size="sm" onClick={() => startEdit(idx)}>
                          <Pencil className="h-3 w-3 mr-1" /> Add Review
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">{slot.property_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {slot.location && <p className="text-xs text-muted-foreground">{slot.location}</p>}
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-muted-foreground">{slot.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        {slot.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{slot.summary}</p>}
                        {slot.affiliate_url && <p className="text-xs text-primary truncate mt-1">{slot.affiliate_url}</p>}
                        {slot.sale_label && (
                          <p className="text-xs font-bold text-secondary mt-1">Sale: {slot.sale_label}</p>
                        )}
                        <div className="flex gap-2 mt-auto pt-3">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => startEdit(idx)}>
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleDelete(idx)}>
                            <RotateCcw className="h-3 w-3" /> Remove
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-primary">Editing Slot {idx + 1}</p>
                    <div>
                      <Label className="text-xs">Property Name *</Label>
                      <Input value={form.property_name} onChange={e => setForm(f => ({ ...f, property_name: e.target.value }))} className="h-8 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Location</Label>
                        <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="h-8 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Slug * <span className="font-normal text-muted-foreground">(must match cached review)</span></Label>
                        <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="h-8 text-xs" placeholder="e.g. hotel-riu-palace-costa-rica" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Rating</Label>
                        <Input type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="h-8 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Sale Label (e.g. 50% OFF)</Label>
                        <Input value={form.sale_label} onChange={e => setForm(f => ({ ...f, sale_label: e.target.value }))} className="h-8 text-xs" placeholder="Optional" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Summary</Label>
                      <textarea
                        value={form.summary}
                        onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                        className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Affiliate URL (exact link)</Label>
                      <Input value={form.affiliate_url} onChange={e => setForm(f => ({ ...f, affiliate_url: e.target.value }))} className="h-8 text-xs" placeholder="https://expedia.com/affiliate/..." />
                    </div>
                    <div>
                      <Label className="text-xs">Resort Image</Label>
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

export default FeaturedReviewsManager;
