import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Edition {
  id: string;
  edition_number: number;
  subject_line: string | null;
  destination: string | null;
  issue_date: string;
  full_html: string | null;
}

interface Props {
  triggerVariant?: "button" | "link" | "ghost";
  triggerLabel?: string;
  className?: string;
}

const CompassPreviewModal = ({ triggerVariant = "ghost", triggerLabel = "Preview the latest edition", className = "" }: Props) => {
  const [open, setOpen] = useState(false);
  const [edition, setEdition] = useState<Edition | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    (supabase as any)
      .from("compass_editions")
      .select("id, edition_number, subject_line, destination, issue_date, full_html")
      .eq("status", "sent")
      .order("issue_date", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) setEdition(data);
        setLoading(false);
        setLoaded(true);
      });
  }, [open, loaded]);

  const Trigger = () => {
    if (triggerVariant === "link") {
      return (
        <button type="button" className={`text-sm text-primary underline underline-offset-2 hover:opacity-80 ${className}`}>
          {triggerLabel}
        </button>
      );
    }
    return (
      <Button
        type="button"
        variant={triggerVariant === "button" ? "default" : "ghost"}
        size="sm"
        className={className}
      >
        <Eye className="h-4 w-4 mr-1.5" />
        {triggerLabel}
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trigger />
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="font-display">
            {edition
              ? `The Compass No. ${edition.edition_number}${edition.destination ? `: ${edition.destination}` : ""}`
              : "The Compass: Latest Edition"}
          </DialogTitle>
          {edition?.subject_line && (
            <p className="text-sm text-muted-foreground mt-1">{edition.subject_line}</p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-muted/30">
          {loading && (
            <div className="flex items-center justify-center h-[60vh] text-muted-foreground text-sm">
              Loading the latest edition...
            </div>
          )}
          {!loading && !edition && (
            <div className="flex items-center justify-center h-[60vh] text-muted-foreground text-sm px-6 text-center">
              The first edition hasn't been sent yet. Subscribe and you'll get it the moment it lands.
            </div>
          )}
          {!loading && edition?.full_html && (
            <iframe
              title="Compass edition preview"
              srcDoc={edition.full_html}
              sandbox="allow-same-origin"
              className="w-full h-[70vh] bg-white border-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompassPreviewModal;
