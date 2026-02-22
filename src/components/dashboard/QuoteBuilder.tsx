import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronRight, ChevronLeft, Plus, Trash2, Save, Loader2, Users, FileText, Star, MapPin, CalendarIcon, Copy, Upload, X, Paperclip, ArrowUp, ArrowDown, BookmarkPlus, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { toast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import QuotePreview from "./QuotePreview";
import MultiTagInput from "./MultiTagInput";

interface LineItem {
  description: string;
  amount: number;
  category?: string;
}

const LINE_ITEM_CATEGORIES = ["Hotel", "Transfer", "Excursion", "Insurance", "Flights", "Car Rental", "Spa", "Other"];

interface FlightDetail {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
}

export interface QuoteData {
  id?: string;
  clientName: string;
  clientEmail: string;
  resortName: string;
  resortReviewSlug: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  numTravellers: number;
  roomType: string;
  inclusions: string[];
  flights: FlightDetail[];
  lineItems: LineItem[];
  notes: string;
  currency: string;
  status: string;
  shareToken?: string;
  reviewSummary?: string;
  includeReview: boolean;
  reviewData: any | null;
  attachmentUrls?: string[];
  validUntil: string;
}

const INCLUSION_PRESETS = [
  "All-Inclusive", "Airport Transfers", "Travel Insurance", "Spa Package",
  "Kids Club", "Room Upgrade", "Late Check-Out", "Excursions",
  "Private Pool", "Butler Service", "Meal Plan", "Car Rental",
];

const emptyFlight: FlightDetail = { airline: "", flightNumber: "", departureAirport: "", arrivalAirport: "", departureTime: "", arrivalTime: "" };
const emptyLineItem: LineItem = { description: "", amount: 0, category: "" };

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

// --- Booking From Quote Dialog ---
interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteData: any;
  onSaved: () => void;
}

const BookingFromQuoteDialog = ({ open, onOpenChange, quoteData, onSaved }: BookingDialogProps) => {
  const [bookingNumber, setBookingNumber] = useState("");
  const [dateBooked, setDateBooked] = useState<Date | undefined>(new Date());
  const [depositDue, setDepositDue] = useState<Date | undefined>();
  const [finalPaymentDue, setFinalPaymentDue] = useState<Date | undefined>();
  const [tripStart, setTripStart] = useState<Date | undefined>(quoteData?.check_in ? new Date(quoteData.check_in + "T00:00:00") : undefined);
  const [tripEnd, setTripEnd] = useState<Date | undefined>(quoteData?.check_out ? new Date(quoteData.check_out + "T00:00:00") : undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quoteData) {
      setTripStart(quoteData.check_in ? new Date(quoteData.check_in + "T00:00:00") : undefined);
      setTripEnd(quoteData.check_out ? new Date(quoteData.check_out + "T00:00:00") : undefined);
      setBookingNumber("");
      setDateBooked(new Date());
      setDepositDue(undefined);
      setFinalPaymentDue(undefined);
    }
  }, [quoteData]);

  const handleSaveBooking = async () => {
    if (!bookingNumber.trim()) {
      toast({ title: "Missing booking number", variant: "destructive" });
      return;
    }
    setSaving(true);

    const entries: any[] = [];
    const base = {
      client_name: quoteData.client_name,
      client_email: quoteData.client_email || null,
      quote_id: quoteData.id,
      booking_number: bookingNumber,
    };

    if (dateBooked) entries.push({ ...base, event_type: "booking", event_date: format(dateBooked, "yyyy-MM-dd"), title: `${quoteData.resort_name} - Booked` });
    if (depositDue) entries.push({ ...base, event_type: "deposit_due", event_date: format(depositDue, "yyyy-MM-dd"), title: `${quoteData.resort_name} - Deposit Due` });
    if (finalPaymentDue) entries.push({ ...base, event_type: "final_payment", event_date: format(finalPaymentDue, "yyyy-MM-dd"), title: `${quoteData.resort_name} - Final Payment` });
    if (tripStart) entries.push({ ...base, event_type: "trip_start", event_date: format(tripStart, "yyyy-MM-dd"), title: `${quoteData.resort_name} - Trip Start` });
    if (tripEnd) entries.push({ ...base, event_type: "trip_end", event_date: format(tripEnd, "yyyy-MM-dd"), title: `${quoteData.resort_name} - Trip End` });

    if (entries.length === 0) {
      toast({ title: "Add at least one date", variant: "destructive" });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("bookings").insert(entries);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("client_quotes").update({ status: "booked" } as any).eq("id", quoteData.id);
      toast({ title: "Booking created!", description: `${entries.length} calendar entries added.` });
      onOpenChange(false);
      onSaved();
    }
    setSaving(false);
  };

  if (!quoteData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book: {quoteData.resort_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Client:</span> <span className="font-medium text-foreground">{quoteData.client_name}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{quoteData.client_email || "—"}</span></div>
          </div>
          <div>
            <Label>Booking Number *</Label>
            <Input value={bookingNumber} onChange={(e) => setBookingNumber(e.target.value)} placeholder="e.g. BK12345" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DatePickerField label="Date Booked" date={dateBooked} onSelect={setDateBooked} />
            <DatePickerField label="Deposit Due" date={depositDue} onSelect={setDepositDue} />
            <DatePickerField label="Final Payment Due" date={finalPaymentDue} onSelect={setFinalPaymentDue} />
            <DatePickerField label="Trip Start" date={tripStart} onSelect={setTripStart} />
            <DatePickerField label="Trip End" date={tripEnd} onSelect={setTripEnd} />
          </div>
          <Button onClick={handleSaveBooking} disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
            Save Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Component ---
interface QuoteBuilderProps {
  onPreviewMode?: (active: boolean) => void;
}

const QuoteBuilder = ({ onPreviewMode }: QuoteBuilderProps = {}) => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cachedReviews, setCachedReviews] = useState<any[]>([]);
  const { review, isLoading, generateReview } = useGenerateReview();
  const { suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(searchQuery);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [existingQuotes, setExistingQuotes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeReview, setIncludeReview] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingQuote, setBookingQuote] = useState<any>(null);
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedClient, setSelectedClient] = useState<string>("__new__");
  const [autoSaved, setAutoSaved] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [showTemplateSave, setShowTemplateSave] = useState(false);

  const [quote, setQuote] = useState<QuoteData>({
    clientName: "", clientEmail: "", resortName: "", resortReviewSlug: "", destination: "",
    checkIn: "", checkOut: "", numTravellers: 2, roomType: "", inclusions: [],
    flights: [{ ...emptyFlight }], lineItems: [{ ...emptyLineItem }],
    notes: "", currency: "CAD", status: "draft", reviewSummary: "",
    includeReview: false, reviewData: null, attachmentUrls: [],
    validUntil: format(addDays(new Date(), 14), "yyyy-MM-dd"),
  });

  useEffect(() => {
    supabase.from("cached_reviews").select("id, property_name, slug, location, review_data, created_at").order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => setCachedReviews(data || []));
    fetchQuotes();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase.from("quote_templates" as any).select("*").order("created_at", { ascending: false });
    setTemplates(data || []);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Notify parent about preview mode
  useEffect(() => {
    onPreviewMode?.(step === 4);
  }, [step, onPreviewMode]);

  // Auto-save debounce (30s) - only when editing an existing quote
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!editingId) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      if (!quote.clientName.trim() || !quote.resortName.trim()) return;
      const payload: Record<string, any> = {
        client_name: quote.clientName,
        client_email: quote.clientEmail || null,
        resort_name: quote.resortName,
        resort_review_slug: quote.resortReviewSlug || null,
        destination: quote.destination || null,
        check_in: quote.checkIn || null,
        check_out: quote.checkOut || null,
        num_travellers: quote.numTravellers,
        flight_details: quote.flights,
        line_items: quote.lineItems,
        total_price: quote.lineItems.reduce((s, li) => s + (li.amount || 0), 0),
        currency: quote.currency,
        notes: quote.notes || null,
        status: quote.status,
        include_review: quote.includeReview,
        review_data: quote.includeReview ? quote.reviewData : null,
        attachment_urls: attachmentUrls.length > 0 ? attachmentUrls : null,
        room_type: quote.roomType || null,
        inclusions: quote.inclusions.length > 0 ? quote.inclusions : [],
        valid_until: quote.validUntil || null,
      };
      await supabase.from("client_quotes").update(payload as any).eq("id", editingId);
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 3000);
    }, 30000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [quote, editingId, attachmentUrls]);

  const handleSuggestionClick = (name: string) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    generateReview(name);
  };

  const fetchQuotes = async () => {
    const { data } = await supabase.from("client_quotes").select("*").order("created_at", { ascending: false }).limit(50);
    setExistingQuotes(data || []);
  };

  const clientGroups = existingQuotes.reduce<Record<string, { email: string; quotes: any[] }>>((acc, q) => {
    const key = q.client_name;
    if (!acc[key]) acc[key] = { email: q.client_email || "", quotes: [] };
    acc[key].quotes.push(q);
    return acc;
  }, {});

  const uniqueClients = Object.entries(clientGroups).map(([name, { email }]) => ({ name, email }));

  const selectReview = async (r: any) => {
    let reviewData = r.review_data || null;
    if (includeReview && r.slug && (!reviewData || !reviewData.summary)) {
      const { data } = await supabase.from("cached_reviews").select("review_data").eq("slug", r.slug).single();
      if (data) reviewData = data.review_data;
    }
    setQuote((prev) => ({
      ...prev,
      resortName: r.property_name,
      resortReviewSlug: r.slug,
      destination: r.location || "",
      reviewSummary: reviewData?.summary || "",
      includeReview,
      reviewData: includeReview ? reviewData : null,
    }));
    setStep(2);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await generateReview(searchQuery.trim());
  };

  useEffect(() => {
    if (review) {
      const reviewData = review.review_data as any;
      setQuote((prev) => ({
        ...prev,
        resortName: review.property_name,
        resortReviewSlug: review.slug,
        destination: review.location || "",
        reviewSummary: reviewData?.summary || "",
        includeReview,
        reviewData: includeReview ? reviewData : null,
      }));
      setStep(2);
    }
  }, [review]);

  const totalPrice = quote.lineItems.reduce((s, li) => s + (li.amount || 0), 0);

  const handleSave = async () => {
    if (!quote.clientName.trim() || !quote.resortName.trim()) {
      toast({ title: "Missing fields", description: "Client name and resort are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: Record<string, any> = {
      client_name: quote.clientName,
      client_email: quote.clientEmail || null,
      resort_name: quote.resortName,
      resort_review_slug: quote.resortReviewSlug || null,
      destination: quote.destination || null,
      check_in: quote.checkIn || null,
      check_out: quote.checkOut || null,
      num_travellers: quote.numTravellers,
      flight_details: quote.flights,
      line_items: quote.lineItems,
      total_price: totalPrice,
      currency: quote.currency,
      notes: quote.notes || null,
      status: quote.status,
      include_review: quote.includeReview,
      review_data: quote.includeReview ? quote.reviewData : null,
      attachment_urls: attachmentUrls.length > 0 ? attachmentUrls : null,
      room_type: quote.roomType || null,
      inclusions: quote.inclusions.length > 0 ? quote.inclusions : [],
      valid_until: quote.validUntil || null,
    };

    let result;
    if (editingId) {
      result = await supabase.from("client_quotes").update(payload as any).eq("id", editingId).select().single();
    } else {
      result = await supabase.from("client_quotes").insert(payload as any).select().single();
    }

    if (result.error) {
      toast({ title: "Error", description: result.error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: `Quote for ${quote.clientName} saved.` });
      setEditingId(result.data.id);
      setQuote((prev) => ({ ...prev, shareToken: result.data.share_token }));
      fetchQuotes();
    }
    setSaving(false);
  };

  const loadQuote = (q: any) => {
    setEditingId(q.id);
    setQuote({
      clientName: q.client_name, clientEmail: q.client_email || "", resortName: q.resort_name,
      resortReviewSlug: q.resort_review_slug || "", destination: q.destination || "",
      checkIn: q.check_in || "", checkOut: q.check_out || "", numTravellers: q.num_travellers || 2,
      roomType: q.room_type || "", inclusions: q.inclusions || [], flights: q.flight_details || [{ ...emptyFlight }],
      lineItems: q.line_items || [{ ...emptyLineItem }], notes: q.notes || "",
      currency: q.currency || "CAD", status: q.status || "draft", shareToken: q.share_token,
      reviewSummary: "",
      includeReview: q.include_review || false,
      reviewData: q.review_data || null,
      attachmentUrls: q.attachment_urls || [],
      validUntil: q.valid_until || format(addDays(new Date(q.created_at), 14), "yyyy-MM-dd"),
    });
    setAttachmentUrls(q.attachment_urls || []);
    setIncludeReview(q.include_review || false);
    setStep(2);
  };

  const resetQuote = () => {
    setEditingId(null);
    setIncludeReview(false);
    setSelectedClient("__new__");
    setAttachmentUrls([]);
    setQuote({
      clientName: "", clientEmail: "", resortName: "", resortReviewSlug: "", destination: "",
      checkIn: "", checkOut: "", numTravellers: 2, roomType: "", inclusions: [],
      flights: [{ ...emptyFlight }], lineItems: [{ ...emptyLineItem }],
      notes: "", currency: "CAD", status: "draft", reviewSummary: "",
      includeReview: false, reviewData: null, attachmentUrls: [],
      validUntil: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    });
    setStep(1);
  };

  const handleClientSelect = (value: string) => {
    setSelectedClient(value);
    if (value === "__new__") {
      setQuote((prev) => ({ ...prev, clientName: "", clientEmail: "" }));
    } else {
      const client = uniqueClients.find((c) => c.name === value);
      if (client) {
        setQuote((prev) => ({ ...prev, clientName: client.name, clientEmail: client.email }));
      }
    }
  };

  const openBookingDialog = (q: any) => {
    setBookingQuote(q);
    setBookingDialogOpen(true);
  };

  const duplicateQuote = (q: any) => {
    setEditingId(null);
    setQuote({
      clientName: q.client_name, clientEmail: q.client_email || "", resortName: q.resort_name,
      resortReviewSlug: q.resort_review_slug || "", destination: q.destination || "",
      checkIn: q.check_in || "", checkOut: q.check_out || "", numTravellers: q.num_travellers || 2,
      roomType: q.room_type || "", inclusions: q.inclusions || [], flights: q.flight_details || [{ ...emptyFlight }],
      lineItems: q.line_items || [{ ...emptyLineItem }], notes: q.notes || "",
      currency: q.currency || "CAD", status: "draft", reviewSummary: "",
      includeReview: q.include_review || false, reviewData: q.review_data || null,
      attachmentUrls: [],
      validUntil: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    });
    setIncludeReview(q.include_review || false);
    setStep(2);
    toast({ title: "Quote duplicated", description: "Edit and save as a new quote." });
  };

  const moveLineItem = (index: number, direction: "up" | "down") => {
    const newItems = [...quote.lineItems];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    setQuote({ ...quote, lineItems: newItems });
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim()) return;
    const { error } = await supabase.from("quote_templates" as any).insert({
      name: templateName.trim(),
      line_items: quote.lineItems,
      inclusions: quote.inclusions,
      currency: quote.currency,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Template saved!", description: `"${templateName}" is ready to use.` });
      setTemplateName("");
      setShowTemplateSave(false);
      fetchTemplates();
    }
  };

  const loadTemplate = (t: any) => {
    setQuote((prev) => ({
      ...prev,
      lineItems: t.line_items || [{ ...emptyLineItem }],
      inclusions: t.inclusions || [],
      currency: t.currency || prev.currency,
    }));
    toast({ title: "Template loaded", description: `"${t.name}" applied to pricing.` });
  };

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    booked: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expired: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Quote Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create professional vacation quotes for your clients.
            {autoSaved && <span className="ml-2 text-emerald-400 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Auto-saved</span>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetQuote}>New Quote</Button>
      </div>

      {/* Client Files - grouped quotes */}
      {Object.keys(clientGroups).length > 0 && step === 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {Object.entries(clientGroups).map(([name, { email, quotes }]) => (
                <AccordionItem key={name} value={name}>
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div>
                        <span className="text-sm font-medium text-foreground">{name}</span>
                        {email && <span className="text-xs text-muted-foreground ml-2">{email}</span>}
                      </div>
                      <Badge variant="secondary" className="text-xs">{quotes.length} {quotes.length === 1 ? "quote" : "quotes"}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pl-2">
                      {quotes.map((q: any) => (
                        <div key={q.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <button onClick={() => loadQuote(q)} className="flex items-center gap-2 text-left flex-1">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{q.resort_name}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs capitalize ${statusColors[q.status] || ""}`}>{q.status}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => duplicateQuote(q)}>
                              <Copy className="h-3 w-3" /> Duplicate
                            </Button>
                            {q.status !== "booked" && (
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => openBookingDialog(q)}>
                                <CalendarIcon className="h-3 w-3" /> Book
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {["Resort", "Details", "Pricing", "Preview"].map((s, i) => (
          <button key={s} onClick={() => setStep(i + 1)} className={`px-3 py-1.5 rounded-full transition-colors ${step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Step 1: Select Resort */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Search or Select a Resort</h3>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Checkbox id="include-review" checked={includeReview} onCheckedChange={(c) => setIncludeReview(!!c)} />
              <label htmlFor="include-review" className="text-sm font-medium text-foreground cursor-pointer">
                Include resort review in this quote
              </label>
              <span className="text-xs text-muted-foreground ml-1">(ratings, summary, tips — no affiliate links)</span>
            </div>

            <div className="relative" ref={suggestionsRef}>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for a resort or destination..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading} className="gap-2">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-elevated overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s.name)}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                    >
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      {s.secondaryText && <p className="text-xs text-muted-foreground">{s.secondaryText}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {cachedReviews.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Or pick from recent reviews:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {cachedReviews.map((r) => {
                    const rating = (r.review_data as any)?.overallRating ?? 0;
                    return (
                      <button
                        key={r.slug}
                        onClick={() => selectReview(r)}
                        className="group text-left bg-card rounded-xl border border-border p-4 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 flex flex-col"
                      >
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(rating) ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
                            />
                          ))}
                          <span className="text-xs font-semibold text-foreground ml-1">{rating}</span>
                        </div>
                        <h4 className="font-display font-bold text-foreground text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                          {r.property_name}
                        </h4>
                        {r.location && (
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">{r.location}</span>
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Vacation Details */}
      {step === 2 && (
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="font-semibold text-foreground">Vacation Details — {quote.resortName}</h3>
            {quote.includeReview && quote.reviewData && (
              <Badge variant="secondary" className="text-xs">✓ Resort review will be included in quote</Badge>
            )}

            {uniqueClients.length > 0 && (
              <div>
                <Label>Select Existing Client</Label>
                <Select value={selectedClient} onValueChange={handleClientSelect}>
                  <SelectTrigger><SelectValue placeholder="Choose a client..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__new__">+ New Client</SelectItem>
                    {uniqueClients.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name}{c.email ? ` — ${c.email}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Client Name *</Label><Input value={quote.clientName} onChange={(e) => setQuote({ ...quote, clientName: e.target.value })} /></div>
              <div><Label>Client Email</Label><Input type="email" value={quote.clientEmail} onChange={(e) => setQuote({ ...quote, clientEmail: e.target.value })} /></div>
              <div><Label>Check-In</Label><Input type="date" value={quote.checkIn} onChange={(e) => setQuote({ ...quote, checkIn: e.target.value })} /></div>
              <div><Label>Check-Out</Label><Input type="date" value={quote.checkOut} onChange={(e) => setQuote({ ...quote, checkOut: e.target.value })} /></div>
              <div><Label>Travellers</Label><Input type="number" min={1} value={quote.numTravellers} onChange={(e) => setQuote({ ...quote, numTravellers: parseInt(e.target.value) || 1 })} /></div>
              <div><Label>Room Type</Label><Input value={quote.roomType} onChange={(e) => setQuote({ ...quote, roomType: e.target.value })} placeholder="e.g. Ocean View Suite" /></div>
              <div><Label>Valid Until</Label><Input type="date" value={quote.validUntil} onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })} /></div>
            </div>

            <div>
              <Label>Inclusions</Label>
              <MultiTagInput
                presets={INCLUSION_PRESETS}
                value={quote.inclusions}
                onChange={(tags) => setQuote({ ...quote, inclusions: tags })}
                placeholder="Select or type inclusions..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Flight Details</Label>
                <Button variant="ghost" size="sm" onClick={() => setQuote({ ...quote, flights: [...quote.flights, { ...emptyFlight }] })}>
                  <Plus className="h-3 w-3 mr-1" /> Add Flight
                </Button>
              </div>
              {quote.flights.map((f, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-border relative">
                  {quote.flights.length > 1 && (
                    <button onClick={() => setQuote({ ...quote, flights: quote.flights.filter((_, j) => j !== i) })} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <Input placeholder="Airline" value={f.airline} onChange={(e) => { const flights = [...quote.flights]; flights[i] = { ...f, airline: e.target.value }; setQuote({ ...quote, flights }); }} />
                  <Input placeholder="Flight #" value={f.flightNumber} onChange={(e) => { const flights = [...quote.flights]; flights[i] = { ...f, flightNumber: e.target.value }; setQuote({ ...quote, flights }); }} />
                  <Input placeholder="From (YYZ)" value={f.departureAirport} onChange={(e) => { const flights = [...quote.flights]; flights[i] = { ...f, departureAirport: e.target.value }; setQuote({ ...quote, flights }); }} />
                  <Input placeholder="To (CUN)" value={f.arrivalAirport} onChange={(e) => { const flights = [...quote.flights]; flights[i] = { ...f, arrivalAirport: e.target.value }; setQuote({ ...quote, flights }); }} />
                  <Input type="datetime-local" value={f.departureTime} onChange={(e) => { const flights = [...quote.flights]; flights[i] = { ...f, departureTime: e.target.value }; setQuote({ ...quote, flights }); }} />
                  <Input type="datetime-local" value={f.arrivalTime} onChange={(e) => { const flights = [...quote.flights]; flights[i] = { ...f, arrivalTime: e.target.value }; setQuote({ ...quote, flights }); }} />
                </div>
              ))}
            </div>

            <Textarea placeholder="Special notes..." value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={() => setStep(3)}>Pricing <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="font-semibold text-foreground">Pricing</h3>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="w-32">
                <Label>Currency</Label>
                <Select value={quote.currency} onValueChange={(v) => setQuote({ ...quote, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD $</SelectItem>
                    <SelectItem value="USD">USD $</SelectItem>
                    <SelectItem value="EUR">EUR €</SelectItem>
                    <SelectItem value="GBP">GBP £</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Templates */}
              {templates.length > 0 && (
                <div>
                  <Label>Load Template</Label>
                  <Select onValueChange={(id) => { const t = templates.find((t: any) => t.id === id); if (t) loadTemplate(t); }}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Choose..." /></SelectTrigger>
                    <SelectContent>
                      {templates.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button variant="ghost" size="sm" onClick={() => setQuote({ ...quote, lineItems: [...quote.lineItems, { ...emptyLineItem }] })}>
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>
              {quote.lineItems.map((li, i) => (
                <div key={i} className="flex gap-2 items-center">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveLineItem(i, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button onClick={() => moveLineItem(i, "down")} disabled={i === quote.lineItems.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  <Select value={li.category || ""} onValueChange={(v) => { const lineItems = [...quote.lineItems]; lineItems[i] = { ...li, category: v }; setQuote({ ...quote, lineItems }); }}>
                    <SelectTrigger className="w-[120px] shrink-0"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {LINE_ITEM_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Description" value={li.description} onChange={(e) => { const lineItems = [...quote.lineItems]; lineItems[i] = { ...li, description: e.target.value }; setQuote({ ...quote, lineItems }); }} className="flex-1" />
                  <Input type="number" placeholder="Amount" value={li.amount || ""} onChange={(e) => { const lineItems = [...quote.lineItems]; lineItems[i] = { ...li, amount: parseFloat(e.target.value) || 0 }; setQuote({ ...quote, lineItems }); }} className="w-32" />
                  {quote.lineItems.length > 1 && (
                    <button onClick={() => setQuote({ ...quote, lineItems: quote.lineItems.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-border">
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">Total: {quote.currency} ${totalPrice.toLocaleString()}</p>
                  {quote.numTravellers > 1 && (
                    <p className="text-xs text-muted-foreground">${(totalPrice / quote.numTravellers).toLocaleString()} per person</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save as Template */}
            <div className="flex items-center gap-2">
              {showTemplateSave ? (
                <>
                  <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name..." className="w-48" />
                  <Button size="sm" onClick={saveAsTemplate} disabled={!templateName.trim()} className="gap-1">
                    <BookmarkPlus className="h-3 w-3" /> Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplateSave(false)}>Cancel</Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowTemplateSave(true)} className="gap-1 text-xs">
                  <BookmarkPlus className="h-3 w-3" /> Save as Template
                </Button>
              )}
            </div>

            {/* Attach Document */}
            <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
              <Label className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attach Document</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const prefix = editingId || Date.now().toString();
                  const path = `quotes/${prefix}-${file.name}`;
                  const { data, error } = await supabase.storage.from("booking-documents").upload(path, file, { upsert: true });
                  if (error) {
                    toast({ title: "Upload failed", description: error.message, variant: "destructive" });
                  } else {
                    setAttachmentUrls((prev) => [...prev, data.path]);
                    toast({ title: "Document attached" });
                  }
                  setUploading(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
              {attachmentUrls.length > 0 && (
                <div className="space-y-1.5">
                  {attachmentUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      <button
                        onClick={async () => {
                          const { data } = await supabase.storage.from("booking-documents").createSignedUrl(url, 3600);
                          if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                        }}
                        className="text-primary hover:underline truncate max-w-[300px] text-left"
                      >
                        {url.split("/").pop()}
                      </button>
                      <button onClick={() => setAttachmentUrls((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG, or WEBP</p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Draft
                </Button>
                <Button onClick={() => setStep(4)}>Preview <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <QuotePreview quote={quote} totalPrice={totalPrice} onBack={() => setStep(3)} onSave={handleSave} saving={saving} editingId={editingId} />
      )}

      {/* Booking from Quote Dialog */}
      <BookingFromQuoteDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        quoteData={bookingQuote}
        onSaved={fetchQuotes}
      />
    </div>
  );
};

export default QuoteBuilder;
