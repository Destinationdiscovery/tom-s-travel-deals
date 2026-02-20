import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Loader2, CalendarIcon, List, Grid3X3, Check, CheckCircle2, Circle, FileText, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

interface BookingEvent {
  id: string;
  client_name: string;
  client_email: string | null;
  event_type: string;
  event_date: string;
  title: string;
  notes: string | null;
  is_completed: boolean;
  booking_number: string | null;
  supplier: string | null;
}

interface StorageFile {
  name: string;
  url: string;
}

const eventTypeColors: Record<string, string> = {
  booking: "bg-emerald-500",
  final_payment: "bg-amber-500",
  departure: "bg-sky-500",
  return: "bg-violet-500",
  deposit_due: "bg-rose-500",
  trip_start: "bg-cyan-500",
  trip_end: "bg-indigo-500",
};

const eventTypeLabels: Record<string, string> = {
  booking: "Booking",
  final_payment: "Final Payment",
  departure: "Departure",
  return: "Return",
  deposit_due: "Deposit Due",
  trip_start: "Trip Start",
  trip_end: "Trip End",
};

const EVENT_TYPE_ORDER = ["booking", "deposit_due", "final_payment", "departure", "trip_start", "trip_end", "return"];

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// --- Date Picker Helper ---
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

const BookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BookingEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [clientList, setClientList] = useState<{ name: string; email: string }[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [form, setForm] = useState({ clientName: "", clientEmail: "", eventType: "booking", title: "", notes: "", eventDate: "", bookingNumber: "", supplier: "" });

  // Booking detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBookingNumber, setDetailBookingNumber] = useState<string | null>(null);
  const [detailEvents, setDetailEvents] = useState<Tables<"bookings">[]>([]);
  const [detailDocuments, setDetailDocuments] = useState<StorageFile[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailClientName, setDetailClientName] = useState("");
  const [detailClientEmail, setDetailClientEmail] = useState<string | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<string | null>(null);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailTripStart, setDetailTripStart] = useState<string | null>(null);
  const [detailTripEnd, setDetailTripEnd] = useState<string | null>(null);
  const [deletingBooking, setDeletingBooking] = useState(false);

  useEffect(() => { fetchEvents(); }, [currentMonth]);

  useEffect(() => {
    supabase.from("client_quotes").select("client_name, client_email").then(({ data }) => {
      if (!data) return;
      const unique = new Map<string, string>();
      data.forEach((q) => { if (!unique.has(q.client_name)) unique.set(q.client_name, q.client_email || ""); });
      setClientList(Array.from(unique.entries()).map(([name, email]) => ({ name, email })));
    });
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const { data } = await supabase.from("bookings").select("*").gte("event_date", start).lte("event_date", end).order("event_date");
    setEvents((data as BookingEvent[]) || []);
    setLoading(false);
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = getDay(startOfMonth(currentMonth));

  const openNewEvent = (date?: Date) => {
    setEditingEvent(null);
    setForm({ clientName: "", clientEmail: "", eventType: "booking", title: "", notes: "", eventDate: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"), bookingNumber: "", supplier: "" });
    setDialogOpen(true);
  };

  const openEditEvent = (event: BookingEvent) => {
    setEditingEvent(event);
    setForm({ clientName: event.client_name, clientEmail: event.client_email || "", eventType: event.event_type, title: event.title, notes: event.notes || "", eventDate: event.event_date, bookingNumber: event.booking_number || "", supplier: event.supplier || "" });
    setDialogOpen(true);
  };

  // --- Booking Detail Dialog ---
  const openBookingDetail = async (event: BookingEvent) => {
    if (!event.booking_number) return;
    setDetailBookingNumber(event.booking_number);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailEvents([]);
    setDetailDocuments([]);

    const [eventsResult, docsResult] = await Promise.all([
      supabase.from("bookings").select("*").eq("booking_number", event.booking_number).order("event_date", { ascending: true }),
      supabase.storage.from("booking-documents").list(slugify(event.client_name), { limit: 100 }),
    ]);

    if (eventsResult.data && eventsResult.data.length > 0) {
      const sorted = [...eventsResult.data].sort((a, b) => EVENT_TYPE_ORDER.indexOf(a.event_type) - EVENT_TYPE_ORDER.indexOf(b.event_type));
      setDetailEvents(sorted);
      const first = eventsResult.data[0];
      setDetailClientName(first.client_name);
      setDetailClientEmail(first.client_email);
      setDetailSupplier(first.supplier);
      setDetailTitle(first.title.replace(/ - (Booked|Deposit Due|Final Payment|Trip Start|Trip End|Departure|Return)$/, ""));
      setDetailTripStart(eventsResult.data.find((e) => e.event_type === "trip_start")?.event_date || null);
      setDetailTripEnd(eventsResult.data.find((e) => e.event_type === "trip_end")?.event_date || null);
    }

    if (docsResult.data && docsResult.data.length > 0) {
      const clientSlug = slugify(event.client_name);
      const validFiles = docsResult.data.filter((f) => f.name !== ".emptyFolderPlaceholder");
      const signedResults = await Promise.all(
        validFiles.map((f) => supabase.storage.from("booking-documents").createSignedUrl(`${clientSlug}/${f.name}`, 3600))
      );
      setDetailDocuments(validFiles.map((f, i) => ({ name: f.name, url: signedResults[i].data?.signedUrl || "" })).filter((f) => f.url));
    }

    setDetailLoading(false);
  };

  const toggleDetailEventCompletion = async (evt: Tables<"bookings">) => {
    const newValue = !evt.is_completed;
    await supabase.from("bookings").update({ is_completed: newValue }).eq("id", evt.id);
    setDetailEvents((prev) => prev.map((e) => (e.id === evt.id ? { ...e, is_completed: newValue } : e)));
    // Also refresh calendar events
    fetchEvents();
  };

  const handleDeleteBookingFromDetail = async () => {
    if (!detailBookingNumber) return;
    setDeletingBooking(true);
    const { error } = await supabase.from("bookings").delete().eq("booking_number", detailBookingNumber);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking deleted" });
      setDetailOpen(false);
      fetchEvents();
    }
    setDeletingBooking(false);
  };

  const getSignedUrl = async (fileName: string, clientName: string) => {
    const { data } = await supabase.storage.from("booking-documents").createSignedUrl(`${slugify(clientName)}/${fileName}`, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast({ title: "Error", description: "Could not generate download link.", variant: "destructive" });
  };

  // Handle event click: if it has a booking_number, open detail; otherwise open edit
  const handleEventClick = (event: BookingEvent, ev: React.MouseEvent) => {
    ev.stopPropagation();
    if (event.booking_number) {
      openBookingDetail(event);
    } else {
      openEditEvent(event);
    }
  };

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.title.trim()) {
      toast({ title: "Missing fields", description: "Client name and title are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      client_name: form.clientName,
      client_email: form.clientEmail || null,
      event_type: form.eventType as any,
      event_date: form.eventDate,
      title: form.title,
      notes: form.notes || null,
      booking_number: form.bookingNumber || null,
      supplier: form.supplier || null,
    };

    let result;
    if (editingEvent) {
      result = await supabase.from("bookings").update(payload as any).eq("id", editingEvent.id);
    } else {
      result = await supabase.from("bookings").insert(payload as any);
    }

    if (result.error) {
      toast({ title: "Error", description: result.error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!" });
      setDialogOpen(false);
      fetchEvents();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    const { error } = await supabase.from("bookings").delete().eq("id", editingEvent.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); setDialogOpen(false); fetchEvents(); }
  };

  const toggleComplete = async (event: BookingEvent) => {
    await supabase.from("bookings").update({ is_completed: !event.is_completed } as any).eq("id", event.id);
    fetchEvents();
  };

  const handleClientSelectInDialog = (value: string) => {
    if (value === "__new__") {
      setForm((f) => ({ ...f, clientName: "", clientEmail: "" }));
    } else {
      const client = clientList.find((c) => c.name === value);
      if (client) setForm((f) => ({ ...f, clientName: client.name, clientEmail: client.email }));
    }
  };

   return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Booking Calendar</h1>
        <div className="flex gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={cn("px-2.5 py-1.5 text-xs font-medium transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setViewMode("list")} className={cn("px-2.5 py-1.5 text-xs font-medium transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button onClick={() => openNewEvent()} className="gap-2"><Plus className="h-4 w-4" /> Add Event</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-7 gap-px">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayEvents = events.filter((e) => e.event_date === dateStr);
                  return (
                    <button key={dateStr} onClick={() => openNewEvent(day)} className={cn(
                      "min-h-[80px] p-1 border border-border/50 rounded-md text-left hover:bg-muted/30 transition-colors",
                      isToday(day) && "ring-1 ring-primary/50 bg-primary/5"
                    )}>
                      <span className={cn("text-xs font-medium", isToday(day) ? "text-primary" : "text-muted-foreground")}>{format(day, "d")}</span>
                      <div className="space-y-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((e) => {
                          const isOverdue = !e.is_completed && isBefore(new Date(e.event_date), startOfDay(new Date()));
                          return (
                            <div key={e.id} onClick={(ev) => handleEventClick(e, ev)}
                              title={e.booking_number ? "Click to view booking details" : "Click to edit"}
                              className={cn(
                                "text-[10px] px-1 py-0.5 rounded text-white truncate cursor-pointer",
                                eventTypeColors[e.event_type] || "bg-muted",
                                e.is_completed && "opacity-50 line-through",
                                isOverdue && "ring-1 ring-destructive animate-pulse"
                              )}>
                              {e.is_completed && <Check className="h-2 w-2 inline mr-0.5" />}
                              {e.booking_number ? `${e.client_name.split(" ").pop()} - ${e.booking_number}` : e.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* List / Agenda View */
            <div className="space-y-1">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No events this month.</p>
              ) : (
                events.sort((a, b) => a.event_date.localeCompare(b.event_date)).map((e) => {
                  const isOverdue = !e.is_completed && isBefore(new Date(e.event_date), startOfDay(new Date()));
                  return (
                    <div
                      key={e.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer",
                        e.is_completed && "opacity-60",
                        isOverdue && "border-destructive/50 bg-destructive/5"
                      )}
                      onClick={() => e.booking_number ? openBookingDetail(e) : openEditEvent(e)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button onClick={(ev) => { ev.stopPropagation(); toggleComplete(e); }} className={cn("w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors", e.is_completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border hover:border-primary")}>
                          {e.is_completed && <Check className="h-3 w-3" />}
                        </button>
                        <div className={cn("w-2 h-2 rounded-full shrink-0", eventTypeColors[e.event_type])} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium truncate", e.is_completed && "line-through text-muted-foreground")}>{e.title}</span>
                            {e.booking_number && <Badge variant="outline" className="text-[10px] shrink-0">{e.booking_number}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{e.client_name}{e.supplier ? ` · ${e.supplier}` : ""}{e.client_email ? ` · ${e.client_email}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary" className="text-[10px] capitalize">{eventTypeLabels[e.event_type] || e.event_type}</Badge>
                        <span className={cn("text-xs", isOverdue ? "text-destructive font-semibold" : "text-muted-foreground")}>{format(new Date(e.event_date), "MMM d")}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(ev) => { ev.stopPropagation(); openEditEvent(e); }}>Edit</Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs">
            {Object.entries(eventTypeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-full", eventTypeColors[key])} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Single Event Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {clientList.length > 0 && !editingEvent && (
              <div>
                <Label>Select Client</Label>
                <Select onValueChange={handleClientSelectInDialog}>
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
            <div><Label>Event Type</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(eventTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></div>
            <div><Label>Booking Number</Label><Input value={form.bookingNumber} onChange={(e) => setForm({ ...form, bookingNumber: e.target.value })} placeholder="e.g. BK12345" /></div>
            <div><Label>Supplier</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="e.g. Sunwing, Sandals" /></div>
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                {editingEvent && <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>}
                {editingEvent && <Button variant="outline" size="sm" onClick={() => toggleComplete(editingEvent)}>{editingEvent.is_completed ? "Mark Incomplete" : "Mark Complete"}</Button>}
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{detailTitle}</span>
              {detailBookingNumber && (
                <Badge variant="outline" className="font-mono text-xs">{detailBookingNumber}</Badge>
              )}
            </DialogTitle>
            {detailTripStart && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <CalendarIcon className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {format(new Date(detailTripStart), "MMM d")}
                  {detailTripEnd ? ` – ${format(new Date(detailTripEnd), "MMM d, yyyy")}` : `, ${format(new Date(detailTripStart), "yyyy")}`}
                </span>
              </div>
            )}
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6 pb-4">
                {/* Client & Supplier Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Client</p>
                    <p className="font-medium text-sm">{detailClientName}</p>
                    {detailClientEmail && <p className="text-xs text-muted-foreground">{detailClientEmail}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Supplier</p>
                    <p className="font-medium text-sm">{detailSupplier || "—"}</p>
                  </div>
                </div>

                <Separator />

                {/* Events Timeline */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Events Timeline</h3>
                  <div className="space-y-2">
                    {detailEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                        <button onClick={() => toggleDetailEventCompletion(event)} className="mt-0.5 shrink-0">
                          {event.is_completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-sm font-medium", event.is_completed && "line-through text-muted-foreground")}>
                              {eventTypeLabels[event.event_type] || event.event_type}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">{format(new Date(event.event_date), "MMM d, yyyy")}</span>
                          </div>
                          {event.notes && <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>}
                        </div>
                      </div>
                    ))}
                    {detailEvents.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No events found.</p>}
                  </div>
                </div>

                <Separator />

                {/* Documents */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Documents</h3>
                  {detailDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {detailDocuments.some((doc) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(doc.name)) && (
                        <div className="grid grid-cols-2 gap-2">
                          {detailDocuments
                            .filter((doc) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(doc.name))
                            .map((doc, i) => (
                              <button key={i} onClick={() => getSignedUrl(doc.name, detailClientName)} className="relative rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all aspect-video">
                                <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                  <span className="text-[10px] text-white truncate block">{doc.name}</span>
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                      {detailDocuments
                        .filter((doc) => !/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(doc.name))
                        .map((doc, i) => (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm flex-1 truncate">{doc.name}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => getSignedUrl(doc.name, detailClientName)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded.</p>
                  )}
                </div>

                <Separator />

                {/* Delete action */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full gap-2">
                      <Trash2 className="h-4 w-4" /> Delete Entire Booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove all {detailEvents.length} calendar events for booking {detailBookingNumber}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteBookingFromDetail} disabled={deletingBooking}>
                        {deletingBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingCalendar;
