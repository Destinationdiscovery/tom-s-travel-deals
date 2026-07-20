import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Star, Loader2, Plus, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface Props {
  tripHotelId: string;
  propertyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

interface ReviewRow {
  id?: string;
  overall_rating: number | null;
  verdict: string;
  pros: string[];
  cons: string[];
  notes: string;
  stayed_from: string | null;
  stayed_to: string | null;
}

const empty: ReviewRow = {
  overall_rating: null, verdict: "", pros: [], cons: [], notes: "",
  stayed_from: null, stayed_to: null,
};

const HotelReviewForm = ({ tripHotelId, propertyName, open, onOpenChange, onSaved }: Props) => {
  const { user } = useAuth();
  const [row, setRow] = useState<ReviewRow>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("trip_hotel_reviews").select("*").eq("trip_hotel_id", tripHotelId).maybeSingle();
      setRow(data ? { ...empty, ...data } : empty);
      setLoading(false);
    })();
  }, [open, tripHotelId]);

  const addPro = () => {
    const v = proInput.trim();
    if (!v) return;
    setRow({ ...row, pros: [...row.pros, v] });
    setProInput("");
  };
  const addCon = () => {
    const v = conInput.trim();
    if (!v) return;
    setRow({ ...row, cons: [...row.cons, v] });
    setConInput("");
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      trip_hotel_id: tripHotelId,
      user_id: user.id,
      overall_rating: row.overall_rating,
      verdict: row.verdict || null,
      pros: row.pros,
      cons: row.cons,
      notes: row.notes || null,
      stayed_from: row.stayed_from,
      stayed_to: row.stayed_to,
    };
    await (supabase as any).from("trip_hotel_reviews").upsert(payload, { onConflict: "trip_hotel_id" });
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your review of {propertyName}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Your rating</label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRow({ ...row, overall_rating: n })}
                    className="p-1"
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`h-6 w-6 ${row.overall_rating && n <= row.overall_rating ? "text-accent fill-accent" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
                {row.overall_rating != null && (
                  <button type="button" onClick={() => setRow({ ...row, overall_rating: null })} className="ml-2 text-xs text-muted-foreground hover:text-destructive">Clear</button>
                )}
              </div>
            </div>

            {/* Verdict */}
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">One-line verdict</label>
              <Input
                value={row.verdict}
                onChange={(e) => setRow({ ...row, verdict: e.target.value })}
                placeholder="e.g. Great location, tired rooms"
                maxLength={140}
              />
            </div>

            {/* Stay dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Stayed from</label>
                <Input type="date" value={row.stayed_from ?? ""} onChange={(e) => setRow({ ...row, stayed_from: e.target.value || null })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Stayed to</label>
                <Input type="date" value={row.stayed_to ?? ""} onChange={(e) => setRow({ ...row, stayed_to: e.target.value || null })} />
              </div>
            </div>

            {/* Pros */}
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Pros</label>
              <div className="flex gap-2 mt-1">
                <Input value={proInput} onChange={(e) => setProInput(e.target.value)} placeholder="Add a pro" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPro(); } }} />
                <Button type="button" size="sm" variant="outline" onClick={addPro}><Plus className="h-4 w-4" /></Button>
              </div>
              {row.pros.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {row.pros.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {p}
                      <button type="button" onClick={() => setRow({ ...row, pros: row.pros.filter((_, j) => j !== i) })}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cons */}
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Cons</label>
              <div className="flex gap-2 mt-1">
                <Input value={conInput} onChange={(e) => setConInput(e.target.value)} placeholder="Add a con" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCon(); } }} />
                <Button type="button" size="sm" variant="outline" onClick={addCon}><Plus className="h-4 w-4" /></Button>
              </div>
              {row.cons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {row.cons.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                      {c}
                      <button type="button" onClick={() => setRow({ ...row, cons: row.cons.filter((_, j) => j !== i) })}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Notes</label>
              <Textarea
                value={row.notes}
                onChange={(e) => setRow({ ...row, notes: e.target.value })}
                placeholder="Anything else worth telling other travelers?"
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Save review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HotelReviewForm;
