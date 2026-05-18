import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, FileDown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveTrip } from "@/hooks/useActiveTrip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SaveMomentPrompt from "@/components/trips/SaveMomentPrompt";
import {
  applyPayloadToTrip,
  stashPendingSave,
  type ToolType,
} from "@/lib/pendingToolSave";

interface Props {
  toolType: ToolType;
  label: string;
  destination?: string;
  payload: any;
  onExportPdf?: () => void;
  onCopy?: () => string | Promise<string>;
}

interface Trip { id: string; slug: string; trip_name: string; }

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) ||
  `trip-${Date.now()}`;

const ToolSaveBar = ({ toolType, label, destination, payload, onExportPdf, onCopy }: Props) => {
  const { user } = useAuth();
  const activeTrip = useActiveTrip();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [newName, setNewName] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pickerOpen || !user) return;
    setLoadingTrips(true);
    (async () => {
      const { data } = await (supabase as any)
        .from("trips")
        .select("id, slug, trip_name")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      setTrips((data ?? []) as Trip[]);
      setLoadingTrips(false);
    })();
  }, [pickerOpen, user]);

  const saveToTrip = async (trip: Trip) => {
    setSaving(true);
    try {
      await applyPayloadToTrip(trip.id, toolType, payload);
      await (supabase as any).from("trips").update({ updated_at: new Date().toISOString() }).eq("id", trip.id);
      toast({
        title: `Added to "${trip.trip_name}"`,
        description: "Open the trip to organize it.",
      });
    } catch (e: any) {
      toast({ title: "Could not save", description: e?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
      setPickerOpen(false);
    }
  };

  const createTripAndSave = async () => {
    if (!user || !newName.trim()) return;
    setSaving(true);
    try {
      const slug = slugify(newName) + "-" + Math.random().toString(36).slice(2, 6);
      const { data, error } = await (supabase as any)
        .from("trips")
        .insert({ user_id: user.id, trip_name: newName.trim(), slug, destination: destination ?? null })
        .select("id, slug, trip_name")
        .single();
      if (error || !data) throw error;
      await applyPayloadToTrip(data.id, toolType, payload);
      toast({ title: `Trip "${data.trip_name}" created` });
      setPickerOpen(false);
      navigate(`/my-trips/${data.slug}`);
    } catch (e: any) {
      toast({ title: "Could not create trip", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openAuthDialog = () => {
    stashPendingSave({ toolType, payload, destination, label });
    setAuthDialogOpen(true);
  };

  const handleSaveToActive = async () => {
    if (!user || !activeTrip) return;
    setSaving(true);
    try {
      const { data } = await (supabase as any)
        .from("trips")
        .select("id, slug, trip_name")
        .eq("user_id", user.id)
        .eq("slug", activeTrip.slug)
        .maybeSingle();
      if (!data) throw new Error("Trip not found");
      await applyPayloadToTrip(data.id, toolType, payload);
      await (supabase as any).from("trips").update({ updated_at: new Date().toISOString() }).eq("id", data.id);
      toast({ title: `Added to "${data.trip_name}"`, description: "Open the trip to organize it." });
    } catch (e: any) {
      toast({ title: "Could not save", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      const text = onCopy ? await onCopy() : label;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (onExportPdf) onExportPdf();
    else window.print();
  };

  const primaryButton = (() => {
    if (!user) {
      return (
        <Button onClick={openAuthDialog} disabled={saving} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold w-full sm:w-auto">
          Save this to a trip plan
        </Button>
      );
    }
    if (activeTrip) {
      return (
        <Button onClick={handleSaveToActive} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Add to {activeTrip.name}
        </Button>
      );
    }
    return (
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <Button disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Save to a trip
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="center" className="w-80">
          <div className="space-y-3">
            {loadingTrips ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : trips.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Your trips</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {trips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => saveToTrip(t)}
                      className="w-full text-left px-3 py-2 rounded-lg border bg-background hover:bg-muted transition-colors text-sm font-medium"
                    >
                      {t.trip_name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trips yet, create one below.</p>
            )}
            <form
              onSubmit={(e) => { e.preventDefault(); void createTripAndSave(); }}
              className="border-t pt-3"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Or new trip</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Trip name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={60}
                />
                <Button type="submit" disabled={!newName.trim() || saving}>Create</Button>
              </div>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    );
  })();

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        role="region"
        aria-label="Save and export results"
      >
        <div className="container mx-auto px-4 py-3">
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <p className="flex-1 min-w-0 truncate text-sm text-foreground font-medium">{label}</p>
            <div className="shrink-0">{primaryButton}</div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                type="button"
              >
                <FileDown className="h-4 w-4" /> Export PDF
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                type="button"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                Copy to clipboard
              </button>
            </div>
          </div>
          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            <p className="text-sm font-medium text-foreground truncate">{label}</p>
            <div className="[&_button]:w-full">{primaryButton}</div>
            <div className="flex items-center justify-center gap-5 pt-1">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                type="button"
              >
                <FileDown className="h-3.5 w-3.5" /> Export PDF
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                type="button"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Save this to a trip plan</DialogTitle>
          </DialogHeader>
          <SaveMomentPrompt
            hotelName={label}
            destination={destination}
            onDismiss={() => setAuthDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ToolSaveBar;
