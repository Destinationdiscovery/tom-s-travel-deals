import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarIcon, MapPin, Plane, DollarSign, Users, Hotel, Tag, RefreshCw, Loader2, CheckCircle2, Circle, FileText, Download, Trash2, Paperclip, Send, X, Image as ImageIcon, Anchor, Ship, CreditCard, User, Waves, Clock, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

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
  // New cruise fields
  itinerary: any[];
  passengers: any[];
  payment_history: any[];
  agency: string | null;
  booking_agent: string | null;
  cabin_number: string | null;
  cabin_category: string | null;
  deck: string | null;
  bed_configuration: string | null;
  rate_code: string | null;
  ship_name: string | null;
  cruise_line_booking_number: string | null;
  balance_due: number | null;
  balance_due_date: string | null;
  duration_nights: number | null;
  booking_status: string | null;
}

interface StorageFile {
  name: string;
  url: string;
}

interface AttachedFile {
  file: File;
  preview?: string;
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

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const NEW_FIELDS = [
  "itinerary", "passengers", "payment_history", "agency", "booking_agent",
  "cabin_number", "cabin_category", "deck", "bed_configuration", "rate_code",
  "ship_name", "cruise_line_booking_number", "balance_due", "balance_due_date",
  "duration_nights", "booking_status", "trip_group_id",
] as const;

/* ─── Sub-components ─── */

const FlightLeg = ({ label, leg }: { label: string; leg: any }) => {
  if (!leg) return null;
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <p className="text-lg font-bold">{leg.departure_airport || "—"}</p>
          <p className="text-xs text-muted-foreground">{leg.departure_time || ""}</p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <Plane className="h-4 w-4 text-primary shrink-0" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <span className="text-[11px] text-muted-foreground">{leg.airline} {leg.flight_number}</span>
        </div>
        <div>
          <p className="text-lg font-bold">{leg.arrival_airport || "—"}</p>
          <p className="text-xs text-muted-foreground">{leg.arrival_time || ""}</p>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="grid grid-cols-[140px_1fr] px-4 py-3">
    <span className="text-xs text-muted-foreground uppercase tracking-wider self-center flex items-center gap-1.5">
      {icon}
      {label}
    </span>
    <div className="text-sm font-medium">{value || "—"}</div>
  </div>
);

const maskPassport = (num: string) => {
  if (!num || num.length <= 4) return num;
  return "•".repeat(num.length - 4) + num.slice(-4);
};

/* ─── Edit Passenger Dialog ─── */
const EditPassengerDialog = ({ open, onOpenChange, passenger, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; passenger: any; onSave: (data: any) => void }) => {
  const [form, setForm] = useState({ ...passenger });
  useEffect(() => { if (open) setForm({ ...passenger }); }, [open, passenger]);
  const set = (k: string, v: string) => setForm((prev: any) => ({ ...prev, [k]: v }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Passenger</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {[
            { key: "name", label: "Full Name" },
            { key: "dob", label: "Date of Birth" },
            { key: "citizenship", label: "Citizenship" },
            { key: "passport_number", label: "Passport Number" },
            { key: "passport_expiry", label: "Passport Expiry" },
            { key: "traveller_type", label: "Traveller Type" },
            { key: "gender", label: "Gender" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input value={form[key] || ""} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave(form); onOpenChange(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Passenger Card ─── */
const PassengerCard = ({ p, index, onEdit, onDelete }: { p: any; index: number; onEdit?: () => void; onDelete?: () => void }) => (
  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">{p.name}</p>
          {p.traveller_type && <span className="text-[11px] text-muted-foreground">{p.traveller_type}{p.gender ? ` (${p.gender})` : ""}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {p.citizenship && (
          <Badge variant="outline" className="text-[11px] gap-1 mr-1">
            🌐 {p.citizenship}
          </Badge>
        )}
        {onEdit && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        )}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
      {p.dob && (
        <>
          <span className="text-muted-foreground">Date of Birth</span>
          <span className="font-medium">{p.dob}{p.age ? ` (${p.age})` : ""}</span>
        </>
      )}
      {p.passport_number && (
        <>
          <span className="text-muted-foreground">Passport</span>
          <span className="font-mono font-medium">{maskPassport(p.passport_number)}</span>
        </>
      )}
      {p.passport_expiry && (
        <>
          <span className="text-muted-foreground">Expires</span>
          <span className="font-medium">{p.passport_expiry}</span>
        </>
      )}
    </div>
    {p.options && p.options.length > 0 && (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {p.options.map((opt: string, i: number) => (
          <Badge key={i} variant="secondary" className="text-[10px] font-normal">{opt}</Badge>
        ))}
      </div>
    )}
  </div>
);

/* ─── Itinerary Timeline ─── */
const ItineraryTimeline = ({ itinerary }: { itinerary: any[] }) => (
  <div className="space-y-0">
    {itinerary.map((stop, i) => {
      const isSeaDay = stop.port?.toUpperCase().includes("AT SEA");
      return (
        <div key={i} className="flex gap-4 group">
          {/* Day number column */}
          <div className="w-14 shrink-0 text-right pt-3">
            <span className="text-[11px] font-bold text-muted-foreground">Day {i + 1}</span>
          </div>
          {/* Timeline dot & line */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-3 w-3 rounded-full mt-4 shrink-0 border-2",
              isSeaDay ? "border-muted-foreground bg-background" : "border-primary bg-primary"
            )} />
            {i < itinerary.length - 1 && <div className="w-px flex-1 bg-border" />}
          </div>
          {/* Content */}
          <div className={cn(
            "flex-1 py-3 pr-2",
            i < itinerary.length - 1 && "border-b border-border/50"
          )}>
            <p className="text-[11px] text-muted-foreground">{stop.date}</p>
            <p className={cn(
              "text-sm font-semibold mt-0.5 flex items-center gap-1.5",
              isSeaDay && "text-muted-foreground italic"
            )}>
              {isSeaDay && <Waves className="h-3.5 w-3.5" />}
              {stop.port}
            </p>
            {(!isSeaDay && (stop.arrival || stop.departure)) && (
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                {stop.arrival && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Arrive {stop.arrival}</span>}
                {stop.departure && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Depart {stop.departure}</span>}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

/* ─── Main Page ─── */

const BookingReport = () => {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [events, setEvents] = useState<Tables<"bookings">[]>([]);
  const [documents, setDocuments] = useState<StorageFile[]>([]);
  const [siblingCabins, setSiblingCabins] = useState<BookingDetails[]>([]);
  const [rescanning, setRescanning] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState(false);

  // Passenger edit/delete
  const [editingPassenger, setEditingPassenger] = useState<{ index: number; data: any } | null>(null);
  const [deletePassengerIndex, setDeletePassengerIndex] = useState<number | null>(null);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Chat
  const [chatMessage, setChatMessage] = useState("");
  const [chatFiles, setChatFiles] = useState<AttachedFile[]>([]);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatStatus, setChatStatus] = useState("");
  const chatFileRef = useRef<HTMLInputElement>(null);

  // Derived
  const clientName = bookingDetails?.client_name || events[0]?.client_name || "";
  const clientEmail = bookingDetails?.client_email || events[0]?.client_email || "";
  const supplier = bookingDetails?.supplier || events[0]?.supplier || "";
  const resortName = bookingDetails?.resort_name || events[0]?.title?.replace(/ - (Booked|Deposit Due|Final Payment|Trip Start|Trip End|Departure|Return)$/, "") || "";
  const tripStart = events.find(e => e.event_type === "trip_start")?.event_date;
  const tripEnd = events.find(e => e.event_type === "trip_end")?.event_date;

  const hasFlightDetails = bookingDetails?.flight_details &&
    typeof bookingDetails.flight_details === "object" &&
    (bookingDetails.flight_details.outbound || bookingDetails.flight_details.return);

  const hasPricing = bookingDetails?.pricing &&
    typeof bookingDetails.pricing === "object" &&
    (bookingDetails.pricing.total || bookingDetails.pricing.deposit);

  const hasItinerary = bookingDetails?.itinerary && Array.isArray(bookingDetails.itinerary) && bookingDetails.itinerary.length > 0;
  const hasPassengers = bookingDetails?.passengers && Array.isArray(bookingDetails.passengers) && bookingDetails.passengers.length > 0;
  const hasPaymentHistory = bookingDetails?.payment_history && Array.isArray(bookingDetails.payment_history) && bookingDetails.payment_history.length > 0;

  const imageFiles = documents.filter(d => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.name));
  const otherFiles = documents.filter(d => !/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.name));

  useEffect(() => {
    if (bookingNumber) fetchAll();
  }, [bookingNumber]);

  useEffect(() => {
    if (resortName) {
      document.title = `${resortName} — Trip Report`;
    }
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
  }, [resortName]);

  const fetchAll = async () => {
    if (!bookingNumber) return;
    setLoading(true);

    const [eventsResult, detailsResult] = await Promise.all([
      supabase.from("bookings").select("*").eq("booking_number", bookingNumber).order("event_date", { ascending: true }),
      supabase.from("booking_details" as any).select("*").eq("booking_number", bookingNumber).maybeSingle(),
    ]);

    if (eventsResult.data) {
      const sorted = [...eventsResult.data].sort((a, b) => EVENT_TYPE_ORDER.indexOf(a.event_type) - EVENT_TYPE_ORDER.indexOf(b.event_type));
      setEvents(sorted);

      const cName = (detailsResult as any)?.data?.client_name || eventsResult.data[0]?.client_name;
      if (cName) {
        const clientSlug = slugify(cName);
        const { data: fileList } = await supabase.storage.from("booking-documents").list(clientSlug, { limit: 100 });
        if (fileList && fileList.length > 0) {
          const validFiles = fileList.filter(f => f.name !== ".emptyFolderPlaceholder");
          const signedResults = await Promise.all(
            validFiles.map(f => supabase.storage.from("booking-documents").createSignedUrl(`${clientSlug}/${f.name}`, 3600))
          );
          setDocuments(validFiles.map((f, i) => ({ name: f.name, url: signedResults[i].data?.signedUrl || "" })).filter(f => f.url));
        }
      }
    }

    if ((detailsResult as any)?.data) {
      const details = (detailsResult as any).data as BookingDetails;
      setBookingDetails(details);

      // Fetch sibling cabins if part of a trip group
      const tripGroupId = (details as any).trip_group_id;
      if (tripGroupId) {
        const { data: siblings } = await supabase
          .from("booking_details" as any)
          .select("*")
          .eq("trip_group_id", tripGroupId)
          .neq("booking_number", bookingNumber);
        if ((siblings as any)?.length) {
          setSiblingCabins((siblings as any) as BookingDetails[]);
        }
      } else {
        setSiblingCabins([]);
      }
    }

    setLoading(false);
  };

  const toggleEventCompletion = async (event: Tables<"bookings">) => {
    const newValue = !event.is_completed;
    await supabase.from("bookings").update({ is_completed: newValue }).eq("id", event.id);
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_completed: newValue } : e));
  };

  // Smart array merge helpers
  const mergeByKey = (existing: any[], incoming: any[], keyFn: (item: any) => string): any[] => {
    const merged = [...existing];
    for (const item of incoming) {
      const key = keyFn(item);
      const idx = merged.findIndex(e => keyFn(e) === key);
      if (idx >= 0) merged[idx] = { ...merged[idx], ...item };
      else merged.push(item);
    }
    return merged;
  };

  const upsertBookingDetails = async (bn: string, details: Record<string, any>) => {
    const { data: existing } = await supabase.from("booking_details" as any).select("*").eq("booking_number", bn).maybeSingle();
    if ((existing as any)) {
      const current = existing as any;
      const updates: any = {};
      for (const [k, v] of Object.entries(details)) {
        if (v !== null && v !== undefined && k !== "booking_number") {
          if (k === "extras" && Array.isArray(v)) {
            updates.extras = mergeByKey(current.extras || [], v, (e: any) => e.label || "");
          } else if (k === "passengers" && Array.isArray(v)) {
            updates.passengers = mergeByKey(current.passengers || [], v, (p: any) => (p.name || "").toLowerCase().trim());
          } else if (k === "itinerary" && Array.isArray(v)) {
            updates.itinerary = mergeByKey(current.itinerary || [], v, (i: any) => `${i.date}|${i.port}`);
          } else if (k === "payment_history" && Array.isArray(v)) {
            updates.payment_history = mergeByKey(current.payment_history || [], v, (p: any) => `${p.date}|${p.amount}`);
          } else {
            updates[k] = v;
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from("booking_details" as any).update(updates).eq("booking_number", bn);
      }
    } else {
      await supabase.from("booking_details" as any).insert({ booking_number: bn, ...details });
    }
  };

  // Build merge data from AI response, including new fields
  const buildMergeData = (d: any): Record<string, any> => {
    const mergeData: Record<string, any> = {};
    if (d.destination) mergeData.destination = d.destination;
    if (d.room_type) mergeData.room_type = d.room_type;
    if (d.num_travellers) mergeData.num_travellers = d.num_travellers;
    if (d.flight_details) mergeData.flight_details = d.flight_details;
    if (d.pricing) mergeData.pricing = d.pricing;
    if (d.extras) mergeData.extras = d.extras;
    if (d.supplier) mergeData.supplier = d.supplier;
    if (d.client_name) mergeData.client_name = d.client_name;
    if (d.client_email) mergeData.client_email = d.client_email;
    if (d.resort_or_trip || d.resort_name) mergeData.resort_name = d.resort_or_trip || d.resort_name;
    // New fields
    for (const field of NEW_FIELDS) {
      if (d[field] !== undefined && d[field] !== null) {
        mergeData[field] = d[field];
      }
    }
    return mergeData;
  };

  // Re-scan
  const rescanDocuments = async () => {
    if (!bookingNumber || !clientName) return;
    setRescanning(true);
    try {
      const clientSlug = slugify(clientName);
      const { data: fileList } = await supabase.storage.from("booking-documents").list(clientSlug, { limit: 100 });
      const validFiles = (fileList || []).filter(f => f.name !== ".emptyFolderPlaceholder");
      if (validFiles.length === 0) {
        toast({ title: "No documents", description: "No files found to re-scan.", variant: "destructive" });
        setRescanning(false);
        return;
      }

      const filesPayload = [];
      for (const f of validFiles) {
        const { data: blob } = await supabase.storage.from("booking-documents").download(`${clientSlug}/${f.name}`);
        if (!blob) continue;
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        filesPayload.push({ name: f.name, mimeType: f.metadata?.mimetype || (f.name.match(/\.(pdf)$/i) ? "application/pdf" : "image/jpeg"), base64 });
      }

      const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
        body: {
          message: `Extract all booking details from these documents for existing booking ${bookingNumber} (${resortName}) for client ${clientName}. Use the add_to_booking tool.`,
          files: filesPayload,
          existing_bookings: [],
          existing_clients: [],
        },
      });
      if (error) throw error;

      // Process all actions (multi-cabin support)
      const actions = result?.actions || (result?.action ? [{ action: result.action, data: result.data }] : []);
      if (actions.length > 0) {
        for (const act of actions) {
          await upsertBookingDetails(act.data.booking_number || bookingNumber, buildMergeData(act.data));
        }
        toast({ title: "Re-scan complete!", description: "Booking details have been updated." });
        await fetchAll();
      } else {
        toast({ title: "No details extracted", description: result?.message || "AI couldn't extract structured data." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Re-scan failed.", variant: "destructive" });
    } finally {
      setRescanning(false);
    }
  };

  // Delete
  const handleDeleteBooking = async () => {
    if (!bookingNumber) return;
    setDeletingBooking(true);
    await supabase.from("booking_details" as any).delete().eq("booking_number", bookingNumber);
    const { error } = await supabase.from("bookings").delete().eq("booking_number", bookingNumber);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking deleted" });
      navigate(-1);
    }
    setDeletingBooking(false);
  };

  // Passenger edit/delete handlers
  const handleEditPassenger = async (index: number, updatedData: any) => {
    if (!bookingDetails || !bookingNumber) return;
    const updatedPassengers = [...bookingDetails.passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], ...updatedData };
    await supabase.from("booking_details" as any).update({ passengers: updatedPassengers }).eq("booking_number", bookingNumber);
    setBookingDetails({ ...bookingDetails, passengers: updatedPassengers });
    toast({ title: "Passenger updated", description: `${updatedData.name} has been updated.` });
  };

  const handleDeletePassenger = async (index: number) => {
    if (!bookingDetails || !bookingNumber) return;
    const removed = bookingDetails.passengers[index];
    const updatedPassengers = bookingDetails.passengers.filter((_: any, i: number) => i !== index);
    await supabase.from("booking_details" as any).update({ passengers: updatedPassengers }).eq("booking_number", bookingNumber);
    setBookingDetails({ ...bookingDetails, passengers: updatedPassengers });
    setDeletePassengerIndex(null);
    toast({ title: "Passenger removed", description: `${removed?.name || "Passenger"} has been removed.` });
  };

  // Chat
  const handleChatFileAttach = () => chatFileRef.current?.click();
  const handleChatFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setChatFiles(prev => [...prev, ...files.map(file => ({ file, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined }))]);
    if (chatFileRef.current) chatFileRef.current.value = "";
  };
  const removeChatFile = (index: number) => {
    setChatFiles(prev => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleChatSend = async () => {
    if (!bookingNumber || (!chatMessage.trim() && chatFiles.length === 0)) return;
    setChatProcessing(true);
    setChatStatus("Reading documents...");
    try {
      const filesPayload = await Promise.all(chatFiles.map(async af => ({
        name: af.file.name, mimeType: af.file.type, base64: await fileToBase64(af.file),
      })));

      const contextMsg = `This is for existing booking ${bookingNumber} (${resortName}) for client ${clientName}. ${chatMessage}`;
      setChatStatus("Analyzing with AI...");

      const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
        body: { message: contextMsg, files: filesPayload, existing_bookings: [], existing_clients: [] },
      });
      if (error) throw error;

      // Process all actions (multi-cabin support)
      const actions = result?.actions || (result?.action ? [{ action: result.action, data: result.data }] : []);
      if (actions.length > 0) {
        for (const act of actions) {
          const d = act.data;
          const cs = slugify(d.client_name || clientName);
          for (const af of chatFiles) {
            await supabase.storage.from("booking-documents").upload(`${cs}/${af.file.name}`, af.file, { upsert: true });
          }
          const mergeData = buildMergeData(d);
          if (Object.keys(mergeData).length > 0) {
            await upsertBookingDetails(d.booking_number || bookingNumber, mergeData);
          }
        }
        toast({ title: "Booking updated!", description: `${chatFiles.length} file(s) added.` });
        await fetchAll();
      } else {
        toast({ title: "AI Response", description: result?.message || "No action taken." });
      }

      setChatMessage("");
      setChatFiles([]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setChatProcessing(false);
      setChatStatus("");
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); }
  };

  const getSignedUrl = async (fileName: string) => {
    const clientSlug = slugify(clientName);
    const { data } = await supabase.storage.from("booking-documents").createSignedUrl(`${clientSlug}/${fileName}`, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  // Pricing helpers
  const pricingTotal = hasPricing ? Number(bookingDetails!.pricing.total) || 0 : 0;
  const pricingDeposit = hasPricing ? Number(bookingDetails!.pricing.deposit) || 0 : 0;
  const depositPercent = pricingTotal > 0 ? Math.round((pricingDeposit / pricingTotal) * 100) : 0;
  const balanceDue = bookingDetails?.balance_due ? Number(bookingDetails.balance_due) : (pricingTotal - pricingDeposit > 0 ? pricingTotal - pricingDeposit : 0);
  const currency = hasPricing ? bookingDetails!.pricing.currency || "CA$" : "CA$";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-24 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Booking not found</h1>
            <p className="text-muted-foreground mb-6">No booking found with number "{bookingNumber}".</p>
            <Button onClick={() => navigate(-1)} variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="pt-20 flex-1 pb-24">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-6 max-w-6xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* Header Banner */}
        <div className="container mx-auto px-4 max-w-6xl mt-4 mb-8">
          <div className="rounded-2xl bg-primary/5 border border-border p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {bookingDetails?.ship_name && (
                    <div className="flex items-center gap-1.5 text-primary">
                      <Ship className="h-5 w-5" />
                    </div>
                  )}
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    {bookingDetails?.ship_name ? `${bookingDetails.ship_name} — ` : ""}{resortName}
                  </h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {supplier && (
                    <Badge variant="outline" className="text-xs">{supplier}</Badge>
                  )}
                  <Badge className="font-mono text-xs">{bookingNumber}</Badge>
                  {bookingDetails?.cruise_line_booking_number && (
                    <Badge variant="secondary" className="font-mono text-xs">{bookingDetails.cruise_line_booking_number}</Badge>
                  )}
                  {bookingDetails?.booking_status && (
                    <Badge variant="default" className="text-xs">{bookingDetails.booking_status}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {tripStart && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {format(new Date(tripStart), "MMMM d")}
                        {tripEnd ? ` – ${format(new Date(tripEnd), "MMMM d, yyyy")}` : `, ${format(new Date(tripStart), "yyyy")}`}
                      </span>
                    </div>
                  )}
                  {bookingDetails?.destination && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{bookingDetails.destination}</span>
                    </div>
                  )}
                  {bookingDetails?.duration_nights && (
                    <span className="text-sm text-muted-foreground">{bookingDetails.duration_nights} nights</span>
                  )}
                </div>
              </div>
              {documents.length > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={rescanDocuments} disabled={rescanning}>
                  {rescanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {rescanning ? "Scanning..." : "Re-scan Docs"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Trip Overview Card */}
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-primary" /> Trip Overview
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  <DetailRow label="Client" value={
                    <div>
                      <p>{clientName}</p>
                      {clientEmail && <p className="text-xs text-muted-foreground font-normal">{clientEmail}</p>}
                    </div>
                  } />
                  {bookingDetails?.agency && <DetailRow label="Agency" value={bookingDetails.agency} />}
                  {bookingDetails?.booking_agent && <DetailRow label="Agent" value={bookingDetails.booking_agent} />}
                  {bookingDetails?.cabin_category && <DetailRow label="Cabin" value={
                    <span>{bookingDetails.cabin_category}{bookingDetails.cabin_number ? ` — ${bookingDetails.cabin_number}` : ""}</span>
                  } />}
                  {bookingDetails?.deck && <DetailRow label="Deck" value={bookingDetails.deck} />}
                  {bookingDetails?.bed_configuration && <DetailRow label="Bed Config" value={bookingDetails.bed_configuration} />}
                  {bookingDetails?.rate_code && <DetailRow label="Rate Code" value={bookingDetails.rate_code} />}
                  {bookingDetails?.room_type && !bookingDetails?.cabin_category && <DetailRow label="Room Type" value={bookingDetails.room_type} />}
                  {bookingDetails?.num_travellers && (
                    <DetailRow label="Travellers" value={
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{bookingDetails.num_travellers}</span>
                      </div>
                    } />
                  )}
                  {bookingDetails?.extras && Array.isArray(bookingDetails.extras) && bookingDetails.extras.length > 0 && (
                    <div className="px-4 py-3">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Extras</span>
                      <div className="flex flex-wrap gap-2">
                        {bookingDetails.extras.map((ext: any, i: number) => (
                          <Badge key={i} variant="secondary" className="gap-1">
                            <Tag className="h-3 w-3" /> {ext.label}: {ext.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {events.some(e => e.notes) && (
                    <DetailRow label="Notes" value={
                      <p className="text-muted-foreground font-normal">{events.find(e => e.notes)?.notes}</p>
                    } />
                  )}
                </div>
              </Card>

              {/* Passengers Card */}
              {hasPassengers && (
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Passengers
                    </h3>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    {bookingDetails!.passengers.map((p: any, i: number) => (
                      <PassengerCard
                        key={i}
                        p={p}
                        index={i}
                        onEdit={() => setEditingPassenger({ index: i, data: p })}
                        onDelete={() => setDeletePassengerIndex(i)}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Port-by-Port Itinerary Card */}
              {hasItinerary && (
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Anchor className="h-4 w-4 text-primary" /> Port-by-Port Itinerary
                    </h3>
                  </div>
                  <CardContent className="p-5">
                    <ItineraryTimeline itinerary={bookingDetails!.itinerary} />
                  </CardContent>
                </Card>
              )}

              {/* Flight Details Card */}
              {hasFlightDetails && (
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Plane className="h-4 w-4 text-primary" /> Flight Itinerary
                    </h3>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <FlightLeg label="Outbound" leg={bookingDetails!.flight_details.outbound} />
                    <FlightLeg label="Return" leg={bookingDetails!.flight_details.return} />
                  </CardContent>
                </Card>
              )}

              {/* Events Timeline Card */}
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" /> Events Timeline
                  </h3>
                </div>
                <CardContent className="p-5">
                  {events.length > 0 ? (
                    <div className="relative pl-6">
                      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                      <div className="space-y-0">
                        {events.map(event => (
                          <div key={event.id} className="relative flex items-start gap-4 pb-5 last:pb-0">
                            <button onClick={() => toggleEventCompletion(event)} className="absolute -left-6 top-0.5 z-10 shrink-0">
                              {event.is_completed
                                ? <CheckCircle2 className="h-[18px] w-[18px] text-primary" />
                                : <Circle className="h-[18px] w-[18px] text-muted-foreground hover:text-primary transition-colors" />}
                            </button>
                            <div className="flex-1 flex items-start justify-between gap-3 min-w-0">
                              <div className="min-w-0">
                                <span className={cn("text-sm font-medium", event.is_completed && "line-through text-muted-foreground")}>
                                  {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                                </span>
                                {event.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.notes}</p>}
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
                </CardContent>
              </Card>

              {/* Documents & Photos Card */}
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" /> Documents & Photos
                  </h3>
                </div>
                <CardContent className="p-5">
                  {documents.length > 0 ? (
                    <div className="space-y-4">
                      {imageFiles.length > 0 && (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {imageFiles.map((doc, i) => (
                            <button
                              key={i}
                              onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                              className="group relative rounded-xl overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <img src={doc.url} alt={doc.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-white font-medium truncate block">{doc.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {otherFiles.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <span className="text-sm flex-1 truncate font-medium">{doc.name}</span>
                          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => getSignedUrl(doc.name)}>
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 rounded-lg border border-dashed border-border">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Facts */}
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Quick Facts</h3>
                </div>
                <div className="divide-y divide-border">
                  <DetailRow label="Booking #" value={<span className="font-mono">{bookingNumber}</span>} />
                  {bookingDetails?.cruise_line_booking_number && (
                    <DetailRow label="Cruise Line Ref" value={<span className="font-mono">{bookingDetails.cruise_line_booking_number}</span>} />
                  )}
                  {supplier && <DetailRow label="Supplier" value={supplier} />}
                  {bookingDetails?.ship_name && <DetailRow label="Ship" value={bookingDetails.ship_name} icon={<Ship className="h-3 w-3" />} />}
                  {bookingDetails?.destination && <DetailRow label="Destination" value={bookingDetails.destination} icon={<MapPin className="h-3 w-3" />} />}
                  {(bookingDetails?.cabin_category || bookingDetails?.room_type) && (
                    <DetailRow label="Cabin / Room" value={bookingDetails.cabin_category || bookingDetails.room_type} />
                  )}
                  {bookingDetails?.deck && <DetailRow label="Deck" value={bookingDetails.deck} />}
                  {bookingDetails?.duration_nights && <DetailRow label="Duration" value={`${bookingDetails.duration_nights} nights`} />}
                  {bookingDetails?.num_travellers && <DetailRow label="Travellers" value={`${bookingDetails.num_travellers}`} icon={<Users className="h-3 w-3" />} />}
                  {tripStart && (
                    <DetailRow label="Dates" value={
                      <span>
                        {format(new Date(tripStart), "MMM d")}
                        {tripEnd ? ` – ${format(new Date(tripEnd), "MMM d, yyyy")}` : `, ${format(new Date(tripStart), "yyyy")}`}
                      </span>
                    } icon={<CalendarIcon className="h-3 w-3" />} />
                  )}
                </div>
              </Card>

              {/* Pricing Card */}
              {hasPricing && (
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" /> Pricing
                    </h3>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    {pricingTotal > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                        <p className="text-3xl font-bold font-display">
                          {currency}{pricingTotal.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {pricingDeposit > 0 && pricingTotal > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>Deposit Paid</span>
                          <span>{currency}{pricingDeposit.toLocaleString()} ({depositPercent}%)</span>
                        </div>
                        <Progress value={depositPercent} className="h-2.5" />
                      </div>
                    )}
                    {balanceDue > 0 && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-center">
                        <p className="text-xs text-destructive uppercase tracking-wider font-semibold mb-1">Balance Due</p>
                        <p className="text-xl font-bold text-destructive">{currency}{balanceDue.toLocaleString()}</p>
                        {bookingDetails?.balance_due_date && (
                          <p className="text-xs text-destructive/80 mt-1">Due by {bookingDetails.balance_due_date}</p>
                        )}
                      </div>
                    )}
                    <Separator />
                    <div className="space-y-2">
                      {bookingDetails!.pricing.taxes && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taxes / Fees</span>
                          <span className="font-medium">{currency}{Number(bookingDetails!.pricing.taxes).toLocaleString()}</span>
                        </div>
                      )}
                      {bookingDetails!.pricing.per_person && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Per Person</span>
                          <span className="font-medium">{currency}{Number(bookingDetails!.pricing.per_person).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment History Card */}
              {hasPaymentHistory && (
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Payment History
                    </h3>
                  </div>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs text-right">Amount</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingDetails!.payment_history.map((p: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs py-2">{p.date}</TableCell>
                            <TableCell className="text-xs py-2">{p.type || "—"}</TableCell>
                            <TableCell className="text-xs py-2 text-right font-medium">{p.amount}</TableCell>
                            <TableCell className="py-2">
                              <Badge variant={p.status?.toLowerCase() === "processed" ? "default" : "secondary"} className="text-[10px]">
                                {p.status || "—"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Other Cabins in This Trip */}
              {siblingCabins.length > 0 && (
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Ship className="h-4 w-4 text-primary" /> Other Cabins in This Trip
                    </h3>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    {siblingCabins.map((cabin) => (
                      <button
                        key={cabin.booking_number}
                        onClick={() => navigate(`/booking/${encodeURIComponent(cabin.booking_number)}`)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold font-mono">{cabin.booking_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {cabin.cabin_category || cabin.room_type || "Cabin"}
                              {cabin.deck ? ` · Deck ${cabin.deck}` : ""}
                              {cabin.num_travellers ? ` · ${cabin.num_travellers} traveller${cabin.num_travellers > 1 ? "s" : ""}` : ""}
                            </p>
                          </div>
                          <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground rotate-180" />
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Actions</h3>
                </div>
                <CardContent className="p-5 space-y-3">
                  {documents.length > 0 && (
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={rescanDocuments} disabled={rescanning}>
                      {rescanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      {rescanning ? "Scanning..." : "Re-scan Documents"}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full gap-2">
                        <Trash2 className="h-4 w-4" /> Delete Booking
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove all {events.length} calendar events for booking {bookingNumber}. This action cannot be undone.
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Chat Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl py-3">
          {chatFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {chatFiles.map((af, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5 text-xs">
                  {af.preview ? <img src={af.preview} alt="" className="h-6 w-6 rounded object-cover" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  <span className="max-w-[120px] truncate">{af.file.name}</span>
                  <button onClick={() => removeChatFile(i)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
          {chatProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Loader2 className="h-4 w-4 animate-spin" /> <span>{chatStatus}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input ref={chatFileRef} type="file" className="hidden" multiple accept="image/*,.pdf" onChange={handleChatFilesSelected} />
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={handleChatFileAttach} disabled={chatProcessing}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Add flight change, extra docs, notes..."
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
              disabled={chatProcessing}
            />
            <Button size="icon" className="shrink-0 h-9 w-9" onClick={handleChatSend} disabled={chatProcessing || (!chatMessage.trim() && chatFiles.length === 0)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={imageFiles.map(f => f.url)}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      <Footer />

      {/* Edit Passenger Dialog */}
      {editingPassenger && (
        <EditPassengerDialog
          open={!!editingPassenger}
          onOpenChange={(o) => { if (!o) setEditingPassenger(null); }}
          passenger={editingPassenger.data}
          onSave={(data) => handleEditPassenger(editingPassenger.index, data)}
        />
      )}

      {/* Delete Passenger Confirmation */}
      <AlertDialog open={deletePassengerIndex !== null} onOpenChange={(o) => { if (!o) setDeletePassengerIndex(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Passenger</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deletePassengerIndex !== null && bookingDetails?.passengers?.[deletePassengerIndex]?.name ? `"${bookingDetails.passengers[deletePassengerIndex].name}"` : "this passenger"}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deletePassengerIndex !== null && handleDeletePassenger(deletePassengerIndex)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingReport;
