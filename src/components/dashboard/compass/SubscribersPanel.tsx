import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface Sub {
  id: string;
  email: string;
  first_name: string | null;
  source_slug: string | null;
  status: string;
  country: string | null;
  created_at: string;
}

const SOURCE_COLORS = ["#00c9a7", "#3b82f6", "#f59e0b", "#ef4444", "#a78bfa", "#94a3b8"];

const SubscribersPanel = () => {
  const { toast } = useToast();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [q, setQ] = useState("");
  const [source, setSource] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [newEmail, setNewEmail] = useState("");

  const load = async () => {
    const { data } = await supabase.from("subscribers" as any).select("*").order("created_at", { ascending: false });
    setSubs((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => subs.filter(s =>
    (q === "" || s.email.toLowerCase().includes(q.toLowerCase())) &&
    (source === "all" || (s.source_slug ?? "") === source) &&
    (status === "all" || s.status === status)
  ), [subs, q, source, status]);

  const active = subs.filter(s => s.status === "active").length;

  const sourceCounts = useMemo(() => {
    const m: Record<string, number> = {};
    subs.forEach(s => { const k = s.source_slug ?? "unknown"; m[k] = (m[k] ?? 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [subs]);

  const weekly = useMemo(() => {
    const m: Record<string, number> = {};
    subs.forEach(s => {
      const d = new Date(s.created_at);
      const w = `${d.getUTCFullYear()}-W${Math.ceil((d.getUTCDate() + new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).getUTCDay()) / 7)}`;
      m[w] = (m[w] ?? 0) + 1;
    });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])).slice(-12).map(([week, count]) => ({ week, count }));
  }, [subs]);

  const exportCsv = () => {
    const rows = [["email", "first_name", "source", "status", "country", "subscribed_at"]];
    filtered.forEach(s => rows.push([s.email, s.first_name ?? "", s.source_slug ?? "", s.status, s.country ?? "", s.created_at]));
    const csv = rows.map(r => r.map(c => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `compass-subscribers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const addManual = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("subscribers" as any).upsert({ email, source_slug: "manual", status: "active" }, { onConflict: "email" });
    if (error) toast({ title: "Add failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Subscriber added" }); setNewEmail(""); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground">Active subscribers</div>
          <div className="font-display text-4xl font-bold mt-2">{active}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground mb-2">Signups by week</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={weekly}>
              <XAxis dataKey="week" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#00c9a7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground mb-2">Signups by source</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={sourceCounts} dataKey="value" nameKey="name" outerRadius={50}>
                {sourceCounts.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search email..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="tool-modal">Tool modal</SelectItem>
              <SelectItem value="blog-inline">Blog inline</SelectItem>
              <SelectItem value="homepage">Homepage</SelectItem>
              <SelectItem value="exit-popup">Exit popup</SelectItem>
              <SelectItem value="footer">Footer</SelectItem>
              <SelectItem value="popup">Popup (legacy)</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              <SelectItem value="bounced">Bounced</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />CSV</Button>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Add subscriber email..." value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Button onClick={addManual} size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Source</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Country</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-2">{s.email}</td>
                  <td className="p-2 text-muted-foreground">{s.source_slug ?? "—"}</td>
                  <td className="p-2 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="p-2 text-muted-foreground">{s.country ?? "—"}</td>
                  <td className="p-2"><Badge variant={s.status === "active" ? "default" : "outline"}>{s.status}</Badge></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No subscribers match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SubscribersPanel;
