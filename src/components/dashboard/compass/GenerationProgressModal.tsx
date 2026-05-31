import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, AlertCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  "Selecting destination...",
  "Generating trip itinerary...",
  "Running safety analysis...",
  "Fetching live currency data...",
  "Finding best time to visit...",
  "Sourcing current flight deals...",
  "Selecting hotel pick...",
  "Generating travel intel briefing...",
  "Writing newsletter copy...",
  "Rendering HTML edition...",
  "Saving to dashboard...",
];

type StepState = "pending" | "running" | "ok" | "failed";

interface Props {
  runId: string | null;
  editionId: string | null;
  editionNumber: number | null;
  open: boolean;
  onClose: () => void;
  onView: (editionId: string) => void;
  onEdit: (editionId: string) => void;
}

const GenerationProgressModal = ({ runId, editionId, editionNumber, open, onClose, onView, onEdit }: Props) => {
  const [states, setStates] = useState<StepState[]>(() => Array(11).fill("pending"));
  const [errors, setErrors] = useState<Record<number, string>>({});
  const allDone = states[10] === "ok" || states[10] === "failed";

  useEffect(() => {
    if (!runId || !open) return;
    setStates(Array(11).fill("pending"));
    setErrors({});

    const channel = supabase
      .channel(`compass:gen:${runId}`)
      .on("broadcast", { event: "step" }, ({ payload }) => {
        const { step, status, error } = payload as { step: number; status: StepState; error?: string };
        setStates((prev) => {
          const next = [...prev];
          next[step - 1] = status;
          return next;
        });
        if (error) setErrors((p) => ({ ...p, [step]: error }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [runId, open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && allDone && onClose()}>
      <DialogContent className="max-w-lg">
        <h2 className="font-display text-xl font-bold mb-1">
          {allDone ? `Edition #${editionNumber} ready` : `Generating Edition #${editionNumber ?? "..."}`}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {allDone ? "All sections generated. Review and edit below." : "This usually takes 60 to 90 seconds."}
        </p>
        <ol className="space-y-2">
          {STEPS.map((label, i) => {
            const s = states[i];
            return (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5">
                  {s === "ok" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {s === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {s === "failed" && <AlertCircle className="h-4 w-4 text-amber-600" />}
                  {s === "pending" && <Circle className="h-4 w-4 text-muted-foreground/40" />}
                </span>
                <span className={s === "failed" ? "text-amber-700" : s === "ok" ? "text-foreground" : "text-muted-foreground"}>
                  {label}
                  {errors[i + 1] && <span className="block text-xs text-amber-600 mt-0.5">{errors[i + 1]} (used fallback)</span>}
                </span>
              </li>
            );
          })}
        </ol>
        {allDone && editionId && (
          <div className="flex gap-2 mt-6">
            <Button onClick={() => onEdit(editionId)} className="flex-1">Edit edition</Button>
            <Button variant="outline" onClick={() => onView(editionId)} className="flex-1">Preview</Button>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerationProgressModal;
