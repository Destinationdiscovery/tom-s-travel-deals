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
import { Trash2, Upload, Video, Loader2, Plus } from "lucide-react";
import { deriveEmbedUrl, type SocialPlatform } from "@/lib/socialEmbed";

interface Row {
  id: string;
  platform: SocialPlatform;
  video_url: string;
  embed_url: string | null;
  profile_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  review_slug: string | null;
  sort_order: number;
  is_active: boolean;
}

const DEFAULT_PROFILE_URLS: Record<SocialPlatform, string> = {
  tiktok: "https://www.tiktok.com/@reviewthengo.com?_r=1&_t=ZS-98DgT1BJ6uo",
  instagram: "",
  youtube: "",
};

const emptyForm = {
  platform: "tiktok" as SocialPlatform,
  video_url: "",
  profile_url: DEFAULT_PROFILE_URLS.tiktok,
  thumbnail_url: "",
  caption: "",
  review_slug: "",
  sort_order: 0,
  is_active: true,
};

const SocialVideosManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("social_videos")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const handleThumbUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `social-thumbs/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
      setForm((f) => ({ ...f, thumbnail_url: pub.publicUrl }));
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const addVideo = async () => {
    if (!form.video_url.trim()) {
      toast({ title: "Video URL required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const embed_url = deriveEmbedUrl(form.platform, form.video_url.trim());
    const payload = {
      platform: form.platform,
      video_url: form.video_url.trim(),
      embed_url,
      profile_url: form.profile_url.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      caption: form.caption.trim() || null,
      review_slug: form.review_slug.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    const { error } = await (supabase as any).from("social_videos").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Video added" });
    setForm({ ...emptyForm });
    fetchRows();
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await (supabase as any).from("social_videos").update({ is_active }).eq("id", id);
    fetchRows();
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    const { error } = await (supabase as any).from("social_videos").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else fetchRows();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" /> Social Videos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Add TikTok, Instagram, and YouTube videos that appear beside your reviews.</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold">Add a video</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v as SocialPlatform }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Video URL</Label>
              <Input placeholder="https://www.tiktok.com/@you/video/..." value={form.video_url}
                onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} />
            </div>
            <div>
              <Label>Your profile URL</Label>
              <Input placeholder="https://www.tiktok.com/@yourhandle" value={form.profile_url}
                onChange={(e) => setForm((f) => ({ ...f, profile_url: e.target.value }))} />
            </div>
            <div>
              <Label>Attach to review slug (optional)</Label>
              <Input placeholder="e.g. hotel-metropole-sorrento" value={form.review_slug}
                onChange={(e) => setForm((f) => ({ ...f, review_slug: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Caption</Label>
              <Textarea rows={2} value={form.caption}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Thumbnail</Label>
              <div className="flex items-start gap-3 mt-1">
                {form.thumbnail_url ? (
                  <img src={form.thumbnail_url} alt="thumb" className="w-24 h-32 object-cover rounded-lg border" />
                ) : (
                  <div className="w-24 h-32 border border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground">No thumb</div>
                )}
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload image"}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleThumbUpload(e.target.files[0])} />
                  </label>
                  <Input placeholder="…or paste image URL" value={form.thumbnail_url}
                    onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))} />
                </div>
              </div>
            </div>
            <div>
              <Label>Sort order (higher shows first)</Label>
              <Input type="number" value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <Button onClick={addVideo} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add video
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">Your videos ({rows.length})</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No videos yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex gap-3">
                    {r.thumbnail_url ? (
                      <img src={r.thumbnail_url} alt="" className="w-20 h-28 object-cover rounded-md border" />
                    ) : (
                      <div className="w-20 h-28 bg-muted rounded-md flex items-center justify-center">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase text-muted-foreground">{r.platform}</p>
                      <p className="text-sm line-clamp-2">{r.caption || r.video_url}</p>
                      {r.review_slug && <p className="text-xs text-primary mt-1 truncate">→ {r.review_slug}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Switch checked={r.is_active} onCheckedChange={(v) => toggleActive(r.id, v)} />
                      <span className="text-xs text-muted-foreground">{r.is_active ? "Active" : "Hidden"}</span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteRow(r.id)}>
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

export default SocialVideosManager;
