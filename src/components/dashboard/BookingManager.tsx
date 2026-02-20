import { useState, useEffect } from "react";
import { Plus, Loader2, CalendarIcon, ClipboardList } from "lucide-react";
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

const BookingManager = () => {
  const [bookings, setBookings] = useState<BookingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientList, setClientList] = useState<{ name: string; email: string }[]>([]);

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
      const groups = new Map<string, BookingGroup>();
      for (const row of data) {
        const key = row.booking_number!;
        if (!groups.has(key)) {
          groups.set(key, {
            bookingNumber: key,
            clientName: row.client_name,
            clientEmail: row.client_email,
            supplier: row.supplier,
            title: row.title.replace(/ - (Booked|Deposit Due|Final Payment|Trip Start|Trip End)$/, ""),
            tripStart: null,
            tripEnd: null,
            eventCount: 0,
          });
        }
        const g = groups.get(key)!;
        g.eventCount++;
        if (row.event_type === "trip_start") g.tripStart = row.event_date;
        if (row.event_type === "trip_end") g.tripEnd = row.event_date;
      }
      setBookings(Array.from(groups.values()));
    }
    setLoading(false);
  };

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

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.bookingNumber.trim() || !form.title.trim()) {
      toast({ title: "Missing fields", description: "Client name, booking number, and title are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const entries: any[] = [];
    const base = { client_name: form.clientName, client_email: form.clientEmail || null, booking_number: form.bookingNumber, supplier: form.supplier || null };

    if (form.dateBooked) entries.push({ ...base, event_type: "booking", event_date: format(form.dateBooked, "yyyy-MM-dd"), title: `${form.title} - Booked` });
    if (form.depositDue) entries.push({ ...base, event_type: "deposit_due", event_date: format(form.depositDue, "yyyy-MM-dd"), title: `${form.title} - Deposit Due` });
    if (form.finalPaymentDue) entries.push({ ...base, event_type: "final_payment", event_date: format(form.finalPaymentDue, "yyyy-MM-dd"), title: `${form.title} - Final Payment` });
    if (form.tripStart) entries.push({ ...base, event_type: "trip_start", event_date: format(form.tripStart, "yyyy-MM-dd"), title: `${form.title} - Trip Start` });
    if (form.tripEnd) entries.push({ ...base, event_type: "trip_end", event_date: format(form.tripEnd, "yyyy-MM-dd"), title: `${form.title} - Trip End` });

    if (entries.length === 0) {
      toast({ title: "Add at least one date", variant: "destructive" });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("bookings").insert(entries);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking created!", description: `${entries.length} calendar entries added.` });
      setDialogOpen(false);
      fetchBookings();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Bookings</h1>
        <Button onClick={openNewBooking} className="gap-2"><Plus className="h-4 w-4" /> Add Booking</Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2"><ClipboardList className="h-5 w-5" /> All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No bookings yet. Click "Add Booking" to create one.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Trip / Resort</TableHead>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Trip Dates</TableHead>
                  <TableHead className="text-right">Events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.bookingNumber}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{b.clientName}</span>
                        {b.clientEmail && <p className="text-xs text-muted-foreground">{b.clientEmail}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{b.title}</TableCell>
                    <TableCell><Badge variant="outline">{b.bookingNumber}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{b.supplier || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {b.tripStart && b.tripEnd
                        ? `${format(new Date(b.tripStart), "MMM d")} – ${format(new Date(b.tripEnd), "MMM d, yyyy")}`
                        : b.tripStart
                        ? `From ${format(new Date(b.tripStart), "MMM d, yyyy")}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{b.eventCount}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Booking Dialog */}
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
                    {clientList.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}{c.email ? ` — ${c.email}` : ""}</SelectItem>)}
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
