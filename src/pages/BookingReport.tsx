import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarIcon, MapPin, Plane, DollarSign, Users, Hotel, Tag, RefreshCw, Loader2, CheckCircle2, Circle, FileText, Download, Trash2, Paperclip, Send, X, Image as ImageIcon, Anchor, Ship, CreditCard, User, Waves, Clock, Pencil, Plus, BedDouble } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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

interface RoomData {
  room_number: number;
  label: string;
  passengers: any[];
  cabin_number?: string;
  cabin_category?: string;
  deck?: string;
  bed_configuration?: string;
  pricing?: any;
  booking_number?: string;
  cruise_line_booking_number?: string;
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
  rooms: RoomData[];
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

/* ─── Room Card ─── */
const RoomCard = ({ room, roomIndex, totalRooms, onEditPassenger, onDeletePassenger, onDeleteRoom }: {
  room: RoomData;
  roomIndex: number;
  totalRooms: number;
  onEditPassenger: (roomIndex: number, passengerIndex: number, data: any) => void;
  onDeletePassenger: (roomIndex: number, passengerIndex: number) => void;
  onDeleteRoom: (roomIndex: number) => void;
}) => {
  const currency = room.pricing?.currency || "CA$";
  const total = room.pricing?.total ? Number(room.pricing.total) : 0;

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-primary" /> {room.label}
          </h3>
          {(room.booking_number || room.cruise_line_booking_number) && (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {room.booking_number && (
                <Badge variant="secondary" className="text-[10px] font-mono">
                  #{room.booking_number}
                </Badge>
              )}
              {room.cruise_line_booking_number && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  CL: {room.cruise_line_booking_number}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {room.cabin_category && (
              <span className="text-xs text-muted-foreground">{room.cabin_category}</span>
            )}
            {room.deck && (
              <span className="text-xs text-muted-foreground">· Deck {room.deck}</span>
            )}
            {room.bed_configuration && (
              <span className="text-xs text-muted-foreground">· {room.bed_configuration}</span>
            )}
            {room.cabin_number && (
              <Badge variant="outline" className="text-[10px] font-mono">{room.cabin_number}</Badge>
            )}
          </div>
        </div>
        {totalRooms > 1 && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-xs" onClick={() => onDeleteRoom(roomIndex)}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </Button>
        )}
      </div>
      <CardContent className="p-5 space-y-3">
        {room.passengers.map((p: any, i: number) => (
          <PassengerCard
            key={i}
            p={p}
            index={i}
            onEdit={() => onEditPassenger(roomIndex, i, p)}
            onDelete={() => onDeletePassenger(roomIndex, i)}
          />
        ))}
        {total > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Room Pricing</span>
            <span className="text-sm font-bold">{currency}{total.toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ─── Itinerary Timeline ─── */
const ItineraryTimeline = ({ itinerary }: { itinerary: any[] }) => (
  <div className="space-y-0">
    {itinerary.map((stop, i) => {
      const isSeaDay = stop.port?.toUpperCase().includes("AT SEA");
      return (
        <div key={i} className="flex gap-4 group">
          <div className="w-14 shrink-0 text-right pt-3">
            <span className="text-[11px] font-bold text-muted-foreground">Day {i + 1}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-3 w-3 rounded-full mt-4 shrink-0 border-2",
              isSeaDay ? "border-muted-foreground bg-background" : "border-primary bg-primary"
            )} />
            {i < itinerary.length - 1 && <div className="w-px flex-1 bg-border" />}
          </div>
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

  // Room-based passenger edit/delete
  const [editingPassenger, setEditingPassenger] = useState<{ roomIndex: number; passengerIndex: number; data: any } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "passenger"; roomIndex: number; passengerIndex: number } | { type: "room"; roomIndex: number } | null>(null);

  // Edit Trip Details
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [editDetailsForm, setEditDetailsForm] = useState<Record<string, any>>({});
  const [savingDetails, setSavingDetails] = useState(false);

  // Edit Event
  const [editEventTarget, setEditEventTarget] = useState<Tables<"bookings"> | null>(null);
  const [editEventForm, setEditEventForm] = useState({ event_date: "", notes: "" });
  const [savingEvent, setSavingEvent] = useState(false);

  // Delete Document
  const [deletingDocName, setDeletingDocName] = useState<string | null>(null);

  // Add Extra
  const [addExtraOpen, setAddExtraOpen] = useState(false);
  const [newExtraLabel, setNewExtraLabel] = useState("");
  const [newExtraValue, setNewExtraValue] = useState("");

  // Add Room dialog
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomFiles, setAddRoomFiles] = useState<AttachedFile[]>([]);
  const [addRoomMessage, setAddRoomMessage] = useState("");
  const [addRoomProcessing, setAddRoomProcessing] = useState(false);
  const [addRoomStatus, setAddRoomStatus] = useState("");
  const addRoomFileRef = useRef<HTMLInputElement>(null);

  // Add/Edit Flight dialog
  const [addFlightOpen, setAddFlightOpen] = useState(false);
  const [flightForm, setFlightForm] = useState({
    outbound: { airline: "", flight_number: "", departure_airport: "", departure_time: "", arrival_airport: "", arrival_time: "" },
    return: { airline: "", flight_number: "", departure_airport: "", departure_time: "", arrival_airport: "", arrival_time: "" },
  });
  const [savingFlight, setSavingFlight] = useState(false);

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
  const hasPaymentHistory = bookingDetails?.payment_history && Array.isArray(bookingDetails.payment_history) && bookingDetails.payment_history.length > 0;

  // Rooms
  const rooms: RoomData[] = bookingDetails?.rooms && Array.isArray(bookingDetails.rooms) && bookingDetails.rooms.length > 0
    ? bookingDetails.rooms
    : [];
  const hasRooms = rooms.length > 0;

  const imageFiles = documents.filter(d => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.name));
  const otherFiles = documents.filter(d => !/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.name));

  useEffect(() => {
    if (bookingNumber) fetchAll();
  }, [bookingNumber]);

  useEffect(() => {
    if (resortName) {
      document.title = `${resortName} — Trip Report`;
    }
    return () => { document.title = "ReviewThenGo.com | Real Reviews, Tested Gear & Travel Insights"; };
  }, [resortName]);

  // Auto-migrate: if rooms is empty but passengers exist, build Room 1
  const autoMigrateToRooms = async (details: BookingDetails) => {
    const hasLegacyPassengers = details.passengers && Array.isArray(details.passengers) && details.passengers.length > 0;
    const hasExistingRooms = details.rooms && Array.isArray(details.rooms) && details.rooms.length > 0;

    if (hasLegacyPassengers && !hasExistingRooms) {
      const room1: RoomData = {
        room_number: 1,
        label: "Room 1",
        passengers: details.passengers,
        cabin_number: details.cabin_number || undefined,
        cabin_category: details.cabin_category || undefined,
        deck: details.deck || undefined,
        bed_configuration: details.bed_configuration || undefined,
        pricing: details.pricing || undefined,
        booking_number: details.booking_number || undefined,
        cruise_line_booking_number: details.cruise_line_booking_number || undefined,
      };
      const updatedRooms = [room1];
      await supabase.from("booking_details" as any).update({ rooms: updatedRooms }).eq("booking_number", details.booking_number);
      return { ...details, rooms: updatedRooms };
    }
    return details;
  };

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
      let details = (detailsResult as any).data as BookingDetails;
      // Auto-migrate legacy passengers to rooms
      details = await autoMigrateToRooms(details);
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

  // --- Edit Trip Details ---
  const openEditDetails = () => {
    if (!bookingDetails) return;
    setEditDetailsForm({
      client_name: bookingDetails.client_name || "",
      client_email: bookingDetails.client_email || "",
      supplier: bookingDetails.supplier || "",
      resort_name: bookingDetails.resort_name || "",
      destination: bookingDetails.destination || "",
      room_type: bookingDetails.room_type || "",
      ship_name: bookingDetails.ship_name || "",
      cabin_category: bookingDetails.cabin_category || "",
      cabin_number: bookingDetails.cabin_number || "",
      deck: bookingDetails.deck || "",
      bed_configuration: bookingDetails.bed_configuration || "",
      rate_code: bookingDetails.rate_code || "",
      agency: bookingDetails.agency || "",
      booking_agent: bookingDetails.booking_agent || "",
      booking_status: bookingDetails.booking_status || "",
      duration_nights: bookingDetails.duration_nights || "",
      balance_due: bookingDetails.balance_due || "",
      balance_due_date: bookingDetails.balance_due_date || "",
    });
    setEditDetailsOpen(true);
  };

  const saveEditDetails = async () => {
    if (!bookingNumber) return;
    setSavingDetails(true);
    try {
      const updateData: Record<string, any> = {};
      for (const [k, v] of Object.entries(editDetailsForm)) {
        if (k === "duration_nights" || k === "balance_due") {
          updateData[k] = v === "" ? null : Number(v);
        } else {
          updateData[k] = v === "" ? null : v;
        }
      }
      await supabase.from("booking_details" as any).update(updateData).eq("booking_number", bookingNumber);
      // Sync to bookings table
      await supabase.from("bookings").update({
        client_name: updateData.client_name || undefined,
        client_email: updateData.client_email,
        supplier: updateData.supplier,
      } as any).eq("booking_number", bookingNumber);
      toast({ title: "Trip details updated" });
      setEditDetailsOpen(false);
      await fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingDetails(false);
    }
  };

  // --- Edit Event ---
  const openEditEvent = (event: Tables<"bookings">) => {
    setEditEventForm({ event_date: event.event_date, notes: event.notes || "" });
    setEditEventTarget(event);
  };

  const saveEditEvent = async () => {
    if (!editEventTarget) return;
    setSavingEvent(true);
    try {
      await supabase.from("bookings").update({
        event_date: editEventForm.event_date,
        notes: editEventForm.notes || null,
      }).eq("id", editEventTarget.id);
      toast({ title: "Event updated" });
      setEditEventTarget(null);
      await fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingEvent(false);
    }
  };

  // --- Delete Document ---
  const deleteDocument = async (fileName: string) => {
    try {
      const cs = slugify(clientName);
      await supabase.storage.from("booking-documents").remove([`${cs}/${fileName}`]);
      setDocuments(prev => prev.filter(d => d.name !== fileName));
      toast({ title: "Document deleted" });
    } catch (err: any) {
      toast({ title: "Error deleting document", description: err.message, variant: "destructive" });
    }
    setDeletingDocName(null);
  };

  // --- Extras ---
  const deleteExtra = async (index: number) => {
    if (!bookingDetails || !bookingNumber) return;
    const updated = [...(bookingDetails.extras || [])];
    updated.splice(index, 1);
    await supabase.from("booking_details" as any).update({ extras: updated }).eq("booking_number", bookingNumber);
    setBookingDetails(prev => prev ? { ...prev, extras: updated } : prev);
    toast({ title: "Extra removed" });
  };

  const addExtra = async () => {
    if (!bookingNumber || !newExtraLabel.trim()) return;
    const updated = [...(bookingDetails?.extras || []), { label: newExtraLabel.trim(), value: newExtraValue.trim() }];
    await supabase.from("booking_details" as any).update({ extras: updated }).eq("booking_number", bookingNumber);
    setBookingDetails(prev => prev ? { ...prev, extras: updated } : prev);
    setNewExtraLabel("");
    setNewExtraValue("");
    setAddExtraOpen(false);
    toast({ title: "Extra added" });
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
    for (const field of NEW_FIELDS) {
      if (d[field] !== undefined && d[field] !== null) {
        mergeData[field] = d[field];
      }
    }
    return mergeData;
  };

  // Save rooms to DB
  const saveRooms = async (updatedRooms: RoomData[]) => {
    if (!bookingNumber) return;
    await supabase.from("booking_details" as any).update({ rooms: updatedRooms }).eq("booking_number", bookingNumber);
    setBookingDetails(prev => prev ? { ...prev, rooms: updatedRooms } : prev);
  };

  // Room-level passenger edit
  const handleEditPassenger = async (roomIndex: number, passengerIndex: number, updatedData: any) => {
    if (!bookingDetails) return;
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      passengers: updatedRooms[roomIndex].passengers.map((p: any, i: number) =>
        i === passengerIndex ? { ...p, ...updatedData } : p
      ),
    };
    await saveRooms(updatedRooms);
    toast({ title: "Passenger updated", description: `${updatedData.name} has been updated.` });
  };

  // Room-level passenger delete
  const handleDeletePassenger = async (roomIndex: number, passengerIndex: number) => {
    if (!bookingDetails) return;
    const removed = rooms[roomIndex].passengers[passengerIndex];
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      passengers: updatedRooms[roomIndex].passengers.filter((_: any, i: number) => i !== passengerIndex),
    };
    await saveRooms(updatedRooms);
    setDeleteTarget(null);
    toast({ title: "Passenger removed", description: `${removed?.name || "Passenger"} has been removed.` });
  };

  // Delete room
  const handleDeleteRoom = async (roomIndex: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== roomIndex).map((r, i) => ({
      ...r,
      room_number: i + 1,
      label: `Room ${i + 1}`,
    }));
    await saveRooms(updatedRooms);
    setDeleteTarget(null);
    toast({ title: "Room removed" });
  };

  // Add Room — process uploaded files
  const handleAddRoom = async () => {
    if (!bookingNumber || addRoomFiles.length === 0) return;
    setAddRoomProcessing(true);
    setAddRoomStatus("Reading documents...");
    try {
      const filesPayload = await Promise.all(addRoomFiles.map(async af => ({
        name: af.file.name, mimeType: af.file.type, base64: await fileToBase64(af.file),
      })));

      const newRoomNumber = rooms.length + 1;
      const contextMsg = `This is for existing booking ${bookingNumber} (${resortName}) for client ${clientName}. Extract ONLY the passengers, cabin info, and pricing for a NEW additional room (Room ${newRoomNumber}). Do NOT include passengers already in Room 1. ${addRoomMessage}`;
      setAddRoomStatus("Analyzing with AI...");

      const existingBookings = [
        { bookingNumber: bookingNumber, clientName: clientName, title: resortName },
        ...rooms.map(r => ({
          bookingNumber: r.booking_number,
          clientName: clientName,
          title: `${resortName} - ${r.label}`
        })).filter(r => r.bookingNumber)
      ];

      const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
        body: { message: contextMsg, files: filesPayload, existing_bookings: existingBookings, existing_clients: [] },
      });
      if (error) throw error;

      const actions = result?.actions || (result?.action ? [{ action: result.action, data: result.data }] : []);
      if (actions.length > 0) {
        const d = actions[0].data;

        // Upload files to storage
        const cs = slugify(d.client_name || clientName);
        for (const af of addRoomFiles) {
          await supabase.storage.from("booking-documents").upload(`${cs}/${af.file.name}`, af.file, { upsert: true });
        }

        const newRoom: RoomData = {
          room_number: newRoomNumber,
          label: `Room ${newRoomNumber}`,
          passengers: d.passengers || [],
          cabin_number: d.cabin_number || undefined,
          cabin_category: d.cabin_category || undefined,
          deck: d.deck || undefined,
          bed_configuration: d.bed_configuration || undefined,
          pricing: d.pricing || undefined,
          booking_number: d.booking_number || undefined,
          cruise_line_booking_number: d.cruise_line_booking_number || undefined,
        };
        const updatedRooms = [...rooms, newRoom];
        await saveRooms(updatedRooms);
        toast({ title: `Room ${newRoomNumber} added!`, description: `${newRoom.passengers.length} passenger(s) extracted.` });
        setAddRoomOpen(false);
        setAddRoomFiles([]);
        setAddRoomMessage("");
      } else {
        toast({ title: "No data extracted", description: result?.message || "AI couldn't extract room data.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add room.", variant: "destructive" });
    } finally {
      setAddRoomProcessing(false);
      setAddRoomStatus("");
    }
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

  // Delete booking
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

      const existingBookings = [
        { bookingNumber: bookingNumber, clientName: clientName, title: resortName },
        ...rooms.map(r => ({
          bookingNumber: r.booking_number,
          clientName: clientName,
          title: `${resortName} - ${r.label}`
        })).filter(r => r.bookingNumber)
      ];

      const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
        body: { message: contextMsg, files: filesPayload, existing_bookings: existingBookings, existing_clients: [] },
      });
      if (error) throw error;

      const actions = result?.actions || (result?.action ? [{ action: result.action, data: result.data }] : []);
      if (actions.length > 0) {
        // Check if chat message references a specific room
        const roomMatch = chatMessage.match(/room\s*(\d+)/i);
        const targetRoomNumber = roomMatch ? parseInt(roomMatch[1], 10) : null;
        const targetRoomIndex = targetRoomNumber ? rooms.findIndex(r => r.room_number === targetRoomNumber) : -1;

        for (const act of actions) {
          const d = act.data;
          const cs = slugify(d.client_name || clientName);
          for (const af of chatFiles) {
            await supabase.storage.from("booking-documents").upload(`${cs}/${af.file.name}`, af.file, { upsert: true });
          }

          if (targetRoomIndex >= 0) {
            // Merge into specific room
            const updatedRooms = [...rooms];
            const room = { ...updatedRooms[targetRoomIndex] };
            if (d.passengers?.length) room.passengers = d.passengers;
            if (d.cabin_number) room.cabin_number = d.cabin_number;
            if (d.cabin_category) room.cabin_category = d.cabin_category;
            if (d.deck) room.deck = d.deck;
            if (d.bed_configuration) room.bed_configuration = d.bed_configuration;
            if (d.pricing) room.pricing = d.pricing;
            if (d.booking_number) room.booking_number = d.booking_number;
            if (d.cruise_line_booking_number) room.cruise_line_booking_number = d.cruise_line_booking_number;
            updatedRooms[targetRoomIndex] = room;
            await saveRooms(updatedRooms);

            // Also merge top-level fields (flights, extras, itinerary) into the booking
            const topLevelMerge: Record<string, any> = {};
            if (d.flight_details) topLevelMerge.flight_details = d.flight_details;
            if (d.extras?.length) topLevelMerge.extras = d.extras;
            if (d.itinerary?.length) topLevelMerge.itinerary = d.itinerary;
            if (Object.keys(topLevelMerge).length > 0) {
              await supabase.from("booking_details" as any).update(topLevelMerge).eq("booking_number", bookingNumber);
            }
          } else {
            const mergeData = buildMergeData(d);
            if (Object.keys(mergeData).length > 0) {
              await upsertBookingDetails(d.booking_number || bookingNumber, mergeData);
            }
          }
        }
        toast({ title: "Booking updated!", description: targetRoomIndex >= 0 ? `Room ${targetRoomNumber} updated!` : `${chatFiles.length} file(s) added.` });
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

  // Aggregate pricing across all rooms
  const aggregatedPricing = rooms.length > 0
    ? rooms.reduce((acc, room) => {
        const p = (room as any).pricing || {};
        acc.total += Number(p.total) || 0;
        acc.deposit += Number(p.deposit) || 0;
        acc.taxes += Number(p.taxes) || 0;
        return acc;
      }, { total: 0, deposit: 0, taxes: 0 })
    : null;

  const pricingTotal = aggregatedPricing && aggregatedPricing.total > 0 ? aggregatedPricing.total : (hasPricing ? Number(bookingDetails!.pricing.total) || 0 : 0);
  const pricingDeposit = aggregatedPricing && aggregatedPricing.deposit > 0 ? aggregatedPricing.deposit : (hasPricing ? Number(bookingDetails!.pricing.deposit) || 0 : 0);
  const pricingTaxes = aggregatedPricing && aggregatedPricing.taxes > 0 ? aggregatedPricing.taxes : (hasPricing ? Number(bookingDetails!.pricing.taxes) || 0 : 0);
  const depositPercent = pricingTotal > 0 ? Math.round((pricingDeposit / pricingTotal) * 100) : 0;
  const balanceDue = pricingTotal - pricingDeposit > 0 ? pricingTotal - pricingDeposit : 0;
  const currency = hasPricing ? bookingDetails!.pricing.currency || "CA$" : "CA$";

  // Aggregate total passengers across all rooms
  const totalPassengers = rooms.length > 0
    ? rooms.reduce((sum, room) => sum + ((room as any).passengers?.length || 0), 0)
    : bookingDetails?.num_travellers || 0;

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
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-primary" /> Trip Overview
                  </h3>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={openEditDetails}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
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
                  {/* Only show cabin info at top level if no rooms exist */}
                  {!hasRooms && bookingDetails?.cabin_category && <DetailRow label="Cabin" value={
                    <span>{bookingDetails.cabin_category}{bookingDetails.cabin_number ? ` — ${bookingDetails.cabin_number}` : ""}</span>
                  } />}
                  {!hasRooms && bookingDetails?.deck && <DetailRow label="Deck" value={bookingDetails.deck} />}
                  {!hasRooms && bookingDetails?.bed_configuration && <DetailRow label="Bed Config" value={bookingDetails.bed_configuration} />}
                  {bookingDetails?.rate_code && <DetailRow label="Rate Code" value={bookingDetails.rate_code} />}
                  {bookingDetails?.room_type && !bookingDetails?.cabin_category && <DetailRow label="Room Type" value={bookingDetails.room_type} />}
                  {totalPassengers > 0 && (
                    <DetailRow label="Travellers" value={
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{totalPassengers}</span>
                      </div>
                    } />
                  )}
                  {bookingDetails?.extras && Array.isArray(bookingDetails.extras) && bookingDetails.extras.length > 0 && (
                    <div className="px-4 py-3">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Extras</span>
                      <div className="flex flex-wrap gap-2">
                        {bookingDetails.extras.map((ext: any, i: number) => (
                          <Badge key={i} variant="secondary" className="gap-1 pr-1">
                            <Tag className="h-3 w-3" /> {ext.label}: {ext.value}
                            <button onClick={() => deleteExtra(i)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                              <X className="h-3 w-3 text-destructive" />
                            </button>
                          </Badge>
                        ))}
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setAddExtraOpen(true)}>
                          <Plus className="h-3 w-3" /> Add
                        </Button>
                      </div>
                    </div>
                  )}
                  {(!bookingDetails?.extras || !Array.isArray(bookingDetails.extras) || bookingDetails.extras.length === 0) && (
                    <div className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setAddExtraOpen(true)}>
                        <Plus className="h-3 w-3" /> Add Extra
                      </Button>
                    </div>
                  )}
                  {events.some(e => e.notes) && (
                    <DetailRow label="Notes" value={
                      <p className="text-muted-foreground font-normal">{events.find(e => e.notes)?.notes}</p>
                    } />
                  )}
                </div>
              </Card>

              {/* Rooms Section */}
              {hasRooms && (
                <div className="space-y-4">
                  {rooms.map((room, roomIndex) => (
                    <RoomCard
                      key={roomIndex}
                      room={room}
                      roomIndex={roomIndex}
                      totalRooms={rooms.length}
                      onEditPassenger={(ri, pi, data) => setEditingPassenger({ roomIndex: ri, passengerIndex: pi, data })}
                      onDeletePassenger={(ri, pi) => setDeleteTarget({ type: "passenger", roomIndex: ri, passengerIndex: pi })}
                      onDeleteRoom={(ri) => setDeleteTarget({ type: "room", roomIndex: ri })}
                    />
                  ))}
                  <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setAddRoomOpen(true)}>
                    <Plus className="h-4 w-4" /> Add Room
                  </Button>
                </div>
              )}

              {/* Fallback: show Add Room button even when no rooms exist yet and no legacy passengers */}
              {!hasRooms && (!bookingDetails?.passengers || !Array.isArray(bookingDetails.passengers) || bookingDetails.passengers.length === 0) && (
                <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setAddRoomOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Room
                </Button>
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
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" /> Flight Itinerary
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const existing = bookingDetails?.flight_details;
                    setFlightForm({
                      outbound: {
                        airline: existing?.outbound?.airline || "",
                        flight_number: existing?.outbound?.flight_number || "",
                        departure_airport: existing?.outbound?.departure_airport || "",
                        departure_time: existing?.outbound?.departure_time || "",
                        arrival_airport: existing?.outbound?.arrival_airport || "",
                        arrival_time: existing?.outbound?.arrival_time || "",
                      },
                      return: {
                        airline: existing?.return?.airline || "",
                        flight_number: existing?.return?.flight_number || "",
                        departure_airport: existing?.return?.departure_airport || "",
                        departure_time: existing?.return?.departure_time || "",
                        arrival_airport: existing?.return?.arrival_airport || "",
                        arrival_time: existing?.return?.arrival_time || "",
                      },
                    });
                    setAddFlightOpen(true);
                  }}>
                    {hasFlightDetails ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                    {hasFlightDetails ? "Edit" : "Add Flight"}
                  </Button>
                </div>
                <CardContent className="p-5 space-y-4">
                  {hasFlightDetails ? (
                    <>
                      <FlightLeg label="Outbound" leg={bookingDetails!.flight_details.outbound} />
                      <FlightLeg label="Return" leg={bookingDetails!.flight_details.return} />
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No flights added yet.</p>
                  )}
                </CardContent>
              </Card>

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
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                                  {format(new Date(event.event_date), "MMM d, yyyy")}
                                </span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditEvent(event)}>
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </div>
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
                            <div key={i} className="group relative rounded-xl overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all aspect-[4/3]">
                              <button
                                onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                                className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <img src={doc.url} alt={doc.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-white font-medium truncate block">{doc.name}</span>
                                </div>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeletingDocName(doc.name); }}
                                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </button>
                            </div>
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
                          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => setDeletingDocName(doc.name)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
                  {totalPassengers > 0 && <DetailRow label="Travellers" value={`${totalPassengers}`} icon={<Users className="h-3 w-3" />} />}
                  {hasRooms && <DetailRow label="Rooms" value={`${rooms.length}`} icon={<BedDouble className="h-3 w-3" />} />}
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
                      {pricingTaxes > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taxes / Fees</span>
                          <span className="font-medium">{currency}{pricingTaxes.toLocaleString()}</span>
                        </div>
                      )}
                      {pricingTotal > 0 && totalPassengers > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Per Person</span>
                          <span className="font-medium">{currency}{Math.round(pricingTotal / totalPassengers).toLocaleString()}</span>
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
          onSave={(data) => {
            handleEditPassenger(editingPassenger.roomIndex, editingPassenger.passengerIndex, data);
            setEditingPassenger(null);
          }}
        />
      )}

      {/* Delete Passenger / Room Confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "room" ? "Remove Room" : "Remove Passenger"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "room"
                ? `Are you sure you want to remove ${rooms[deleteTarget.roomIndex]?.label || "this room"} and all its passengers? This cannot be undone.`
                : deleteTarget?.type === "passenger"
                  ? `Are you sure you want to remove "${rooms[deleteTarget.roomIndex]?.passengers?.[deleteTarget.passengerIndex]?.name || "this passenger"}"? This cannot be undone.`
                  : ""
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget?.type === "passenger") {
                  handleDeletePassenger(deleteTarget.roomIndex, deleteTarget.passengerIndex);
                } else if (deleteTarget?.type === "room") {
                  handleDeleteRoom(deleteTarget.roomIndex);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Room Dialog */}
      <Dialog open={addRoomOpen} onOpenChange={(o) => { if (!o && !addRoomProcessing) { setAddRoomOpen(false); setAddRoomFiles([]); setAddRoomMessage(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add Room {rooms.length + 1}
            </DialogTitle>
            <DialogDescription>
              Upload the booking confirmation for the new room. The AI will extract passenger and cabin details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-2 block">Upload Documents</Label>
              <input
                ref={addRoomFileRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setAddRoomFiles(prev => [...prev, ...files.map(file => ({
                    file,
                    preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
                  }))]);
                  if (addRoomFileRef.current) addRoomFileRef.current.value = "";
                }}
              />
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed h-20"
                onClick={() => addRoomFileRef.current?.click()}
                disabled={addRoomProcessing}
              >
                <Paperclip className="h-4 w-4" />
                {addRoomFiles.length > 0 ? `${addRoomFiles.length} file(s) selected` : "Click to upload screenshots or PDFs"}
              </Button>
              {addRoomFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {addRoomFiles.map((af, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5 text-xs">
                      {af.preview ? <img src={af.preview} alt="" className="h-6 w-6 rounded object-cover" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                      <span className="max-w-[120px] truncate">{af.file.name}</span>
                      <button
                        onClick={() => {
                          setAddRoomFiles(prev => {
                            const removed = prev[i];
                            if (removed.preview) URL.revokeObjectURL(removed.preview);
                            return prev.filter((_, idx) => idx !== i);
                          });
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs mb-2 block">Additional Instructions (optional)</Label>
              <Textarea
                value={addRoomMessage}
                onChange={e => setAddRoomMessage(e.target.value)}
                placeholder="e.g. This is for the Johnson family..."
                className="min-h-[60px]"
                disabled={addRoomProcessing}
              />
            </div>
            {addRoomProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> <span>{addRoomStatus}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddRoomOpen(false); setAddRoomFiles([]); setAddRoomMessage(""); }} disabled={addRoomProcessing}>
              Cancel
            </Button>
            <Button onClick={handleAddRoom} disabled={addRoomProcessing || addRoomFiles.length === 0}>
              {addRoomProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Flight Dialog */}
      <Dialog open={addFlightOpen} onOpenChange={setAddFlightOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plane className="h-5 w-5" /> {hasFlightDetails ? "Edit Flights" : "Add Flights"}</DialogTitle>
            <DialogDescription>Enter outbound and/or return flight details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {(["outbound", "return"] as const).map(leg => (
              <div key={leg} className="space-y-3">
                <h4 className="text-sm font-semibold capitalize">{leg} Flight</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Airline</Label>
                    <Input value={flightForm[leg].airline} onChange={e => setFlightForm(f => ({ ...f, [leg]: { ...f[leg], airline: e.target.value } }))} placeholder="e.g. WestJet" />
                  </div>
                  <div>
                    <Label className="text-xs">Flight #</Label>
                    <Input value={flightForm[leg].flight_number} onChange={e => setFlightForm(f => ({ ...f, [leg]: { ...f[leg], flight_number: e.target.value } }))} placeholder="e.g. WS 123" />
                  </div>
                  <div>
                    <Label className="text-xs">Departure Airport</Label>
                    <Input value={flightForm[leg].departure_airport} onChange={e => setFlightForm(f => ({ ...f, [leg]: { ...f[leg], departure_airport: e.target.value } }))} placeholder="e.g. YYZ" />
                  </div>
                  <div>
                    <Label className="text-xs">Departure Time</Label>
                    <Input value={flightForm[leg].departure_time} onChange={e => setFlightForm(f => ({ ...f, [leg]: { ...f[leg], departure_time: e.target.value } }))} placeholder="e.g. Mar 15, 8:30 AM" />
                  </div>
                  <div>
                    <Label className="text-xs">Arrival Airport</Label>
                    <Input value={flightForm[leg].arrival_airport} onChange={e => setFlightForm(f => ({ ...f, [leg]: { ...f[leg], arrival_airport: e.target.value } }))} placeholder="e.g. CUN" />
                  </div>
                  <div>
                    <Label className="text-xs">Arrival Time</Label>
                    <Input value={flightForm[leg].arrival_time} onChange={e => setFlightForm(f => ({ ...f, [leg]: { ...f[leg], arrival_time: e.target.value } }))} placeholder="e.g. Mar 15, 1:45 PM" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFlightOpen(false)} disabled={savingFlight}>Cancel</Button>
            <Button onClick={async () => {
              setSavingFlight(true);
              try {
                const hasOutbound = Object.values(flightForm.outbound).some(v => v.trim());
                const hasReturn = Object.values(flightForm.return).some(v => v.trim());
                const existing = bookingDetails?.flight_details || {};
                const flightDetails = {
                  ...existing,
                  ...(hasOutbound ? { outbound: flightForm.outbound } : {}),
                  ...(hasReturn ? { return: flightForm.return } : {}),
                };
                await supabase.from("booking_details").update({ flight_details: flightDetails } as any).eq("booking_number", bookingNumber);
                toast({ title: "Flights saved" });
                setAddFlightOpen(false);
                fetchAll();
              } catch (err) {
                toast({ title: "Error saving flights", variant: "destructive" });
              } finally {
                setSavingFlight(false);
              }
            }} disabled={savingFlight}>
              {savingFlight ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Trip Details Dialog */}
      <Dialog open={editDetailsOpen} onOpenChange={setEditDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip Details</DialogTitle>
            <DialogDescription>Update booking details. Changes sync across all related records.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "client_name", label: "Client Name" },
              { key: "client_email", label: "Client Email" },
              { key: "supplier", label: "Supplier" },
              { key: "resort_name", label: "Resort / Trip Name" },
              { key: "destination", label: "Destination" },
              { key: "ship_name", label: "Ship Name" },
              { key: "room_type", label: "Room Type" },
              { key: "cabin_category", label: "Cabin Category" },
              { key: "cabin_number", label: "Cabin Number" },
              { key: "deck", label: "Deck" },
              { key: "bed_configuration", label: "Bed Configuration" },
              { key: "rate_code", label: "Rate Code" },
              { key: "agency", label: "Agency" },
              { key: "booking_agent", label: "Booking Agent" },
              { key: "booking_status", label: "Booking Status" },
              { key: "duration_nights", label: "Duration (Nights)" },
              { key: "balance_due", label: "Balance Due" },
              { key: "balance_due_date", label: "Balance Due Date" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  value={editDetailsForm[key] || ""}
                  onChange={e => setEditDetailsForm(prev => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDetailsOpen(false)} disabled={savingDetails}>Cancel</Button>
            <Button onClick={saveEditDetails} disabled={savingDetails}>
              {savingDetails ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!editEventTarget} onOpenChange={(o) => { if (!o) setEditEventTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the date and notes for this event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Event Date</Label>
              <Input type="date" value={editEventForm.event_date} onChange={e => setEditEventForm(prev => ({ ...prev, event_date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea value={editEventForm.notes} onChange={e => setEditEventForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEventTarget(null)} disabled={savingEvent}>Cancel</Button>
            <Button onClick={saveEditEvent} disabled={savingEvent}>
              {savingEvent ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Extra Dialog */}
      <Dialog open={addExtraOpen} onOpenChange={setAddExtraOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Extra</DialogTitle>
            <DialogDescription>Add a label/value pair to this booking.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input value={newExtraLabel} onChange={e => setNewExtraLabel(e.target.value)} placeholder="e.g. Beverage Package" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input value={newExtraValue} onChange={e => setNewExtraValue(e.target.value)} placeholder="e.g. Premium" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddExtraOpen(false)}>Cancel</Button>
            <Button onClick={addExtra} disabled={!newExtraLabel.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Document Confirmation */}
      <AlertDialog open={!!deletingDocName} onOpenChange={(o) => { if (!o) setDeletingDocName(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{deletingDocName}" from storage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deletingDocName && deleteDocument(deletingDocName)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingReport;
