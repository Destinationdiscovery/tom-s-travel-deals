import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Luggage, Plug, Heart, Shield, Shirt, Umbrella, Package } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { GearItem } from "@/hooks/useGearIntel";

const categoryOrder = ["Packing", "Clothing", "Beach", "Tech", "Health"];

const categoryIcons: Record<string, React.ElementType> = {
  Packing: Luggage,
  Clothing: Shirt,
  Beach: Umbrella,
  Tech: Plug,
  Health: Heart,
  Safety: Shield,
  Comfort: Heart,
};

const slugifyKey = (s: string) =>
  (s || "list").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

interface Props {
  items: GearItem[];
  querySlug?: string;
}

const PackingChecklist = ({ items, querySlug }: Props) => {
  const storageKey = `rtg:packing-checklist:${slugifyKey(querySlug || "")}`;

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {}
  }, [checked, storageKey]);

  const grouped = useMemo(() => {
    const map = new Map<string, GearItem[]>();
    for (const it of items) {
      const cat = it.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(it);
    }
    const ordered: { category: string; items: GearItem[] }[] = [];
    for (const c of categoryOrder) if (map.has(c)) { ordered.push({ category: c, items: map.get(c)! }); map.delete(c); }
    for (const [c, arr] of map) ordered.push({ category: c, items: arr });
    return ordered;
  }, [items]);

  const total = items.length;
  const packed = items.filter((it) => checked[it.name]).length;

  const setAll = (v: boolean) => {
    const next: Record<string, boolean> = {};
    if (v) for (const it of items) next[it.name] = true;
    setChecked(next);
  };

  if (!items.length) return null;

  return (
    <div className="max-w-4xl mx-auto mb-8 animate-fade-in">
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border/50">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">Your Packing Checklist</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setAll(true)}
              className="text-primary hover:underline font-medium"
              type="button"
            >
              Check all
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => setAll(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              Uncheck all
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          {packed} of {total} items packed
        </p>

        <div className="space-y-5">
          {grouped.map(({ category, items: catItems }) => {
            const Icon = categoryIcons[category] || Package;
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">{category}</h4>
                  <span className="text-xs text-muted-foreground">
                    ({catItems.filter((i) => checked[i.name]).length}/{catItems.length})
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-1">
                  {catItems.map((it) => {
                    const id = `pack-${slugifyKey(it.name)}`;
                    const isChecked = !!checked[it.name];
                    return (
                      <li key={it.name} className="flex items-start gap-2.5">
                        <Checkbox
                          id={id}
                          checked={isChecked}
                          onCheckedChange={(v) =>
                            setChecked((prev) => ({ ...prev, [it.name]: !!v }))
                          }
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={id}
                          className={`text-sm cursor-pointer leading-snug ${
                            isChecked ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {it.name}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PackingChecklist;
