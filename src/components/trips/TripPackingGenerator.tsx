import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { detectCountry } from "@/lib/geo";

const TRIP_TYPES = [
  { id: "beach", label: "Beach / Resort" },
  { id: "city", label: "City / Walking" },
  { id: "cruise", label: "Cruise" },
  { id: "backpacking", label: "Hiking / Backpacking" },
  { id: "ski", label: "Ski / Snow" },
  { id: "camping", label: "Camping" },
  { id: "roadtrip", label: "Road trip" },
  { id: "business", label: "Business" },
];

const SEASONS = [
  { id: "summer", label: "Summer" },
  { id: "winter", label: "Winter" },
  { id: "spring", label: "Spring" },
  { id: "fall", label: "Fall" },
  { id: "rainy", label: "Rainy season" },
];

interface Props {
  tripId: string;
  destination: string | null;
  onDone: () => void;
}

const TripPackingGenerator = ({ tripId, destination, onDone }: Props) => {
  const { toast } = useToast();
  const [types, setTypes] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) => {
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const generate = async () => {
    if (types.length === 0) {
      toast({ title: "Pick at least one trip type", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const parts = [
        destination || "trip",
        types.map((t) => TRIP_TYPES.find((x) => x.id === t)?.label.toLowerCase()).join(" and "),
        seasons.map((s) => SEASONS.find((x) => x.id === s)?.label.toLowerCase()).join(" "),
      ].filter(Boolean);
      const query = parts.join(" ").trim();

      const { data, error } = await supabase.functions.invoke("travel-gear-intel", {
        body: { type: "must-haves", query, country: detectCountry() },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const items = (data?.data?.items ?? []) as any[];
      if (!items.length) throw new Error("No items returned");

      const sb = supabase as any;

      // Fetch existing packing labels to skip duplicates
      const { data: existing } = await sb
        .from("trip_packing_items").select("label").eq("trip_id", tripId);
      const existingLabels = new Set((existing ?? []).map((r: any) => String(r.label).toLowerCase()));

      const packingRows = items
        .filter((it) => !existingLabels.has(String(it.name).toLowerCase()))
        .map((it, i) => ({
          trip_id: tripId,
          label: it.name,
          checked: false,
          sort_order: existingLabels.size + i,
        }));

      const gearRows = items.map((it) => ({
        trip_id: tripId,
        product: {
          title: it.name,
          brand: it.brand,
          price: it.priceRange,
          image_url: it.imageUrl,
          affiliate_url: it.amazonUrl,
          category: it.category,
          reason: it.reason,
        },
      }));

      await Promise.all([
        packingRows.length ? sb.from("trip_packing_items").insert(packingRows) : Promise.resolve(),
        sb.from("trip_gear_items").insert(gearRows),
      ]);

      toast({
        title: "Added to your trip",
        description: `${packingRows.length} packing items and ${gearRows.length} gear picks.`,
      });
      setTypes([]);
      setSeasons([]);
      onDone();
    } catch (e) {
      toast({
        title: "Could not generate list",
        description: e instanceof Error ? e.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background border rounded-xl p-4 mb-4">
      <div className="flex items-start gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Generate packing list & gear ideas</p>
          <p className="text-xs text-muted-foreground">
            Pick the types of stops for this trip. We'll build a checklist and matching gear picks.
          </p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Trip types</p>
        <div className="flex flex-wrap gap-2">
          {TRIP_TYPES.map((t) => {
            const active = types.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(types, setTypes, t.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/50"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Season (optional)</p>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => {
            const active = seasons.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(seasons, setSeasons, s.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/50"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={generate} disabled={loading || types.length === 0} size="sm" className="gap-1.5">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Generating..." : "Generate list"}
      </Button>
    </div>
  );
};

export default TripPackingGenerator;
