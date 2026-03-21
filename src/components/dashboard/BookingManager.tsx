import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, CalendarIcon, ClipboardList, Paperclip, Send, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientGroup {
  clientName: string;
  clientEmail: string | null;
  clientSlug: string;
  bookingCount: number;
  bookingNumbers: string[];
  upcomingTrip: string | null;
  lastActivity: string;
}

interface BookingGroup {
  bookingNumber: string;
  clientName: string;
  clientEmail: string | null;
  supplier: string | null;
  title: string;
  tripStart: string | null;
  tripEnd: string | null;
  eventCount: number;
}

interface AttachedFile {
  file: File;
  preview?: string;
}

interface BookingDetails {
  booking_number: string;
  client_name: string | null;
  client_email: string | null;
  supplier: string | null;
  resort_name: string | null;
  destination: string | null;
  room_type: string | null;
  flight_details: any;
  pricing: any;
  num_travellers: number | null;
  extras: any[];
}

const DatePickerField = ({ label, date, onSelect }: { label: string; date: Date | undefined; onSelect: (d: Date | undefined) => void }) => (
  <div>
    <Label>{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  </div>
);
const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const BookingManager = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingGroup[]>([]);
  const [clients, setClients] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientList, setClientList] = useState<{ name: string; email: string }[]>([]);

  // Chat input state
  const [chatMessage, setChatMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    clientName: "", clientEmail: "", bookingNumber: "", title: "", supplier: "",
    dateBooked: undefined as Date | undefined,
    depositDue: undefined as Date | undefined,
    finalPaymentDue: undefined as Date | undefined,
    tripStart: undefined as Date | undefined,
    tripEnd: undefined as Date | undefined,
  });

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    supabase.from("client_quotes").select("client_name, client_email").then(({ data }) => {
      if (!data) return;
      const unique = new Map<string, string>();
      data.forEach((q) => { if (!unique.has(q.client_name)) unique.set(q.client_name, q.client_email || ""); });
      setClientList(Array.from(unique.entries()).map(([name, email]) => ({ name, email })));
    });
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .not("booking_number", "is", null)
      .order("event_date", { ascending: false });

    if (data) {
      // Build booking groups (kept for AI processing context)
      const groups = new Map<string, BookingGroup>();
      for (const row of data) {
        const key = row.booking_number!;
        if (!groups.has(key)) {
          groups.set(key, {
            bookingNumber: key,
            clientName: row.client_name,
            clientEmail: row.client_email,
            supplier: row.supplier,
            title: row.title.replace(/ - (Booked|Deposit Due|Final Payment|Trip Start|Trip End|Departure|Return)$/, ""),
            tripStart: null, tripEnd: null, eventCount: 0,
          });
        }
        const g = groups.get(key)!;
        g.eventCount++;
        if (row.event_type === "trip_start") g.tripStart = row.event_date;
        if (row.event_type === "trip_end") g.tripEnd = row.event_date;
      }
      setBookings(Array.from(groups.values()));

      // Build client groups
      const clientMap = new Map<string, ClientGroup>();
      for (const row of data) {
        const key = slugify(row.client_name);
        if (!clientMap.has(key)) {
          clientMap.set(key, {
            clientName: row.client_name,
            clientEmail: row.client_email,
            clientSlug: key,
            bookingCount: 0,
            bookingNumbers: [],
            upcomingTrip: null,
            lastActivity: row.event_date,
          });
        }
        const c = clientMap.get(key)!;
        if (row.booking_number && !c.bookingNumbers.includes(row.booking_number)) {
          c.bookingNumbers.push(row.booking_number);
          c.bookingCount = c.bookingNumbers.length;
        }
        // Track upcoming trip (nearest future trip_start)
        if (row.event_type === "trip_start") {
          const tripDate = new Date(row.event_date);
          if (tripDate >= new Date()) {
            if (!c.upcomingTrip || tripDate < new Date(c.upcomingTrip)) {
              c.upcomingTrip = row.event_date;
            }
          }
        }
      }
      setClients(Array.from(clientMap.values()).sort((a, b) => {
        // Upcoming trips first, then by last activity
        if (a.upcomingTrip && !b.upcomingTrip) return -1;
        if (!a.upcomingTrip && b.upcomingTrip) return 1;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }));
    }
    setLoading(false);
  };

  // Navigate to client file
  const openClientFile = (client: ClientGroup) => {
    navigate(`/client/${client.clientSlug}`);
  };

  // --- Upsert booking_details helper ---
  const upsertBookingDetails = async (bookingNumber: string, details: Partial<BookingDetails>) => {
    const { data: existing } = await supabase
      .from("booking_details" as any)
      .select("booking_number")
      .eq("booking_number", bookingNumber)
      .maybeSingle();

    if ((existing as any)) {
      const updates: any = {};
      for (const [k, v] of Object.entries(details)) {
        if (v !== null && v !== undefined && k !== "booking_number") {
          if (k === "extras" && Array.isArray(v)) {
            const { data: currentRow } = await supabase
              .from("booking_details" as any)
              .select("extras")
              .eq("booking_number", bookingNumber)
              .single();
            const currentExtras = (currentRow as any)?.extras || [];
            const merged = [...currentExtras];
            for (const ext of v as any[]) {
              if (!merged.some((e: any) => e.label === ext.label)) merged.push(ext);
            }
            updates.extras = merged;
          } else {
            updates[k] = v;
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from("booking_details" as any).update(updates).eq("booking_number", bookingNumber);
      }
    } else {
      await supabase.from("booking_details" as any).insert({ booking_number: bookingNumber, ...details });
    }
  };

  // --- Form / manual add logic ---
  const openNewBooking = () => {
    setForm({ clientName: "", clientEmail: "", bookingNumber: "", title: "", supplier: "", dateBooked: new Date(), depositDue: undefined, finalPaymentDue: undefined, tripStart: undefined, tripEnd: undefined });
    setDialogOpen(true);
  };

  const handleClientSelect = (value: string) => {
    if (value === "__new__") {
      setForm((f) => ({ ...f, clientName: "", clientEmail: "" }));
    } else {
      const client = clientList.find((c) => c.name === value);
      if (client) setForm((f) => ({ ...f, clientName: client.name, clientEmail: client.email }));
    }
  };

  const createBookingEntries = async (bookingData: {
    clientName: string; clientEmail?: string; bookingNumber: string;
    title: string; supplier?: string;
    dateBooked?: string; depositDue?: string; finalPaymentDue?: string;
    tripStart?: string; tripEnd?: string;
  }) => {
    const entries: any[] = [];
    const base = {
      client_name: bookingData.clientName,
      client_email: bookingData.clientEmail || null,
      booking_number: bookingData.bookingNumber,
      supplier: bookingData.supplier || null,
    };

    if (bookingData.dateBooked) entries.push({ ...base, event_type: "booking" as const, event_date: bookingData.dateBooked, title: `${bookingData.title} - Booked` });
    if (bookingData.depositDue) entries.push({ ...base, event_type: "deposit_due" as const, event_date: bookingData.depositDue, title: `${bookingData.title} - Deposit Due` });
    if (bookingData.finalPaymentDue) entries.push({ ...base, event_type: "final_payment" as const, event_date: bookingData.finalPaymentDue, title: `${bookingData.title} - Final Payment` });
    if (bookingData.tripStart) entries.push({ ...base, event_type: "trip_start" as const, event_date: bookingData.tripStart, title: `${bookingData.title} - Trip Start` });
    if (bookingData.tripEnd) entries.push({ ...base, event_type: "trip_end" as const, event_date: bookingData.tripEnd, title: `${bookingData.title} - Trip End` });

    if (entries.length === 0) {
      entries.push({ ...base, event_type: "booking" as const, event_date: format(new Date(), "yyyy-MM-dd"), title: `${bookingData.title} - Booked` });
    }

    const { error } = await supabase.from("bookings").insert(entries);
    if (error) throw error;
    return entries.length;
  };

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.bookingNumber.trim() || !form.title.trim()) {
      toast({ title: "Missing fields", description: "Client name, booking number, and title are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const count = await createBookingEntries({
        clientName: form.clientName, clientEmail: form.clientEmail, bookingNumber: form.bookingNumber,
        title: form.title, supplier: form.supplier,
        dateBooked: form.dateBooked ? format(form.dateBooked, "yyyy-MM-dd") : undefined,
        depositDue: form.depositDue ? format(form.depositDue, "yyyy-MM-dd") : undefined,
        finalPaymentDue: form.finalPaymentDue ? format(form.finalPaymentDue, "yyyy-MM-dd") : undefined,
        tripStart: form.tripStart ? format(form.tripStart, "yyyy-MM-dd") : undefined,
        tripEnd: form.tripEnd ? format(form.tripEnd, "yyyy-MM-dd") : undefined,
      });
      toast({ title: "Booking created!", description: `${count} calendar entries added.` });
      setDialogOpen(false);
      fetchBookings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  // --- Chat / AI logic ---
  const handleFileAttach = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttached: AttachedFile[] = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setAttachedFiles((prev) => [...prev, ...newAttached]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const processAiResponse = async (result: any, files: AttachedFile[]) => {
    if (result.error) {
      toast({ title: "AI Error", description: result.error, variant: "destructive" });
      return;
    }

    if (result.action === "create_booking") {
      const d = result.data;
      const clientSlug = slugify(d.client_name);
      for (const af of files) {
        const path = `${clientSlug}/${af.file.name}`;
        await supabase.storage.from("booking-documents").upload(path, af.file, { upsert: true });
      }

      const count = await createBookingEntries({
        clientName: d.client_name,
        clientEmail: d.client_email || undefined,
        bookingNumber: d.booking_number,
        title: d.resort_or_trip,
        supplier: d.supplier || undefined,
        dateBooked: d.date_booked || format(new Date(), "yyyy-MM-dd"),
        depositDue: d.deposit_due || undefined,
        finalPaymentDue: d.final_payment_due || undefined,
        tripStart: d.trip_start || undefined,
        tripEnd: d.trip_end || undefined,
      });

      await upsertBookingDetails(d.booking_number, {
        client_name: d.client_name,
        client_email: d.client_email || null,
        supplier: d.supplier || null,
        resort_name: d.resort_or_trip,
        destination: d.destination || null,
        room_type: d.room_type || null,
        flight_details: d.flight_details || [],
        pricing: d.pricing || {},
        num_travellers: d.num_travellers || null,
        extras: d.extras || [],
      });

      toast({
        title: "Booking created!",
        description: `${d.resort_or_trip} for ${d.client_name} (${d.booking_number}), ${count} calendar events added.`,
      });
      fetchBookings();

      // Navigate to the client file
      navigate(`/client/${slugify(d.client_name)}`);
    } else if (result.action === "add_to_booking") {
      const d = result.data;
      const clientSlug = slugify(d.client_name);
      for (const af of files) {
        const path = `${clientSlug}/${af.file.name}`;
        await supabase.storage.from("booking-documents").upload(path, af.file, { upsert: true });
      }

      const mergeData: Partial<BookingDetails> = {};
      if (d.destination) mergeData.destination = d.destination;
      if (d.room_type) mergeData.room_type = d.room_type;
      if (d.num_travellers) mergeData.num_travellers = d.num_travellers;
      if (d.flight_details) mergeData.flight_details = d.flight_details;
      if (d.pricing) mergeData.pricing = d.pricing;
      if (d.extras) mergeData.extras = d.extras;

      if (Object.keys(mergeData).length > 0) {
        await upsertBookingDetails(d.booking_number, mergeData);
      }

      toast({
        title: "Booking updated!",
        description: `${files.length} file(s) added to booking ${d.booking_number}.`,
      });

      // Navigate to the client file
      navigate(`/client/${slugify(d.client_name)}`);
    } else {
      toast({ title: "AI Response", description: result.message || "No action taken." });
    }
  };

  const handleChatSend = async () => {
    if (!chatMessage.trim() && attachedFiles.length === 0) return;

    setAiProcessing(true);
    setAiStatus("Reading documents...");

    try {
      const filesPayload = await Promise.all(
        attachedFiles.map(async (af) => ({
          name: af.file.name,
          mimeType: af.file.type,
          base64: await fileToBase64(af.file),
        }))
      );

      setAiStatus("Analyzing with AI...");

      const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
        body: {
          message: chatMessage,
          files: filesPayload,
          existing_bookings: bookings,
          existing_clients: clientList,
        },
      });

      if (error) throw error;

      setAiStatus("Creating booking...");
      await processAiResponse(result, attachedFiles);

      setChatMessage("");
      setAttachedFiles([]);
    } catch (err: any) {
      console.error("AI booking error:", err);
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setAiProcessing(false);
      setAiStatus("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage client bookings and travel documents.</p>
        </div>
        <Button onClick={openNewBooking} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Manual Add
        </Button>
      </div>

      {/* Client Files Table */}
      <Card className="flex-1 min-h-0 overflow-auto mb-4 border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <ClipboardList className="h-5 w-5 text-emerald-400" />
            </div>
            Client Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No bookings yet. Attach documents below or click "Manual Add".</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Upcoming Trip</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow
                    key={c.clientSlug}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => openClientFile(c)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {c.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">{c.clientName}</span>
                          {c.clientEmail && <p className="text-xs text-muted-foreground">{c.clientEmail}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{c.bookingCount}</Badge></TableCell>
                    <TableCell className="text-sm">
                      {c.upcomingTrip
                        ? format(new Date(c.upcomingTrip), "MMM d, yyyy")
                        : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(c.lastActivity), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Chat Input Bar */}
      <div className="border border-border rounded-xl bg-card shadow-sm p-3 space-y-2">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((af, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5 text-xs">
                {af.preview ? (
                  <img src={af.preview} alt="" className="h-6 w-6 rounded object-cover" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="max-w-[120px] truncate">{af.file.name}</span>
                <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {aiProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{aiStatus}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf"
            onChange={handleFilesSelected}
          />
          <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={handleFileAttach} disabled={aiProcessing}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Attach booking docs and describe what to do..."
            className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            disabled={aiProcessing}
          />
          <Button
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={handleChatSend}
            disabled={aiProcessing || (!chatMessage.trim() && attachedFiles.length === 0)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Manual Add Booking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Full Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {clientList.length > 0 && (
              <div>
                <Label>Select Client</Label>
                <Select onValueChange={handleClientSelect}>
                  <SelectTrigger><SelectValue placeholder="Choose a client..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__new__">+ New Client</SelectItem>
                    {clientList.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}{c.email ? `, ${c.email}` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Client Name *</Label><Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
            <div><Label>Client Email</Label><Input value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} /></div>
            <div><Label>Trip/Resort Name *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sandals Montego Bay" /></div>
            <div><Label>Booking Number *</Label><Input value={form.bookingNumber} onChange={(e) => setForm({ ...form, bookingNumber: e.target.value })} placeholder="e.g. BK12345" /></div>
            <div><Label>Supplier</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="e.g. Sunwing, Sandals" /></div>
            <div className="grid grid-cols-2 gap-3">
              <DatePickerField label="Date Booked" date={form.dateBooked} onSelect={(d) => setForm({ ...form, dateBooked: d })} />
              <DatePickerField label="Deposit Due" date={form.depositDue} onSelect={(d) => setForm({ ...form, depositDue: d })} />
              <DatePickerField label="Final Payment Due" date={form.finalPaymentDue} onSelect={(d) => setForm({ ...form, finalPaymentDue: d })} />
              <DatePickerField label="Trip Start" date={form.tripStart} onSelect={(d) => setForm({ ...form, tripStart: d })} />
              <DatePickerField label="Trip End" date={form.tripEnd} onSelect={(d) => setForm({ ...form, tripEnd: d })} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
              Save Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManager;
