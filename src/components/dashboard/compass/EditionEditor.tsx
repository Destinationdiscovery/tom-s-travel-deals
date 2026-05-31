import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Monitor, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props { editionId: string; onClose: () => void; }

const SECTION_STEPS: { key: string; label: string; step: number; field: string }[] = [
  { key: "trip", label: "Trip of the Week", step: 2, field: "itinerary_data" },
  { key: "flights", label: "Flight Deals", step: 6, field: "flight_deals_data" },
  { key: "hotel", label: "Honest Hotel Pick", step: 7, field: "hotel_data" },
  { key: "intel", label: "Travel Intel Briefing", step: 8, field: "travel_intel_data" },
];

const EditionEditor = ({ editionId, onClose }: Props) => {
  const { toast } = useToast();
  const [edition, setEdition] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [regen, setRegen] = useState<number | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [subject, setSubject] = useState("");
  const [fullText, setFullText] = useState("");

  const load = async () => {
    const { data } = await supabase.from("compass_editions" as any).select("*").eq("id", editionId).single();
    setEdition(data);
    setSubject((data as any)?.subject_line ?? (data as any)?.subject_line_options?.[0] ?? "");
    setFullText((data as any)?.full_text ?? "");
  };

  useEffect(() => { load(); }, [editionId]);

  if (!edition) return <div className="p-8 text-muted-foreground">Loading edition...</div>;

  const save = async (status?: string) => {
    setSaving(true);
    const patch: any = { subject_line: subject, full_text: fullText };
    if (status) patch.status = status;
    const { error } = await supabase.from("compass_editions" as any).update(patch).eq("id", editionId);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else { toast({ title: status === "ready" ? "Marked as ready" : "Draft saved" }); load(); }
  };

  const regenerate = async (step: number) => {
    setRegen(step);
    try {
      const { error } = await supabase.functions.invoke("generate-compass-edition", {
        body: { edition_id: editionId, only_step: step },
      });
      if (error) throw error;
      toast({ title: "Section regenerated" });
      await load();
    } catch (e: any) {
      toast({ title: "Regeneration failed", description: e?.message, variant: "destructive" });
    } finally {
      setRegen(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}><ArrowLeft className="h-4 w-4 mr-2" />Back to editions</Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => save()} disabled={saving}>Save draft</Button>
          <Button onClick={() => save("ready")} disabled={saving}>Mark as ready</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left panel */}
        <div className="space-y-4">
          <Card className="p-4 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Subject line</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            {edition.subject_line_options?.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Choose from generated options:</div>
                {edition.subject_line_options.map((opt: string, i: number) => (
                  <button key={i} onClick={() => setSubject(opt)} className="block w-full text-left text-sm p-2 rounded border hover:border-primary">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Full newsletter text</label>
            <Textarea value={fullText} onChange={(e) => setFullText(e.target.value)} rows={20} className="font-mono text-xs" />
          </Card>

          {SECTION_STEPS.map((s) => (
            <Card key={s.key} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{s.label}</div>
                <div className="text-xs text-muted-foreground">Last status: {edition.generation_metadata?.[`step_${s.step}_status`] ?? "unknown"}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => regenerate(s.step)} disabled={regen === s.step}>
                <RefreshCw className={`h-4 w-4 mr-2 ${regen === s.step ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </Card>
          ))}

          <Card className="p-4">
            <Button size="sm" variant="outline" onClick={() => regenerate(9)} disabled={regen === 9} className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${regen === 9 ? "animate-spin" : ""}`} />
              Regenerate full copy and HTML
            </Button>
          </Card>
        </div>

        {/* Right panel: live preview */}
        <div className="space-y-2 lg:sticky lg:top-4 lg:self-start">
          <div className="flex justify-end gap-1">
            <Button size="sm" variant={device === "desktop" ? "default" : "outline"} onClick={() => setDevice("desktop")}><Monitor className="h-4 w-4" /></Button>
            <Button size="sm" variant={device === "mobile" ? "default" : "outline"} onClick={() => setDevice("mobile")}><Smartphone className="h-4 w-4" /></Button>
          </div>
          <Card className="overflow-hidden bg-muted/30 p-4 flex justify-center">
            <iframe
              srcDoc={edition.full_html ?? "<p>No HTML yet</p>"}
              title="Live preview"
              style={{ width: device === "desktop" ? 600 : 375, height: "75vh", border: 0, background: "#fff" }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditionEditor;
