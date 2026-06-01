import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Beaker, Users } from "lucide-react";

const SettingsPanel = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const runTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-mailerlite-connection", { body: {} });
      if (error) throw error;
      setReport(data);
    } catch (e: any) {
      toast({ title: "Test failed", description: e?.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const runSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-subscribers-to-mailerlite", { body: {} });
      if (error) throw error;
      toast({
        title: "Sync complete",
        description: `${data.synced}/${data.total} synced${data.failed ? `, ${data.failed} failed` : ""}.`,
      });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e?.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-display text-xl font-bold mb-1">MailerLite</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The newsletter sends through MailerLite. Use these tools to verify the connection and backfill subscribers.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={runTest} disabled={testing} variant="outline">
            <Beaker className={`h-4 w-4 mr-2 ${testing ? "animate-pulse" : ""}`} />
            {testing ? "Testing..." : "Test connection"}
          </Button>
          <Button onClick={runSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync subscribers to MailerLite"}
          </Button>
        </div>
      </Card>

      <Dialog open={!!report} onOpenChange={(o) => !o && setReport(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>MailerLite connection report</DialogTitle>
          </DialogHeader>
          {report && (
            <div className="space-y-4 text-sm">
              <Section title="Account">
                <Row label="Status" value={report.account?.ok ? "OK" : `Error ${report.account?.status}`} ok={report.account?.ok} />
                <Row label="Name" value={report.account?.name ?? "—"} />
                <Row label="Email" value={report.account?.email ?? "—"} />
              </Section>

              <Section title="Group">
                <Row label="Status" value={report.group?.ok ? "OK" : `Error ${report.group?.status}`} ok={report.group?.ok} />
                <Row label="Name" value={report.group?.name ?? "—"} />
                <Row label="Total subscribers in MailerLite group" value={String(report.group?.total ?? "—")} />
                <Row label="Group ID" value={report.group?.id ?? "—"} />
              </Section>

              <Section title="Verified sender domains">
                {(report.domains?.list ?? []).length === 0 && <div className="text-muted-foreground">No domains found.</div>}
                {(report.domains?.list ?? []).map((d: any) => (
                  <div key={d.name} className="flex justify-between border-b border-border py-1">
                    <span>{d.name}</span>
                    <Badge variant={d.verified ? "default" : "outline"}>{d.verified ? "verified" : "not verified"}</Badge>
                  </div>
                ))}
              </Section>

              <Section title={`Subscribers in MailerLite group (${(report.group_subscribers?.list ?? []).length})`}>
                {(report.group_subscribers?.list ?? []).length === 0 && <div className="text-muted-foreground">No subscribers in this group yet.</div>}
                {(report.group_subscribers?.list ?? []).map((s: any) => (
                  <div key={s.email} className="flex justify-between border-b border-border py-1">
                    <span>{s.email}</span>
                    <Badge variant="secondary">{s.status}</Badge>
                  </div>
                ))}
              </Section>

              <Section title={`Database subscribers (${report.db_subscribers?.count ?? 0})`}>
                {(report.db_subscribers?.emails ?? []).map((e: string) => (
                  <div key={e} className="py-0.5">{e}</div>
                ))}
              </Section>

              {(report.missing_from_mailerlite?.length ?? 0) > 0 && (
                <Section title={`Missing from MailerLite group (${report.missing_from_mailerlite.length})`}>
                  <div className="text-destructive mb-2">These subscribers exist in your database but are NOT in the MailerLite group. Click "Sync subscribers" to add them.</div>
                  {report.missing_from_mailerlite.map((e: string) => (
                    <div key={e} className="py-0.5">{e}</div>
                  ))}
                </Section>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="font-semibold mb-2 flex items-center gap-2"><Users className="h-4 w-4" />{title}</div>
    <div className="rounded border border-border bg-muted/30 p-3 space-y-1">{children}</div>
  </div>
);

const Row = ({ label, value, ok }: { label: string; value: string; ok?: boolean }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={ok === false ? "text-destructive" : ""}>{value}</span>
  </div>
);

export default SettingsPanel;
