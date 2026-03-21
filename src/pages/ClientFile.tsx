import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CalendarIcon, MapPin, Plane, DollarSign, Users, Hotel, Tag, RefreshCw, Loader2, FileText, Download, Paperclip, Send, X, Image as ImageIcon, ExternalLink, Ship, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  [key: string]: any; // allow new cruise fields
}

const CRUISE_FIELDS = [
  "itinerary", "passengers", "payment_history", "agency", "booking_agent",
  "cabin_number", "cabin_category", "deck", "bed_configuration", "rate_code",
  "ship_name", "cruise_line_booking_number", "balance_due", "balance_due_date",
  "duration_nights", "booking_status", "trip_group_id",
] as const;

const buildMergeData = (d: any): Partial<BookingDetails> => {
  const mergeData: Partial<BookingDetails> = {};
  if (d.destination) mergeData.destination = d.destination;
  if (d.room_type) mergeData.room_type = d.room_type;
  if (d.num_travellers) mergeData.num_travellers = d.num_travellers;
  if (d.flight_details) mergeData.flight_details = d.flight_details;
  if (d.pricing) mergeData.pricing = d.pricing;
  if (d.extras) mergeData.extras = d.extras;
  if (d.supplier) mergeData.supplier = d.supplier;
  if (d.resort_or_trip || d.resort_name) mergeData.resort_name = d.resort_or_trip || d.resort_name;
  if (d.client_name) mergeData.client_name = d.client_name;
  if (d.client_email) mergeData.client_email = d.client_email;
  for (const field of CRUISE_FIELDS) {
    if (d[field] !== undefined && d[field] !== null) {
      (mergeData as any)[field] = d[field];
    }
  }
  return mergeData;
};

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

interface AttachedFile {
  file: File;
  preview?: string;
}

interface BookingCard {
  bookingNumber: string;
  details: BookingDetails | null;
  events: BookingEvent[];
  resortName: string;
  supplier: string;
  tripStart: string | null;
  tripEnd: string | null;
}

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ClientFile = () => {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [bookingCards, setBookingCards] = useState<BookingCard[]>([]);
  const [documents, setDocuments] = useState<StorageFile[]>([]);
  const [rescanning, setRescanning] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Chat
  const [chatMessage, setChatMessage] = useState("");
  const [chatFiles, setChatFiles] = useState<AttachedFile[]>([]);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatStatus, setChatStatus] = useState("");
  const chatFileRef = useRef<HTMLInputElement>(null);

  // Delete document
  const [deletingDocName, setDeletingDocName] = useState<string | null>(null);
  const deleteDocument = async (fileName: string) => {
    if (!clientSlug) return;
    try {
      await supabase.storage.from("booking-documents").remove([`${clientSlug}/${fileName}`]);
      setDocuments(prev => prev.filter(d => d.name !== fileName));
      toast({ title: "Document deleted" });
    } catch (err: any) {
      toast({ title: "Error deleting document", description: err.message, variant: "destructive" });
    }
    setDeletingDocName(null);
  };

  const imageFiles = documents.filter(d => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.name));
  const otherFiles = documents.filter(d => !/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.name));

  useEffect(() => {
    if (clientSlug) fetchAll();
  }, [clientSlug]);

  useEffect(() => {
    if (clientName) {
      document.title = `${clientName}. Client File`;
    }
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
  }, [clientName]);

  const fetchAll = async () => {
    if (!clientSlug) return;
    setLoading(true);

    // Fetch all bookings and booking_details
    const [bookingsRes, detailsRes] = await Promise.all([
      supabase.from("bookings").select("*").not("booking_number", "is", null).order("event_date", { ascending: true }),
      supabase.from("booking_details" as any).select("*"),
    ]);

    const allBookings = (bookingsRes.data || []) as BookingEvent[];
    const allDetails = ((detailsRes as any).data || []) as BookingDetails[];

    // Find bookings belonging to this client by matching slugified client_name
    const clientBookings = allBookings.filter(b => slugify(b.client_name) === clientSlug);

    if (clientBookings.length > 0) {
      // Get display name from most recent booking
      const sorted = [...clientBookings].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
      setClientName(sorted[0].client_name);
      setClientEmail(sorted[0].client_email || "");
    } else {
      // Try from booking_details
      const clientDetails = allDetails.filter(d => d.client_name && slugify(d.client_name) === clientSlug);
      if (clientDetails.length > 0) {
        setClientName(clientDetails[0].client_name || clientSlug);
        setClientEmail(clientDetails[0].client_email || "");
      } else {
        setClientName(clientSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
      }
    }

    // Group by booking_number
    const bookingNumbers = [...new Set(clientBookings.map(b => b.booking_number!).filter(Boolean))];
    const cards: BookingCard[] = bookingNumbers.map(bn => {
      const events = clientBookings.filter(b => b.booking_number === bn);
      const details = allDetails.find(d => d.booking_number === bn) || null;
      const tripStart = events.find(e => e.event_type === "trip_start")?.event_date || null;
      const tripEnd = events.find(e => e.event_type === "trip_end")?.event_date || null;
      const resortName = details?.resort_name || events[0]?.title?.replace(/ - (Booked|Deposit Due|Final Payment|Trip Start|Trip End|Departure|Return)$/, "") || "";
      const supplier = details?.supplier || events[0]?.supplier || "";
      return { bookingNumber: bn, details, events, resortName, supplier, tripStart, tripEnd };
    });

    // Sort: upcoming trips first
    cards.sort((a, b) => {
      const dateA = a.tripStart ? new Date(a.tripStart).getTime() : 0;
      const dateB = b.tripStart ? new Date(b.tripStart).getTime() : 0;
      return dateB - dateA;
    });

    setBookingCards(cards);

    // Fetch documents
    const { data: fileList } = await supabase.storage.from("booking-documents").list(clientSlug, { limit: 100 });
    if (fileList && fileList.length > 0) {
      const validFiles = fileList.filter(f => f.name !== ".emptyFolderPlaceholder");
      const signedResults = await Promise.all(
        validFiles.map(f => supabase.storage.from("booking-documents").createSignedUrl(`${clientSlug}/${f.name}`, 3600))
      );
      setDocuments(validFiles.map((f, i) => ({ name: f.name, url: signedResults[i].data?.signedUrl || "" })).filter(f => f.url));
    } else {
      setDocuments([]);
    }

    setLoading(false);
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

  // Upsert helper with smart array merging
  const upsertBookingDetails = async (bn: string, details: Partial<BookingDetails>) => {
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

  // Create booking entries helper
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

  // Re-scan all documents
  const rescanDocuments = async () => {
    if (!clientSlug || !clientName) return;
    setRescanning(true);
    try {
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

      const bookingContext = bookingCards.map(c => `${c.bookingNumber}: ${c.resortName}`).join(", ");
      const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
        body: {
          message: `Re-scan all documents for client ${clientName}. Known bookings: ${bookingContext}. Create new bookings or update existing ones as needed.`,
          files: filesPayload,
          existing_bookings: bookingCards.map(c => ({ bookingNumber: c.bookingNumber, clientName, title: c.resortName })),
          existing_clients: [{ name: clientName, email: clientEmail }],
        },
      });
      if (error) throw error;

      // Process all actions (multi-cabin support)
      const actions = result?.actions || (result?.action ? [{ action: result.action, data: result.data }] : []);
      if (actions.length > 0) {
        for (const act of actions) {
          const d = act.data;
          if (act.action === "create_booking") {
            await createBookingEntries({
              clientName: d.client_name || clientName,
              clientEmail: d.client_email || clientEmail || undefined,
              bookingNumber: d.booking_number,
              title: d.resort_or_trip,
              supplier: d.supplier || undefined,
              dateBooked: d.date_booked || format(new Date(), "yyyy-MM-dd"),
              depositDue: d.deposit_due || undefined,
              finalPaymentDue: d.final_payment_due || undefined,
              tripStart: d.trip_start || undefined,
              tripEnd: d.trip_end || undefined,
            });
          }
          await upsertBookingDetails(d.booking_number, buildMergeData(d));
        }
        toast({ title: "Re-scan complete!", description: `${actions.length} booking(s) processed.` });
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
    if (!clientSlug || (!chatMessage.trim() && chatFiles.length === 0)) return;
    setChatProcessing(true);
    setChatStatus("Reading documents...");
    try {
      const filesPayload = await Promise.all(chatFiles.map(async af => ({
        name: af.file.name, mimeType: af.file.type, base64: await fileToBase64(af.file),
      })));

      const bookingContext = bookingCards.map(c => `${c.bookingNumber}: ${c.resortName}`).join(", ");
      const contextMsg = `This is for client ${clientName}. Known bookings: ${bookingContext}. ${chatMessage}`;
      setChatStatus("Analyzing with AI...");

      const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
        body: {
          message: contextMsg,
          files: filesPayload,
          existing_bookings: bookingCards.map(c => ({ bookingNumber: c.bookingNumber, clientName, title: c.resortName })),
          existing_clients: [{ name: clientName, email: clientEmail }],
        },
      });
      if (error) throw error;

      // Process all actions (multi-cabin support)
      const actions = result?.actions || (result?.action ? [{ action: result.action, data: result.data }] : []);
      if (actions.length > 0) {
        // Upload files once
        for (const af of chatFiles) {
          await supabase.storage.from("booking-documents").upload(`${clientSlug}/${af.file.name}`, af.file, { upsert: true });
        }

        let lastBookingNumber = "";
        for (const act of actions) {
          const d = act.data;
          if (act.action === "create_booking") {
            await createBookingEntries({
              clientName: d.client_name || clientName,
              clientEmail: d.client_email || clientEmail || undefined,
              bookingNumber: d.booking_number,
              title: d.resort_or_trip,
              supplier: d.supplier || undefined,
              dateBooked: d.date_booked || format(new Date(), "yyyy-MM-dd"),
              depositDue: d.deposit_due || undefined,
              finalPaymentDue: d.final_payment_due || undefined,
              tripStart: d.trip_start || undefined,
              tripEnd: d.trip_end || undefined,
            });
            const fullMerge = buildMergeData(d);
            fullMerge.client_name = d.client_name || clientName;
            fullMerge.client_email = d.client_email || clientEmail || null;
            fullMerge.resort_name = d.resort_or_trip || d.resort_name;
            await upsertBookingDetails(d.booking_number, fullMerge);
          } else if (act.action === "add_to_booking") {
            const mergeData = buildMergeData(d);
            if (Object.keys(mergeData).length > 0) {
              await upsertBookingDetails(d.booking_number, mergeData);
            }
          }
          lastBookingNumber = d.booking_number;
        }
        toast({ title: `${actions.length} booking(s) processed!`, description: `Files added to ${clientName}'s file.` });
        if (actions.length === 1 && lastBookingNumber) {
          navigate(`/booking/${encodeURIComponent(lastBookingNumber)}`);
        } else {
          await fetchAll();
        }
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
    if (!clientSlug) return;
    const { data } = await supabase.storage.from("booking-documents").createSignedUrl(`${clientSlug}/${fileName}`, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
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
        {/* Back */}
        <div className="container mx-auto px-4 pt-6 max-w-5xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* Client Header */}
        <div className="container mx-auto px-4 max-w-5xl mt-4 mb-8">
          <div className="rounded-2xl bg-primary/5 border border-border p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{clientName}</h1>
                    {clientEmail && (
                      <p className="text-sm text-muted-foreground">{clientEmail}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium">{bookingCards.length} {bookingCards.length === 1 ? "booking" : "bookings"}</span>
                  <span>•</span>
                  <span>{documents.length} {documents.length === 1 ? "document" : "documents"}</span>
                </div>
              </div>
              {documents.length > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={rescanDocuments} disabled={rescanning}>
                  {rescanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {rescanning ? "Scanning..." : "Re-scan All Docs"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Booking Cards */}
        <div className="container mx-auto px-4 max-w-5xl space-y-6">
          {bookingCards.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-2">No bookings yet for this client.</p>
              <p className="text-sm text-muted-foreground">Upload documents below to create a booking.</p>
            </Card>
          ) : (
            (() => {
              // Group cards by trip_group_id
              const grouped: Record<string, BookingCard[]> = {};
              const ungrouped: BookingCard[] = [];
              for (const card of bookingCards) {
                const gid = (card.details as any)?.trip_group_id;
                if (gid) {
                  if (!grouped[gid]) grouped[gid] = [];
                  grouped[gid].push(card);
                } else {
                  ungrouped.push(card);
                }
              }

              const renderCabinCard = (card: BookingCard, compact = false) => {
                const hasPricing = card.details?.pricing && typeof card.details.pricing === "object" && (card.details.pricing.total || card.details.pricing.deposit);
                const pricingTotal = hasPricing ? Number(card.details!.pricing.total) || 0 : 0;
                return (
                  <Card key={card.bookingNumber} className={cn("overflow-hidden", compact && "border-border/60")}>
                    <div className={cn("p-5", compact ? "md:p-4" : "md:p-6")}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {!compact && <Hotel className="h-4 w-4 text-primary shrink-0" />}
                            <h2 className={cn("font-display font-bold text-foreground", compact ? "text-base" : "text-lg")}>{compact ? `Cabin: ${card.bookingNumber}` : card.resortName}</h2>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            {!compact && <Badge variant="outline" className="font-mono text-xs">{card.bookingNumber}</Badge>}
                            {card.supplier && !compact && <span>via {card.supplier}</span>}
                            {card.details?.cabin_category && <span>{card.details.cabin_category}</span>}
                            {card.details?.deck && <span>Deck {card.details.deck}</span>}
                            {card.details?.bed_configuration && <span>{card.details.bed_configuration}</span>}
                            {card.details?.destination && !compact && (
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{card.details.destination}</span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" asChild>
                          <Link to={`/booking/${encodeURIComponent(card.bookingNumber)}`}>
                            <ExternalLink className="h-3.5 w-3.5" /> Full Report
                          </Link>
                        </Button>
                      </div>

                      <div className={cn("grid gap-4 p-4 rounded-xl bg-muted/30 border border-border", compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4")}>
                        {!compact && (
                          <div>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Trip Dates</p>
                            <p className="text-sm font-medium">
                              {card.tripStart && card.tripEnd
                                ? `${format(new Date(card.tripStart), "MMM d")} to ${format(new Date(card.tripEnd), "MMM d, yyyy")}`
                                : card.tripStart
                                ? `From ${format(new Date(card.tripStart), "MMM d, yyyy")}`
                                : "-"}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{compact ? "Cabin" : "Room"}</p>
                          <p className="text-sm font-medium">{card.details?.cabin_category || card.details?.room_type || "-"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Travellers</p>
                          <p className="text-sm font-medium">{card.details?.num_travellers || "-"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                          <p className="text-sm font-bold">
                            {pricingTotal > 0 ? `${card.details?.pricing?.currency || "$"}${pricingTotal.toLocaleString()}` : "-"}
                          </p>
                        </div>
                      </div>

                      {!compact && card.details?.extras && Array.isArray(card.details.extras) && card.details.extras.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {card.details.extras.map((ext: any, i: number) => (
                            <Badge key={i} variant="secondary" className="gap-1 text-xs">
                              <Tag className="h-2.5 w-2.5" /> {ext.label}: {ext.value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              };

              return (
                <>
                  {/* Grouped trip cards */}
                  {Object.entries(grouped).map(([groupId, cabins]) => {
                    const first = cabins[0];
                    const tripName = first.resortName || first.details?.ship_name || "Trip";
                    const supplier = first.supplier || first.details?.supplier || "";
                    const tripDates = first.tripStart && first.tripEnd
                      ? `${format(new Date(first.tripStart), "MMM d")} to ${format(new Date(first.tripEnd), "MMM d, yyyy")}`
                      : first.tripStart
                      ? `From ${format(new Date(first.tripStart), "MMM d, yyyy")}`
                      : "";

                    return (
                      <Card key={groupId} className="overflow-hidden border-primary/20">
                        <div className="p-5 md:p-6 bg-primary/5 border-b border-border">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Ship className="h-5 w-5 text-primary shrink-0" />
                            <div>
                              <h2 className="text-lg font-display font-bold text-foreground">{tripName}</h2>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mt-0.5">
                                {tripDates && <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{tripDates}</span>}
                                {supplier && <span>via {supplier}</span>}
                                {first.details?.destination && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{first.details.destination}</span>}
                                <Badge variant="secondary" className="text-xs">{cabins.length} {cabins.length === 1 ? "cabin" : "cabins"}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 md:p-5 space-y-3">
                          {cabins.map(cabin => renderCabinCard(cabin, true))}
                        </div>
                      </Card>
                    );
                  })}

                  {/* Ungrouped booking cards */}
                  {ungrouped.map(card => renderCabinCard(card, false))}
                </>
              );
            })()
          )}

          {/* Documents Section */}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
      </main>

      {/* Sticky Chat Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl py-3">
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
              placeholder="Upload docs or describe a new booking..."
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
              disabled={chatProcessing}
            />
            <Button size="icon" className="shrink-0 h-9 w-9" onClick={handleChatSend} disabled={chatProcessing || (!chatMessage.trim() && chatFiles.length === 0)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={imageFiles.map(f => f.url)}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      <Footer />

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

export default ClientFile;
