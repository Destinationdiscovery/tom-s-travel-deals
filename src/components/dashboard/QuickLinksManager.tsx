import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Plus, Trash2, GripVertical, Link2, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QuickLink {
  id: string;
  label: string;
  url: string;
  icon_name: string;
  sort_order: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Mail: <Mail className="h-3.5 w-3.5" />,
  ExternalLink: <ExternalLink className="h-3.5 w-3.5" />,
  Link2: <Link2 className="h-3.5 w-3.5" />,
};

const QuickLinksManager = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [editing, setEditing] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const fetchLinks = async () => {
    const { data } = await supabase
      .from("agent_quick_links" as any)
      .select("*")
      .order("sort_order", { ascending: true });
    setLinks((data as any[]) || []);
  };

  useEffect(() => { fetchLinks(); }, []);

  const addLink = async () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const { error } = await supabase.from("agent_quick_links" as any).insert({
      label: newLabel.trim(),
      url: newUrl.trim(),
      icon_name: "ExternalLink",
      sort_order: links.length + 1,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewLabel("");
      setNewUrl("");
      fetchLinks();
    }
  };

  const removeLink = async (id: string) => {
    await supabase.from("agent_quick_links" as any).delete().eq("id", id);
    fetchLinks();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Quick Links
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditing(!editing)}>
            {editing ? "Done" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(link.url, "_blank")}
              >
                {ICON_MAP[link.icon_name] || <ExternalLink className="h-3.5 w-3.5" />}
                {link.label}
              </Button>
              {editing && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLink(link.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="h-8 text-sm"
            />
            <Input
              placeholder="https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={addLink} className="gap-1 h-8">
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickLinksManager;
