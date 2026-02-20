import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, CalendarIcon, ClipboardList, Paperclip, Send, X, FileText, Image as ImageIcon, Download, Trash2, CheckCircle2, Circle, MapPin, Plane, DollarSign, Users, Hotel, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

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

interface StorageFile {
  name: string;
  url: string;
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

const EVENT_TYPE_LABELS: Record<string, string> = {
  booking: "Booked",
  deposit_due: "Deposit Due",
  final_payment: "Final Payment",
  trip_start: "Trip Start",
  trip_end: "Trip End",
  departure: "Departure",
  return: "Return",
};

const EVENT_TYPE_ORDER = ["booking", "deposit_due", "final_payment", "departure", "trip_start", "trip_end", "return"];

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

/* ─── Detail Section Components ─── */

const DetailRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="grid grid-cols-[140px_1fr] px-4 py-3">
    <span className="text-xs text-muted-foreground uppercase tracking-wider self-center flex items-center gap-1.5">
      {icon}
      {label}
    </span>
    <div className="text-sm font-medium">{value || "—"}</div>
  </div>
);

const FlightLeg = ({ label, leg }: { label: string; leg: any }) => {
  if (!leg) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-3 text-sm">
        <div className="text-right">
          <p className="font-bold">{leg.departure_airport || "—"}</p>
          <p className="text-xs text-muted-foreground">{leg.departure_time || ""}</p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Plane className="h-4 w-4 text-primary" />
          <span className="text-[10px] text-muted-foreground">{leg.airline} {leg.flight_number}</span>
        </div>
        <div>
          <p className="font-bold">{leg.arrival_airport || "—"}</p>
          <p className="text-xs text-muted-foreground">{leg.arrival_time || ""}</p>
        </div>
      </div>
    </div>
  );
};

const BookingManager = () => {
  const [bookings, setBookings] = useState<BookingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientList, setClientList] = useState<{ name: string; email: string }[]>([]);

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingGroup | null>(null);
  const [detailEvents, setDetailEvents] = useState<Tables<"bookings">[]>([]);
  const [detailDocuments, setDetailDocuments] = useState<StorageFile[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Chat input state (main)
  const [chatMessage, setChatMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-booking chat state
  const [inBookingMessage, setInBookingMessage] = useState("");
  const [inBookingFiles, setInBookingFiles] = useState<AttachedFile[]>([]);
  const [inBookingProcessing, setInBookingProcessing] = useState(false);
  const [inBookingStatus, setInBookingStatus] = useState("");
  const inBookingFileRef = useRef<HTMLInputElement>(null);

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
    }
    setLoading(false);
  };

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // --- Detail dialog logic ---

  const openBookingDetail = async (booking: BookingGroup) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailEvents([]);
    setDetailDocuments([]);
    setBookingDetails(null);
    setInBookingMessage("");
    setInBookingFiles([]);

    const [eventsResult, docsResult, detailsResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .eq("booking_number", booking.bookingNumber)
        .order("event_date", { ascending: true }),
      supabase.storage
        .from("booking-documents")
        .list(slugify(booking.clientName), { limit: 100 }),
      supabase
        .from("booking_details" as any)
        .select("*")
        .eq("booking_number", booking.bookingNumber)
        .maybeSingle(),
    ]);

    if (eventsResult.data) {
      const sorted = [...eventsResult.data].sort((a, b) => {
        const ai = EVENT_TYPE_ORDER.indexOf(a.event_type);
        const bi = EVENT_TYPE_ORDER.indexOf(b.event_type);
        return ai - bi;
      });
      setDetailEvents(sorted);
    }

    if (docsResult.data && docsResult.data.length > 0) {
      const clientSlug = slugify(booking.clientName);
      const validFiles = docsResult.data.filter((f) => f.name !== ".emptyFolderPlaceholder");
      const signedResults = await Promise.all(
        validFiles.map((f) =>
          supabase.storage.from("booking-documents").createSignedUrl(`${clientSlug}/${f.name}`, 3600)
        )
      );
      const files: StorageFile[] = validFiles.map((f, i) => ({
        name: f.name,
        url: signedResults[i].data?.signedUrl || "",
      })).filter((f) => f.url);
      setDetailDocuments(files);
    }

    if ((detailsResult as any).data) {
      setBookingDetails((detailsResult as any).data as BookingDetails);
    }

    setDetailLoading(false);
  };

  const toggleEventCompletion = async (event: Tables<"bookings">) => {
    const newValue = !event.is_completed;
    const { error } = await supabase
      .from("bookings")
      .update({ is_completed: newValue })
      .eq("id", event.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setDetailEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, is_completed: newValue } : e))
    );
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    setDeletingBooking(true);

    // Delete booking_details row too
    await supabase
      .from("booking_details" as any)
      .delete()
      .eq("booking_number", selectedBooking.bookingNumber);

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("booking_number", selectedBooking.bookingNumber);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking deleted", description: `All events for ${selectedBooking.bookingNumber} removed.` });
      setDetailOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    }
    setDeletingBooking(false);
  };

  const getSignedUrl = async (fileName: string, clientName: string) => {
    const clientSlug = slugify(clientName);
    const { data } = await supabase.storage
      .from("booking-documents")
      .createSignedUrl(`${clientSlug}/${fileName}`, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      toast({ title: "Error", description: "Could not generate download link.", variant: "destructive" });
    }
  };

  // --- Upsert booking_details helper ---

  const upsertBookingDetails = async (bookingNumber: string, details: Partial<BookingDetails>) => {
    // Check if row exists
    const { data: existing } = await supabase
      .from("booking_details" as any)
      .select("booking_number")
      .eq("booking_number", bookingNumber)
      .maybeSingle();

    if ((existing as any)) {
      // Merge: only update non-null fields
      const updates: any = {};
      for (const [k, v] of Object.entries(details)) {
        if (v !== null && v !== undefined && k !== "booking_number") {
          if (k === "extras" && Array.isArray(v)) {
            // Append new extras to existing
            const { data: currentRow } = await supabase
              .from("booking_details" as any)
              .select("extras")
              .eq("booking_number", bookingNumber)
              .single();
            const currentExtras = (currentRow as any)?.extras || [];
            const merged = [...currentExtras];
            for (const ext of v as any[]) {
              if (!merged.some((e: any) => e.label === ext.label)) {
                merged.push(ext);
              }
            }
            updates.extras = merged;
          } else {
            updates[k] = v;
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        await supabase
          .from("booking_details" as any)
          .update(updates)
          .eq("booking_number", bookingNumber);
      }
    } else {
      await supabase
        .from("booking_details" as any)
        .insert({ booking_number: bookingNumber, ...details });
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

  // --- Chat / AI logic (shared) ---

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
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const processAiResponse = async (
    result: any,
    files: AttachedFile[],
    onDone?: () => void,
  ) => {
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

      // Save rich details
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
        description: `${d.resort_or_trip} for ${d.client_name} (${d.booking_number}) — ${count} calendar events added.`,
      });
      fetchBookings();
    } else if (result.action === "add_to_booking") {
      const d = result.data;
      const clientSlug = slugify(d.client_name);

      for (const af of files) {
        const path = `${clientSlug}/${af.file.name}`;
        await supabase.storage.from("booking-documents").upload(path, af.file, { upsert: true });
      }

      // Merge new details
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
        description: `${files.length} file(s) added to booking ${d.booking_number}.${d.notes ? ` ${d.notes}` : ""}`,
      });
    } else {
      toast({
        title: "AI Response",
        description: result.message || "No action taken.",
      });
    }

    onDone?.();
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

  // --- In-booking chat ---

  const handleInBookingFileAttach = () => inBookingFileRef.current?.click();

  const handleInBookingFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttached: AttachedFile[] = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setInBookingFiles((prev) => [...prev, ...newAttached]);
    if (inBookingFileRef.current) inBookingFileRef.current.value = "";
  };

  const removeInBookingFile = (index: number) => {
    setInBookingFiles((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleInBookingSend = async () => {
    if (!selectedBooking) return;
    if (!inBookingMessage.trim() && inBookingFiles.length === 0) return;

    setInBookingProcessing(true);
    setInBookingStatus("Reading documents...");

    try {
      const filesPayload = await Promise.all(
        inBookingFiles.map(async (af) => ({
          name: af.file.name,
          mimeType: af.file.type,
          base64: await fileToBase64(af.file),
        }))
      );

      const contextMsg = `This is for existing booking ${selectedBooking.bookingNumber} (${selectedBooking.title}) for client ${selectedBooking.clientName}. ${inBookingMessage}`;

      setInBookingStatus("Analyzing with AI...");

      const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
        body: {
          message: contextMsg,
          files: filesPayload,
          existing_bookings: bookings,
          existing_clients: clientList,
        },
      });

      if (error) throw error;

      setInBookingStatus("Updating booking...");
      await processAiResponse(result, inBookingFiles, () => {
        // Re-open detail to refresh
        if (selectedBooking) openBookingDetail(selectedBooking);
      });

      setInBookingMessage("");
      setInBookingFiles([]);
    } catch (err: any) {
      console.error("In-booking AI error:", err);
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setInBookingProcessing(false);
      setInBookingStatus("");
    }
  };

  const handleInBookingKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleInBookingSend();
    }
  };

  // --- Render helpers ---

  const hasFlightDetails = bookingDetails?.flight_details &&
    typeof bookingDetails.flight_details === "object" &&
    (bookingDetails.flight_details.outbound || bookingDetails.flight_details.return);

  const hasPricing = bookingDetails?.pricing &&
    typeof bookingDetails.pricing === "object" &&
    (bookingDetails.pricing.total || bookingDetails.pricing.deposit);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Bookings</h1>
        <Button onClick={openNewBooking} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Manual Add
        </Button>
      </div>

      {/* Bookings Table */}
      <Card className="flex-1 min-h-0 overflow-auto mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2"><ClipboardList className="h-5 w-5" /> All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No bookings yet. Attach documents below or click "Manual Add".</p>
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
                  <TableRow
                    key={b.bookingNumber}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => openBookingDetail(b)}
                  >
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
                    <TableCell className="text-right"><Badge variant="secondary">{b.eventCount}</Badge></TableCell>
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
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={handleFileAttach}
            disabled={aiProcessing}
          >
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

      {/* Booking Detail Dialog — Trip Listing */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Header Banner */}
          <div className="bg-primary/5 border-b border-border px-6 pt-6 pb-5">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-display font-bold text-foreground leading-tight">
                  {bookingDetails?.resort_name || selectedBooking?.title}
                </h2>
                {selectedBooking && (
                  <Badge className="font-mono text-xs">{selectedBooking.bookingNumber}</Badge>
                )}
              </div>
              {(bookingDetails?.supplier || selectedBooking?.supplier) && (
                <p className="text-sm text-muted-foreground">
                  via <span className="font-medium text-foreground">{bookingDetails?.supplier || selectedBooking?.supplier}</span>
                </p>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                {selectedBooking?.tripStart && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      {format(new Date(selectedBooking.tripStart), "MMMM d")}
                      {selectedBooking.tripEnd
                        ? ` – ${format(new Date(selectedBooking.tripEnd), "MMMM d, yyyy")}`
                        : `, ${format(new Date(selectedBooking.tripStart), "yyyy")}`}
                    </span>
                  </div>
                )}
                {bookingDetails?.destination && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{bookingDetails.destination}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {detailLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="px-6 py-5 space-y-6">

                {/* Trip Overview Card */}
                <div className="rounded-lg border border-border bg-card">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Hotel className="h-4 w-4 text-primary" /> Trip Overview
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    <DetailRow label="Client" value={
                      <div>
                        <p>{bookingDetails?.client_name || selectedBooking?.clientName}</p>
                        {(bookingDetails?.client_email || selectedBooking?.clientEmail) && (
                          <p className="text-xs text-muted-foreground font-normal">{bookingDetails?.client_email || selectedBooking?.clientEmail}</p>
                        )}
                      </div>
                    } />
                    <DetailRow label="Booking #" value={<span className="font-mono">{selectedBooking?.bookingNumber}</span>} />
                    <DetailRow label="Supplier" value={bookingDetails?.supplier || selectedBooking?.supplier} />
                    {bookingDetails?.destination && (
                      <DetailRow label="Destination" value={bookingDetails.destination} icon={<MapPin className="h-3 w-3" />} />
                    )}
                    {bookingDetails?.room_type && (
                      <DetailRow label="Room Type" value={bookingDetails.room_type} />
                    )}
                    {bookingDetails?.num_travellers && (
                      <DetailRow label="Travellers" value={
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{bookingDetails.num_travellers}</span>
                        </div>
                      } />
                    )}
                    {/* Extras */}
                    {bookingDetails?.extras && Array.isArray(bookingDetails.extras) && bookingDetails.extras.length > 0 && (
                      bookingDetails.extras.map((ext: any, i: number) => (
                        <DetailRow key={i} label={ext.label} value={ext.value} icon={<Tag className="h-3 w-3" />} />
                      ))
                    )}
                    {/* Notes from events */}
                    {detailEvents.some(e => e.notes) && (
                      <DetailRow label="Notes" value={
                        <p className="text-muted-foreground font-normal">{detailEvents.find(e => e.notes)?.notes}</p>
                      } />
                    )}
                  </div>
                </div>

                {/* Flight Details Card */}
                {hasFlightDetails && (
                  <div className="rounded-lg border border-border bg-card">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Plane className="h-4 w-4 text-primary" /> Flight Details
                      </h3>
                    </div>
                    <div className="px-4 py-4 space-y-4">
                      <FlightLeg label="Outbound" leg={bookingDetails!.flight_details.outbound} />
                      <FlightLeg label="Return" leg={bookingDetails!.flight_details.return} />
                    </div>
                  </div>
                )}

                {/* Pricing Card */}
                {hasPricing && (
                  <div className="rounded-lg border border-border bg-card">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" /> Pricing
                      </h3>
                    </div>
                    <div className="divide-y divide-border">
                      {bookingDetails!.pricing.total && (
                        <DetailRow label="Total" value={
                          <span className="text-lg font-bold">
                            {bookingDetails!.pricing.currency || "$"}{Number(bookingDetails!.pricing.total).toLocaleString()}
                          </span>
                        } />
                      )}
                      {bookingDetails!.pricing.deposit && (
                        <DetailRow label="Deposit" value={`${bookingDetails!.pricing.currency || "$"}${Number(bookingDetails!.pricing.deposit).toLocaleString()}`} />
                      )}
                      {bookingDetails!.pricing.taxes && (
                        <DetailRow label="Taxes / Fees" value={`${bookingDetails!.pricing.currency || "$"}${Number(bookingDetails!.pricing.taxes).toLocaleString()}`} />
                      )}
                      {bookingDetails!.pricing.per_person && (
                        <DetailRow label="Per Person" value={`${bookingDetails!.pricing.currency || "$"}${Number(bookingDetails!.pricing.per_person).toLocaleString()}`} />
                      )}
                    </div>
                  </div>
                )}

                {/* Events Timeline */}
                <div>
                  <h3 className="text-sm font-semibold mb-4">Events Timeline</h3>
                  {detailEvents.length > 0 ? (
                    <div className="relative pl-6">
                      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                      <div className="space-y-0">
                        {detailEvents.map((event) => (
                          <div key={event.id} className="relative flex items-start gap-4 pb-5 last:pb-0">
                            <button
                              onClick={() => toggleEventCompletion(event)}
                              className="absolute -left-6 top-0.5 z-10 shrink-0"
                            >
                              {event.is_completed ? (
                                <CheckCircle2 className="h-[18px] w-[18px] text-primary" />
                              ) : (
                                <Circle className="h-[18px] w-[18px] text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </button>
                            <div className="flex-1 flex items-start justify-between gap-3 min-w-0">
                              <div className="min-w-0">
                                <span className={cn(
                                  "text-sm font-medium",
                                  event.is_completed && "line-through text-muted-foreground"
                                )}>
                                  {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                                </span>
                                {event.notes && (
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.notes}</p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                                {format(new Date(event.event_date), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No events found.</p>
                  )}
                </div>

                {/* Documents & Images */}
                <div>
                  <h3 className="text-sm font-semibold mb-4">Documents & Photos</h3>
                  {detailDocuments.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const imageFiles = detailDocuments.filter((doc) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(doc.name));
                        if (imageFiles.length === 0) return null;
                        return (
                          <div className={cn(
                            "grid gap-3",
                            imageFiles.length === 1 ? "grid-cols-1" : "grid-cols-2"
                          )}>
                            {imageFiles.map((doc, i) => (
                              <button
                                key={i}
                                onClick={() => selectedBooking && getSignedUrl(doc.name, selectedBooking.clientName)}
                                className="group relative rounded-xl overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all aspect-[4/3]"
                              >
                                <img
                                  src={doc.url}
                                  alt={doc.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <span className="text-xs text-white font-medium truncate block">{doc.name}</span>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="bg-black/50 rounded-full p-1.5">
                                    <Download className="h-3.5 w-3.5 text-white" />
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                      {detailDocuments
                        .filter((doc) => !/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(doc.name))
                        .map((doc, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                            <span className="text-sm flex-1 truncate font-medium">{doc.name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0 gap-1.5"
                              onClick={() => selectedBooking && getSignedUrl(doc.name, selectedBooking.clientName)}
                            >
                              <Download className="h-3.5 w-3.5" /> Download
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 rounded-lg border border-dashed border-border">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                    </div>
                  )}
                </div>

                {/* In-Booking Chat Input */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Add More Info</h3>
                  <div className="border border-border rounded-xl bg-muted/30 p-3 space-y-2">
                    {inBookingFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {inBookingFiles.map((af, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-background rounded-lg px-2.5 py-1.5 text-xs">
                            {af.preview ? (
                              <img src={af.preview} alt="" className="h-6 w-6 rounded object-cover" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="max-w-[120px] truncate">{af.file.name}</span>
                            <button onClick={() => removeInBookingFile(i)} className="text-muted-foreground hover:text-foreground">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {inBookingProcessing && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{inBookingStatus}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        ref={inBookingFileRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleInBookingFilesSelected}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-9 w-9"
                        onClick={handleInBookingFileAttach}
                        disabled={inBookingProcessing}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        value={inBookingMessage}
                        onChange={(e) => setInBookingMessage(e.target.value)}
                        onKeyDown={handleInBookingKeyDown}
                        placeholder="Add flight change, extra docs, notes..."
                        className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
                        disabled={inBookingProcessing}
                      />
                      <Button
                        size="icon"
                        className="shrink-0 h-9 w-9"
                        onClick={handleInBookingSend}
                        disabled={inBookingProcessing || (!inBookingMessage.trim() && inBookingFiles.length === 0)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
                        This will permanently remove all {detailEvents.length} calendar events for booking {selectedBooking?.bookingNumber}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteBooking} disabled={deletingBooking}>
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

export default BookingManager;
