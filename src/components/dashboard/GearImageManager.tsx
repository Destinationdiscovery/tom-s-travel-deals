import { useState, useEffect } from "react";
import { Trash2, Upload, Search, ImageIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GearImage {
  id: string;
  product_keyword: string;
  image_url: string;
  description: string | null;
  created_at: string;
}

const GearImageManager = () => {
  const [images, setImages] = useState<GearImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("gear_product_images").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setImages(data || []);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file || !keyword.trim()) {
      toast({ title: "Missing fields", description: "Please provide both a keyword and an image file.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${keyword.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("gear-images").upload(fileName, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from("gear-images").getPublicUrl(fileName);
      const { error: insertError } = await supabase.from("gear_product_images").insert({ product_keyword: keyword.trim().toLowerCase(), image_url: publicUrl.publicUrl, description: description.trim() || null } as any);
      if (insertError) throw insertError;
      toast({ title: "Uploaded!", description: `Image mapped to "${keyword.trim()}"` });
      setKeyword(""); setDescription(""); setFile(null);
      fetchImages();
    } catch (e: unknown) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleDelete = async (image: GearImage) => {
    try {
      const urlParts = image.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from("gear-images").remove([fileName]);
      const { error } = await supabase.from("gear_product_images").delete().eq("id", image.id);
      if (error) throw error;
      toast({ title: "Deleted", description: `Removed "${image.product_keyword}"` });
      setImages((prev) => prev.filter((i) => i.id !== image.id));
    } catch (e: unknown) {
      toast({ title: "Delete failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const filtered = images.filter((i) => i.product_keyword.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Gear Images</h1>

      {/* Upload Form */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Upload className="h-4 w-4" /> Upload New Image</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Product keyword (e.g. packing cubes)" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="flex-1" />
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer" />
            <Button onClick={handleUpload} disabled={uploading || !file || !keyword.trim()} className="gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
            </Button>
          </div>
          <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-3 min-h-[60px]" />
          {file && <p className="text-xs text-muted-foreground mt-2">Selected: {file.name}</p>}
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter by keyword..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-10" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{images.length === 0 ? "No images uploaded yet." : "No images match your filter."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="aspect-square bg-muted relative">
                <img src={image.image_url} alt={image.product_keyword} className="w-full h-full object-cover" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" onClick={() => handleDelete(image)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-foreground truncate">{image.product_keyword}</p>
                {image.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{image.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(image.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GearImageManager;
