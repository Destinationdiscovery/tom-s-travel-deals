import { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, ChevronLeft, Plus, Trash2, Save, Loader2, Users, FileText, Star, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { toast } from "@/hooks/use-toast";
import QuotePreview from "./QuotePreview";
import MultiTagInput from "./MultiTagInput";

interface LineItem {
  description: string;
  amount: number;
}

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
}

const INCLUSION_PRESETS = [
  "All-Inclusive", "Airport Transfers", "Travel Insurance", "Spa Package",
  "Kids Club", "Room Upgrade", "Late Check-Out", "Excursions",
  "Private Pool", "Butler Service", "Meal Plan", "Car Rental",
];

const emptyFlight: FlightDetail = { airline: "", flightNumber: "", departureAirport: "", arrivalAirport: "", departureTime: "", arrivalTime: "" };
const emptyLineItem: LineItem = { description: "", amount: 0 };

const QuoteBuilder = () => {
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

  const [quote, setQuote] = useState<QuoteData>({
    clientName: "", clientEmail: "", resortName: "", resortReviewSlug: "", destination: "",
    checkIn: "", checkOut: "", numTravellers: 2, roomType: "", inclusions: [],
    flights: [{ ...emptyFlight }], lineItems: [{ ...emptyLineItem }],
    notes: "", currency: "CAD", status: "draft", reviewSummary: "",
    includeReview: false, reviewData: null,
  });

  useEffect(() => {
    supabase.from("cached_reviews").select("id, property_name, slug, location, review_data, created_at").order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => setCachedReviews(data || []));
    fetchQuotes();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (name: string) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    generateReview(name);
  };

  const fetchQuotes = async () => {
    const { data } = await supabase.from("client_quotes").select("*").order("created_at", { ascending: false }).limit(50);
    setExistingQuotes(data || []);
  };

  // Group quotes by client
  const clientGroups = existingQuotes.reduce<Record<string, { email: string; quotes: any[] }>>((acc, q) => {
    const key = q.client_name;
    if (!acc[key]) acc[key] = { email: q.client_email || "", quotes: [] };
    acc[key].quotes.push(q);
    return acc;
  }, {});

  const selectReview = async (r: any) => {
    let reviewData = r.review_data || null;

    // If we only have partial data (from the list), fetch full review
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
    // Parse inclusions - could be stored in notes or line_items metadata
    const inclusions: string[] = [];
    setQuote({
      clientName: q.client_name, clientEmail: q.client_email || "", resortName: q.resort_name,
      resortReviewSlug: q.resort_review_slug || "", destination: q.destination || "",
      checkIn: q.check_in || "", checkOut: q.check_out || "", numTravellers: q.num_travellers || 2,
      roomType: "", inclusions, flights: q.flight_details || [{ ...emptyFlight }],
      lineItems: q.line_items || [{ ...emptyLineItem }], notes: q.notes || "",
      currency: q.currency || "CAD", status: q.status || "draft", shareToken: q.share_token,
      reviewSummary: "",
      includeReview: q.include_review || false,
      reviewData: q.review_data || null,
    });
    setIncludeReview(q.include_review || false);
    setStep(2);
  };

  const resetQuote = () => {
    setEditingId(null);
    setIncludeReview(false);
    setQuote({
      clientName: "", clientEmail: "", resortName: "", resortReviewSlug: "", destination: "",
      checkIn: "", checkOut: "", numTravellers: 2, roomType: "", inclusions: [],
      flights: [{ ...emptyFlight }], lineItems: [{ ...emptyLineItem }],
      notes: "", currency: "CAD", status: "draft", reviewSummary: "",
      includeReview: false, reviewData: null,
    });
    setStep(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Quote Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Create professional vacation quotes for your clients.</p>
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
                        <button key={q.id} onClick={() => loadQuote(q)} className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{q.resort_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">{q.status}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                          </div>
                        </button>
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

            {/* Include Review checkbox */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Client Name *</Label><Input value={quote.clientName} onChange={(e) => setQuote({ ...quote, clientName: e.target.value })} /></div>
              <div><Label>Client Email</Label><Input type="email" value={quote.clientEmail} onChange={(e) => setQuote({ ...quote, clientEmail: e.target.value })} /></div>
              <div><Label>Check-In</Label><Input type="date" value={quote.checkIn} onChange={(e) => setQuote({ ...quote, checkIn: e.target.value })} /></div>
              <div><Label>Check-Out</Label><Input type="date" value={quote.checkOut} onChange={(e) => setQuote({ ...quote, checkOut: e.target.value })} /></div>
              <div><Label>Travellers</Label><Input type="number" min={1} value={quote.numTravellers} onChange={(e) => setQuote({ ...quote, numTravellers: parseInt(e.target.value) || 1 })} /></div>
              <div><Label>Room Type</Label><Input value={quote.roomType} onChange={(e) => setQuote({ ...quote, roomType: e.target.value })} placeholder="e.g. Ocean View Suite" /></div>
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
            <div className="flex gap-4 items-end">
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
                  <Input placeholder="Description (e.g. Hotel)" value={li.description} onChange={(e) => { const lineItems = [...quote.lineItems]; lineItems[i] = { ...li, description: e.target.value }; setQuote({ ...quote, lineItems }); }} className="flex-1" />
                  <Input type="number" placeholder="Amount" value={li.amount || ""} onChange={(e) => { const lineItems = [...quote.lineItems]; lineItems[i] = { ...li, amount: parseFloat(e.target.value) || 0 }; setQuote({ ...quote, lineItems }); }} className="w-32" />
                  {quote.lineItems.length > 1 && (
                    <button onClick={() => setQuote({ ...quote, lineItems: quote.lineItems.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-border">
                <p className="text-lg font-bold text-foreground">Total: {quote.currency} ${totalPrice.toLocaleString()}</p>
              </div>
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
    </div>
  );
};

export default QuoteBuilder;
