import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Globe, Copy, Loader2, EyeOff } from "lucide-react";

interface Trip {
  id: string;
  trip_name: string;
  destination: string | null;
  is_published?: boolean;
  public_slug?: string | null;
  list_in_gallery?: boolean;
  author_display_name?: string | null;
  cover_image_url?: string | null;
}

interface Props {
  trip: Trip;
  hotelCount: number;
  legCount: number;
  onUpdated: (patch: Partial<Trip>) => void;
}

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

const shortHash = () => Math.random().toString(36).slice(2, 6);

const PublishTripPanel = ({ trip, hotelCount, legCount, onUpdated }: Props) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const ready = !!trip.trip_name?.trim() && !!trip.destination?.trim() && (hotelCount > 0 || legCount > 0);

  const publish = async () => {
    if (!ready) return;
    setBusy(true);
    let slug = trip.public_slug;
    if (!slug) {
      const base = slugify(trip.trip_name) || "trip";
      // Try a few times to avoid unique-slug collisions.
      for (let i = 0; i < 5; i++) {
        const candidate = `${base}-${shortHash()}`;
        const { data: exists } = await (supabase as any)
          .from("trips").select("id").eq("public_slug", candidate).maybeSingle();
        if (!exists) { slug = candidate; break; }
      }
    }
    const patch = {
      is_published: true,
      published_at: new Date().toISOString(),
      public_slug: slug,
    };
    await (supabase as any).from("trips").update(patch).eq("id", trip.id);
    onUpdated(patch as Partial<Trip>);
    setBusy(false);
    toast({ title: "Trip published", description: "Your trip is now live and shareable." });
  };

  const unpublish = async () => {
    setBusy(true);
    await (supabase as any).from("trips").update({ is_published: false }).eq("id", trip.id);
    onUpdated({ is_published: false });
    setBusy(false);
    toast({ title: "Trip unpublished", description: "The public link is now inactive." });
  };

  const publicUrl = trip.public_slug ? `${window.location.origin}/trips/${trip.public_slug}` : "";

  const copy = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast({ title: "Link copied" });
  };

  const savePatch = async (patch: Partial<Trip>) => {
    await (supabase as any).from("trips").update(patch).eq("id", trip.id);
    onUpdated(patch);
  };

  return (
    <div className="bg-card rounded-2xl p-5 md:p-6 shadow-soft mb-6 border border-primary/10">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Share this trip
        </h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trip.is_published ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
          {trip.is_published ? "Published" : "Draft"}
        </span>
      </div>

      {!trip.is_published && (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            Publish your trip to get a public link and show it in the community gallery so other travelers can learn from it.
          </p>
          {!ready && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 mb-3">
              Before publishing, please add: {!trip.trip_name?.trim() && "a title, "}{!trip.destination?.trim() && "a destination, "}{hotelCount === 0 && legCount === 0 && "at least one hotel or stop, "}
            </div>
          )}
          <Button onClick={publish} disabled={!ready || busy} className="gap-1.5">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            Publish trip
          </Button>
        </>
      )}

      {trip.is_published && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Input readOnly value={publicUrl} className="text-sm font-mono" />
            <Button size="sm" variant="outline" onClick={copy} className="gap-1"><Copy className="h-4 w-4" /> Copy</Button>
            <Button size="sm" variant="outline" asChild><a href={publicUrl} target="_blank" rel="noopener noreferrer">Open</a></Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <label className="text-xs uppercase tracking-wide text-muted-foreground flex flex-col gap-1">
              Author name (public)
              <Input
                defaultValue={trip.author_display_name ?? ""}
                placeholder="How to credit you"
                onBlur={(e) => savePatch({ author_display_name: e.target.value.trim() || null })}
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-muted-foreground flex flex-col gap-1">
              Cover image URL (optional)
              <Input
                defaultValue={trip.cover_image_url ?? ""}
                placeholder="https://..."
                onBlur={(e) => savePatch({ cover_image_url: e.target.value.trim() || null })}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm mb-4">
            <Switch
              checked={trip.list_in_gallery !== false}
              onCheckedChange={(v) => savePatch({ list_in_gallery: v })}
            />
            List in the public gallery at /trips
          </label>

          <Button variant="outline" onClick={unpublish} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
            Unpublish
          </Button>
        </>
      )}
    </div>
  );
};

export default PublishTripPanel;
