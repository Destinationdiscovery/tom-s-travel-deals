import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingEvent {
  id: string;
  client_name: string;
  client_email: string | null;
  event_type: string;
  event_date: string;
  title: string;
  notes: string | null;
  is_completed: boolean;
}

const eventTypeColors: Record<string, string> = {
  booking: "bg-emerald-500",
  final_payment: "bg-amber-500",
  departure: "bg-sky-500",
  return: "bg-violet-500",
};

const eventTypeLabels: Record<string, string> = {
  booking: "Booking",
  final_payment: "Final Payment",
  departure: "Departure",
  return: "Return",
};

const BookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<BookingEvent | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ clientName: "", clientEmail: "", eventType: "booking", title: "", notes: "", eventDate: "" });

  useEffect(() => { fetchEvents(); }, [currentMonth]);

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
    setForm({ clientName: "", clientEmail: "", eventType: "booking", title: "", notes: "", eventDate: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd") });
    setDialogOpen(true);
  };

  const openEditEvent = (event: BookingEvent) => {
    setEditingEvent(event);
    setForm({ clientName: event.client_name, clientEmail: event.client_email || "", eventType: event.event_type, title: event.title, notes: event.notes || "", eventDate: event.event_date });
    setDialogOpen(true);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Booking Calendar</h1>
        <Button onClick={() => openNewEvent()} className="gap-2"><Plus className="h-4 w-4" /> Add Event</Button>
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
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} onClick={(ev) => { ev.stopPropagation(); openEditEvent(e); }}
                        className={cn("text-[10px] px-1 py-0.5 rounded text-white truncate cursor-pointer", eventTypeColors[e.event_type] || "bg-muted", e.is_completed && "opacity-50 line-through")}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 text-xs">
            {Object.entries(eventTypeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-full", eventTypeColors[key])} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
    </div>
  );
};

export default BookingCalendar;
