import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Mail, Eye, Pencil, Send, Copy, Trash2, MailCheck } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import GenerationProgressModal from "./GenerationProgressModal";
import EditionEditor from "./EditionEditor";
import SubscribersPanel from "./SubscribersPanel";
import SettingsPanel from "./SettingsPanel";

interface Edition {
  id: string;
  edition_number: number;
  issue_date: string;
  status: string;
  destination: string | null;
  subject_line: string | null;
  subscriber_count: number;
  sent_at: string | null;
  full_html: string | null;
}

const CompassDashboard = () => {
  const { toast } = useToast();
  const [editions, setEditions] = useState<Edition[]>([]);
  const [activeSubs, setActiveSubs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gen, setGen] = useState<{ runId: string; editionId: string; editionNumber: number } | null>(null);
  const [genOpen, setGenOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Edition | null>(null);

  const load = async () => {
    const [{ data: eds }, { count }] = await Promise.all([
      supabase.from("compass_editions" as any).select("*").order("edition_number", { ascending: false }),
      supabase.from("subscribers" as any).select("*", { count: "exact", head: true }).eq("status", "active"),
    ]);
    setEditions((eds as any) ?? []);
    setActiveSubs(count ?? 0);
  };

  useEffect(() => { load(); }, []);

  // Refresh editions list whenever a generation completes
  useEffect(() => {
    if (!gen) return;
    const ch = supabase.channel(`compass:gen:${gen.runId}`)
      .on("broadcast", { event: "step" }, ({ payload }) => {
        if (payload?.step === 11 && payload?.status === "ok") setTimeout(load, 500);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [gen]);

  const stats = useMemo(() => {
    const sent = editions.filter(e => e.status === "sent");
    const lastSentAt = sent[0]?.sent_at ? new Date(sent[0].sent_at) : null;
    const nextDue = lastSentAt ? new Date(lastSentAt.getTime() + 14 * 86400000) : null;
    return {
      activeSubs,
      openRate: "—",
      totalPublished: sent.length,
      nextDue: nextDue ? nextDue.toLocaleDateString() : "Anytime",
    };
  }, [editions, activeSubs]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-compass-edition", { body: {} });
      if (error) throw error;
      setGen({ runId: data.run_id, editionId: data.edition_id, editionNumber: data.edition_number });
      setGenOpen(true);
    } catch (e: any) {
      toast({ title: "Failed to start generation", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const duplicate = async (id: string) => {
    const src = editions.find(e => e.id === id);
    if (!src) return;
    const { data: full } = await supabase.from("compass_editions" as any).select("*").eq("id", id).single();
    if (!full) return;
    const { id: _, edition_number: __, created_at: ___, updated_at: ____, ...copy } = full as any;
    copy.status = "draft";
    copy.sent_at = null;
    await supabase.from("compass_editions" as any).insert(copy);
    toast({ title: "Edition duplicated" });
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("compass_editions" as any).delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else toast({ title: `Edition #${deleteTarget.edition_number} deleted` });
    setDeleteTarget(null);
    load();
  };

  if (editingId) return <EditionEditor editionId={editingId} onClose={() => { setEditingId(null); load(); }} />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">The Compass</h1>
          <p className="text-sm text-muted-foreground">Newsletter system. Biweekly travel intelligence.</p>
          <Badge variant="secondary" className="mt-2">{activeSubs} active subscribers</Badge>
        </div>
        <Button size="lg" onClick={handleCreate} disabled={loading}>
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Starting..." : "Create Next Edition"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Active subscribers</div>
          <div className="font-display text-3xl font-bold mt-1">{stats.activeSubs}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Last open rate</div>
          <div className="font-display text-3xl font-bold mt-1">{stats.openRate}</div>
          <div className="text-xs text-muted-foreground mt-1">Connect provider</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Editions published</div>
          <div className="font-display text-3xl font-bold mt-1">{stats.totalPublished}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Next edition due</div>
          <div className="font-display text-xl font-bold mt-1">{stats.nextDue}</div>
        </Card>
      </div>

      <Tabs defaultValue="editions">
        <TabsList>
          <TabsTrigger value="editions"><Mail className="h-4 w-4 mr-2" />Editions</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="editions">
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Destination</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Subs</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editions.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">No editions yet. Click "Create Next Edition" to get started.</td></tr>
                )}
                {editions.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="p-3 font-medium">#{e.edition_number}</td>
                    <td className="p-3">{e.issue_date}</td>
                    <td className="p-3">{e.destination ?? "—"}</td>
                    <td className="p-3">
                      <Badge variant={e.status === "sent" ? "default" : e.status === "ready" ? "secondary" : "outline"}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="p-3">{e.subscriber_count}</td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => setPreviewHtml(e.full_html)} disabled={!e.full_html}><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(e.id)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" disabled title="Connect email provider in Settings to enable sending"><Send className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => duplicate(e.id)}><Copy className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(e)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers"><SubscribersPanel /></TabsContent>
        <TabsContent value="settings"><SettingsPanel /></TabsContent>
      </Tabs>

      <GenerationProgressModal
        runId={gen?.runId ?? null}
        editionId={gen?.editionId ?? null}
        editionNumber={gen?.editionNumber ?? null}
        open={genOpen}
        onClose={() => { setGenOpen(false); setGen(null); load(); }}
        onView={(id) => { const ed = editions.find(e => e.id === id); setPreviewHtml(ed?.full_html ?? null); }}
        onEdit={(id) => { setGenOpen(false); setEditingId(id); }}
      />

      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewHtml(null)}>
          <div className="bg-white rounded-lg overflow-hidden max-h-[90vh] w-[640px]" onClick={(e) => e.stopPropagation()}>
            <iframe srcDoc={previewHtml} className="w-full h-[85vh]" title="Edition preview" />
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete edition #{deleteTarget?.edition_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the edition and all its generated content. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompassDashboard;
