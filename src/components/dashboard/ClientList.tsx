import { useEffect, useState } from "react";
import { Search, FileText, Calendar, ChevronRight, Mail, UserPlus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { DashboardTab } from "./DashboardSidebar";

interface ClientInfo {
  name: string;
  email: string;
  quoteCount: number;
  bookedCount: number;
  lastActivity: string;
  quotes: any[];
  bookings: any[];
}

interface ClientListProps {
  onNavigate: (tab: DashboardTab) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  booked: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  expired: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const QUOTE_STATUSES = ["draft", "sent", "accepted", "booked", "expired"];

const buildClientMap = (quotes: any[], bookings: any[]) => {
  const map = new Map<string, ClientInfo>();
  quotes.forEach((q) => {
    const key = q.client_name.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, { name: q.client_name, email: q.client_email || "", quoteCount: 0, bookedCount: 0, lastActivity: q.created_at, quotes: [], bookings: [] });
    }
    const client = map.get(key)!;
    if (new Date(q.created_at) > new Date(client.lastActivity)) {
      client.name = q.client_name;
      client.lastActivity = q.created_at;
    }
    if (q.client_email) client.email = q.client_email;
    client.quoteCount++;
    if (q.status === "booked") client.bookedCount++;
    client.quotes.push(q);
  });
  bookings.forEach((b) => {
    const key = b.client_name.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, { name: b.client_name, email: b.client_email || "", quoteCount: 0, bookedCount: 0, lastActivity: b.created_at, quotes: [], bookings: [] });
    }
    map.get(key)!.bookings.push(b);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
};

const ClientList = ({ onNavigate }: ClientListProps) => {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [search, setSearch] = useState("");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    const [quotesRes, bookingsRes] = await Promise.all([
      supabase.from("client_quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("event_date", { ascending: false }),
    ]);
    return { quotes: quotesRes.data || [], bookings: bookingsRes.data || [] };
  };

  useEffect(() => {
    setLoading(true);
    fetchAll().then(({ quotes, bookings }) => {
      setClients(buildClientMap(quotes, bookings));
      setLoading(false);
    });
  }, []);

  const handleAddClient = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("client_quotes").insert({
      client_name: newName.trim(),
      client_email: newEmail.trim() || null,
      resort_name: "General Inquiry",
      status: "draft" as any,
      total_price: 0,
      notes: newNotes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to add client.", variant: "destructive" });
      return;
    }
    toast({ title: "Client added", description: `${newName.trim()} has been added.` });
    setNewName(""); setNewEmail(""); setNewNotes(""); setAddOpen(false);
    const { quotes, bookings } = await fetchAll();
    setClients(buildClientMap(quotes, bookings));
  };

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    const { error } = await supabase.from("client_quotes").update({ status: newStatus } as any).eq("id", quoteId);
    if (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
      return;
    }
    // Update local state
    setClients((prev) =>
      prev.map((c) => ({
        ...c,
        quotes: c.quotes.map((q) => q.id === quoteId ? { ...q, status: newStatus } : q),
        bookedCount: c.quotes.reduce((count, q) => count + (q.id === quoteId ? (newStatus === "booked" ? 1 : 0) : (q.status === "booked" ? 1 : 0)), 0),
      }))
    );
    toast({ title: "Status updated", description: `Quote status changed to ${newStatus}.` });
  };

  const handleDeleteQuote = async (quoteId: string, resortName: string) => {
    const { error } = await supabase.from("client_quotes").delete().eq("id", quoteId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete quote.", variant: "destructive" });
      return;
    }
    toast({ title: "Quote deleted", description: `${resortName} quote removed.` });
    const { quotes, bookings } = await fetchAll();
    setClients(buildClientMap(quotes, bookings));
  };

  const handleDeleteClient = async (clientName: string) => {
    // Delete all quotes and bookings for this client (case-insensitive via ilike)
    const [qRes, bRes] = await Promise.all([
      supabase.from("client_quotes").delete().ilike("client_name", clientName),
      supabase.from("bookings").delete().ilike("client_name", clientName),
    ]);
    if (qRes.error || bRes.error) {
      toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
      return;
    }
    toast({ title: "Client deleted", description: `${clientName} and all associated records removed.` });
    const { quotes, bookings } = await fetchAll();
    setClients(buildClientMap(quotes, bookings));
  };

  const filtered = search.trim()
    ? clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : clients;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">All your client files in one place.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" /> Add Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Client Name *</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Doe" /></div>
              <div><Label>Client Email</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="jane@email.com" /></div>
              <div><Label>Notes</Label><Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Optional notes..." className="min-h-[80px]" /></div>
              <Button onClick={handleAddClient} disabled={!newName.trim() || saving} className="w-full">{saving ? "Adding..." : "Add Client"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading clients...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No clients found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Card key={client.name} className="overflow-hidden">
              <button
                onClick={() => setExpandedClient(expandedClient === client.name ? null : client.name)}
                className="w-full text-left"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      {client.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2 text-xs">
                      <Badge variant="secondary">{client.quoteCount} {client.quoteCount === 1 ? "quote" : "quotes"}</Badge>
                      {client.bookedCount > 0 && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{client.bookedCount} booked</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(client.lastActivity), "MMM d")}</span>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedClient === client.name ? "rotate-90" : ""}`} />
                  </div>
                </CardContent>
              </button>

              {expandedClient === client.name && (
                <div className="border-t border-border px-4 py-3 bg-muted/20 space-y-3">
                  {/* Quotes */}
                  {client.quotes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Quotes</p>
                      <div className="space-y-1">
                        {client.quotes.map((q) => (
                          <div key={q.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-foreground">{q.resort_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select value={q.status} onValueChange={(v) => handleStatusChange(q.id, v)}>
                                <SelectTrigger className={`h-7 w-[100px] text-xs capitalize border ${statusColors[q.status] || ""}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {QUOTE_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {q.total_price > 0 && <span className="text-xs text-muted-foreground">${Number(q.total_price).toLocaleString()}</span>}
                              <span className="text-xs text-muted-foreground">{format(new Date(q.created_at), "MMM d")}</span>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                                    <AlertDialogDescription>Delete the quote for "{q.resort_name}"? This cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteQuote(q.id, q.resort_name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bookings */}
                  {client.bookings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Calendar Events</p>
                      <div className="space-y-1">
                        {client.bookings.slice(0, 5).map((b) => (
                          <div key={b.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-foreground">{b.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{format(new Date(b.event_date), "MMM d, yyyy")}</span>
                          </div>
                        ))}
                        {client.bookings.length > 5 && (
                          <p className="text-xs text-muted-foreground pl-2">+{client.bookings.length - 5} more events</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => onNavigate("quotes")} className="text-xs gap-1">
                      <FileText className="h-3 w-3" /> Go to Quotes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("calendar")} className="text-xs gap-1">
                      <Calendar className="h-3 w-3" /> Go to Calendar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs gap-1 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" /> Delete Client
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete all quotes and bookings for "{client.name}". This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteClient(client.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Client</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientList;
