import { useState, useEffect } from "react";
import { Star, Upload, Loader2, Replace, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FeaturedDeal {
  id: string;
  slot_number: number;
  image_url: string;
  name: string;
  location: string;
  affiliate_url: string;
  original_price: number;
  sale_price: number;
  original_label: string;
  sale_label: string;
  rating: number;
  image_position: string | null;
  expires_at: string | null;
}

const FeaturedDealsManager = () => {
  const [deals, setDeals] = useState<FeaturedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [slotNumber, setSlotNumber] = useState(1);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [rating, setRating] = useState("4.0");
  const [expiresAt, setExpiresAt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => { fetchDeals(); }, []);

  const fetchDeals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("featured_deals")
      .select("*")
      .order("slot_number", { ascending: true }) as any;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setDeals(data || []);
    setLoading(false);
  };

  const handleImageFile = (file: File | null) => {
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview("");
  };

  const resetForm = () => {
    setName(""); setLocation(""); setAffiliateUrl("");
    setOriginalPrice(""); setSalePrice(""); setRating("4.0");
    setExpiresAt(""); setImageFile(null); setImagePreview("");
  };

  const handleReplace = async () => {
    if (!name.trim() || !affiliateUrl.trim() || !originalPrice || !salePrice) {
      toast({ title: "Missing fields", description: "Name, affiliate URL, and prices are required.", variant: "destructive" });
      return;
    }
    if (!imageFile && !deals.find(d => d.slot_number === slotNumber)) {
      toast({ title: "Image required", description: "Please upload a resort image.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let imageUrl = deals.find(d => d.slot_number === slotNumber)?.image_url || "";
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const fileName = `deal-slot-${slotNumber}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("blog-images").upload(fileName, imageFile, { contentType: imageFile.type });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }

      const op = Number(originalPrice);
      const sp = Number(salePrice);

      const payload = {
        slot_number: slotNumber,
        name: name.trim(),
        location: location.trim(),
        affiliate_url: affiliateUrl.trim(),
        original_price: op,
        sale_price: sp,
        original_label: `$${op}/night`,
        sale_label: `$${sp}/night`,
        rating: Number(rating),
        image_url: imageUrl,
        image_position: "center",
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      // Upsert by slot_number
      const existing = deals.find(d => d.slot_number === slotNumber);
      if (existing) {
        const { error } = await supabase.from("featured_deals").update(payload as any).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("featured_deals").insert(payload as any);
        if (error) throw error;
      }

      toast({ title: "Done!", description: `Slot ${slotNumber} has been updated.` });
      resetForm();
      fetchDeals();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (deal: FeaturedDeal) => {
    const { error } = await supabase.from("featured_deals").delete().eq("id", deal.id) as any;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Removed", description: `Slot ${deal.slot_number} reverted to default.` }); fetchDeals(); }
  };

  const loadSlot = (deal: FeaturedDeal) => {
    setSlotNumber(deal.slot_number);
    setName(deal.name);
    setLocation(deal.location);
    setAffiliateUrl(deal.affiliate_url);
    setOriginalPrice(String(deal.original_price));
    setSalePrice(String(deal.sale_price));
    setRating(String(deal.rating));
    setExpiresAt(deal.expires_at ? deal.expires_at.split("T")[0] : "");
    setImagePreview(deal.image_url);
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
        <Star className="h-6 w-6" /> Featured Deals Manager
      </h1>

      {/* Current Slots */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">Current Custom Deals ({deals.length}/6 slots)</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : deals.length === 0 ? (
          <p className="text-muted-foreground text-sm">No custom deals set. All 6 slots use the default hardcoded deals.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map(deal => (
              <Card key={deal.id} className="overflow-hidden">
                <img src={deal.image_url} alt={deal.name} className="w-full h-32 object-cover" />
                <CardContent className="p-3">
                  <p className="text-xs font-bold text-primary">Slot {deal.slot_number}</p>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{deal.name}</p>
                  <p className="text-xs text-muted-foreground">{deal.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground line-through">${deal.original_price}</span>
                    <span className="text-sm font-bold text-emerald-500">${deal.sale_price}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => loadSlot(deal)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(deal)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Replace Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Replace className="h-4 w-4" /> Replace a Deal Card</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Slot Number (1-6)</Label>
              <select value={slotNumber} onChange={e => setSlotNumber(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Slot {n}</option>)}
              </select>
            </div>
            <div>
              <Label>Resort / Deal Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sandals Royal Barbados" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Barbados" />
            </div>
            <div>
              <Label>Affiliate URL</Label>
              <Input value={affiliateUrl} onChange={e => setAffiliateUrl(e.target.value)} placeholder="https://expedia.com/affiliate/..." />
            </div>
            <div>
              <Label>Original Price ($/night)</Label>
              <Input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="499" />
            </div>
            <div>
              <Label>Sale Price ($/night)</Label>
              <Input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="329" />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <Input type="number" step="0.1" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} />
            </div>
            <div>
              <Label>Expires (optional)</Label>
              <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Resort Image</Label>
            <input type="file" accept="image/*" onChange={e => handleImageFile(e.target.files?.[0] || null)} className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer" />
          </div>
          {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />}

          <Button onClick={handleReplace} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Replace className="h-4 w-4" />}
            Replace Card
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturedDealsManager;
