import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Luggage, Plug, Heart, Shield, Shirt, Umbrella, Package, Plus, X, StickyNote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { GearItem } from "@/hooks/useGearIntel";

const categoryOrder = ["Packing", "Clothing", "Beach", "Tech", "Health", "Safety", "Comfort", "Accessories", "Toiletries"];

const categoryIcons: Record<string, React.ElementType> = {
  Packing: Luggage,
  Clothing: Shirt,
  Beach: Umbrella,
  Tech: Plug,
  Health: Heart,
  Safety: Shield,
  Comfort: Heart,
  Accessories: Package,
  Toiletries: Package,
};

const slugifyKey = (s: string) =>
  (s || "list").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

interface CustomItem { id: string; name: string; category: string; checked: boolean }

interface Props {
  items: GearItem[];
  querySlug?: string;
}

const PackingChecklist = ({ items, querySlug }: Props) => {
  const storageKey = `rtg:packing-checklist:${slugifyKey(querySlug || "")}`;
  const customKey = `rtg:packing-custom:${slugifyKey(querySlug || "")}`;
  const notesKey = `rtg:packing-notes:${slugifyKey(querySlug || "")}`;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [newInputs, setNewInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    try { setChecked(JSON.parse(localStorage.getItem(storageKey) || "{}")); } catch { setChecked({}); }
    try { setCustomItems(JSON.parse(localStorage.getItem(customKey) || "[]")); } catch { setCustomItems([]); }
    try { setNotes(localStorage.getItem(notesKey) || ""); } catch { setNotes(""); }
  }, [storageKey, customKey, notesKey]);

  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(checked)); } catch {} }, [checked, storageKey]);
  useEffect(() => { try { localStorage.setItem(customKey, JSON.stringify(customItems)); } catch {} }, [customItems, customKey]);
  useEffect(() => { try { localStorage.setItem(notesKey, notes); } catch {} }, [notes, notesKey]);

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; custom: boolean; id: string }[]>();
    for (const it of items) {
      const cat = it.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ name: it.name, custom: false, id: it.name });
    }
    for (const c of customItems) {
      const cat = c.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ name: c.name, custom: true, id: `custom:${c.id}` });
    }
    const ordered: { category: string; rows: { name: string; custom: boolean; id: string }[] }[] = [];
    for (const c of categoryOrder) if (map.has(c)) { ordered.push({ category: c, rows: map.get(c)! }); map.delete(c); }
    for (const [c, arr] of map) ordered.push({ category: c, rows: arr });
    return ordered;
  }, [items, customItems]);

  const total = items.length + customItems.length;
  const packed =
    items.filter((it) => checked[it.name]).length +
    customItems.filter((c) => c.checked).length;

  const setAll = (v: boolean) => {
    const next: Record<string, boolean> = {};
    if (v) for (const it of items) next[it.name] = true;
    setChecked(next);
    setCustomItems((prev) => prev.map((c) => ({ ...c, checked: v })));
  };

  const addCustom = (category: string) => {
    const name = (newInputs[category] || "").trim();
    if (!name) return;
    setCustomItems((prev) => [...prev, { id: crypto.randomUUID(), name, category, checked: false }]);
    setNewInputs((prev) => ({ ...prev, [category]: "" }));
  };

  const removeCustom = (id: string) => setCustomItems((prev) => prev.filter((c) => c.id !== id));

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
            <button onClick={() => setAll(true)} className="text-primary hover:underline font-medium" type="button">Check all</button>
            <span className="text-border">|</span>
            <button onClick={() => setAll(false)} className="text-muted-foreground hover:text-foreground transition-colors" type="button">Uncheck all</button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-5">{packed} of {total} items packed</p>

        <div className="space-y-5">
          {grouped.map(({ category, rows }) => {
            const Icon = categoryIcons[category] || Package;
            const catChecked = rows.filter((r) => r.custom
              ? customItems.find((c) => `custom:${c.id}` === r.id)?.checked
              : checked[r.name]).length;
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">{category}</h4>
                  <span className="text-xs text-muted-foreground">({catChecked}/{rows.length})</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-1">
                  {rows.map((r) => {
                    const id = `pack-${slugifyKey(r.id)}`;
                    const isChecked = r.custom
                      ? !!customItems.find((c) => `custom:${c.id}` === r.id)?.checked
                      : !!checked[r.name];
                    const toggle = (v: boolean) => {
                      if (r.custom) {
                        setCustomItems((prev) => prev.map((c) => `custom:${c.id}` === r.id ? { ...c, checked: v } : c));
                      } else {
                        setChecked((prev) => ({ ...prev, [r.name]: v }));
                      }
                    };
                    return (
                      <li key={r.id} className="flex items-start gap-2.5">
                        <Checkbox id={id} checked={isChecked} onCheckedChange={(v) => toggle(!!v)} className="mt-0.5" />
                        <label htmlFor={id} className={`text-sm cursor-pointer leading-snug flex-1 ${r.custom ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-foreground"}`}>
                          {r.name}
                          {r.custom && <span className="ml-1.5 text-[9px] uppercase font-bold tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">Added</span>}
                        </label>
                        {r.custom && (
                          <button
                            onClick={() => removeCustom(r.id.replace(/^custom:/, ""))}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                            type="button"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="flex gap-2 mt-2 pl-1">
                  <Input
                    value={newInputs[category] || ""}
                    onChange={(e) => setNewInputs((prev) => ({ ...prev, [category]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addCustom(category)}
                    placeholder={`Add to ${category.toLowerCase()}…`}
                    className="h-8 text-sm"
                  />
                  <Button onClick={() => addCustom(category)} size="sm" variant="secondary" className="h-8 gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="h-3.5 w-3.5 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">Your notes</h4>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you want to remember. Saved on this device."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default PackingChecklist;
