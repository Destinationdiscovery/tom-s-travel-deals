import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2, Pin, PinOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AgentNote {
  id: string;
  content: string;
  color: string;
  is_pinned: boolean;
  created_at: string;
}

const COLOR_OPTIONS = [
  { value: "default", bg: "bg-card border-border" },
  { value: "yellow", bg: "bg-amber-500/10 border-amber-500/30" },
  { value: "blue", bg: "bg-sky-500/10 border-sky-500/30" },
  { value: "green", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { value: "red", bg: "bg-rose-500/10 border-rose-500/30" },
];

const AgentPinboard = () => {
  const [notes, setNotes] = useState<AgentNote[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newColor, setNewColor] = useState("default");
  const [showAdd, setShowAdd] = useState(false);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("agent_notes" as any)
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);
    setNotes((data as any[]) || []);
  };

  useEffect(() => { fetchNotes(); }, []);

  const addNote = async () => {
    if (!newContent.trim()) return;
    const { error } = await supabase.from("agent_notes" as any).insert({
      content: newContent.trim(),
      color: newColor,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewContent("");
      setNewColor("default");
      setShowAdd(false);
      fetchNotes();
    }
  };

  const togglePin = async (note: AgentNote) => {
    await supabase.from("agent_notes" as any).update({ is_pinned: !note.is_pinned } as any).eq("id", note.id);
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await supabase.from("agent_notes" as any).delete().eq("id", id);
    fetchNotes();
  };

  const getColorClass = (color: string) =>
    COLOR_OPTIONS.find((c) => c.value === color)?.bg || COLOR_OPTIONS[0].bg;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-amber-400" />
            Intel Pinboard
          </CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-3 w-3" /> Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAdd && (
          <div className="mb-3 space-y-2">
            <Textarea
              placeholder="Pin a note, travel alert, or reminder..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="text-sm min-h-[60px]"
            />
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    className={`w-5 h-5 rounded-full border-2 ${c.bg} ${newColor === c.value ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    onClick={() => setNewColor(c.value)}
                  />
                ))}
              </div>
              <Button size="sm" onClick={addNote} className="ml-auto h-7 text-xs">Save</Button>
            </div>
          </div>
        )}
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet. Pin travel intel, reminders, or alerts.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border text-sm ${getColorClass(note.color)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground whitespace-pre-wrap flex-1">{note.content}</p>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePin(note)}>
                      {note.is_pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteNote(note.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {note.is_pinned && (
                  <span className="text-[10px] text-primary font-medium mt-1 block">📌 Pinned</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentPinboard;
