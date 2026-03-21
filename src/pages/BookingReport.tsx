import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarIcon, MapPin, Ship, RefreshCw, Loader2, Trash2, Paperclip, Send, X, FileText, Download, Image as ImageIcon, Pencil, Sparkles, DollarSign, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Tables } from "@/integrations/supabase/types";

interface StorageFile {
  name: string;
  url: string;
}

interface AttachedFile {
  file: File;
  preview?: string;
}

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

const BookingReport = () => {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [events, setEvents] = useState<Tables<"bookings">[]>([]);
  const [documents, setDocuments] = useState<StorageFile[]>([]);
  const [deletingBooking, setDeletingBooking] = useState(false);

  // Report markdown
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [savingMarkdown, setSavingMarkdown] = useState(false);

  // Chat
  const [chatMessage, setChatMessage] = useState("");
  const [chatFiles, setChatFiles] = useState<AttachedFile[]>([]);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatStatus, setChatStatus] = useState("");
  const chatFileRef = useRef<HTMLInputElement>(null);

  // Commission
  const [commissionEdit, setCommissionEdit] = useState(false);
  const [commissionValue, setCommissionValue] = useState("");
  const [savingCommission, setSavingCommission] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Delete Document
  const [deletingDocName, setDeletingDocName] = useState<string | null>(null);

  // Derived
  const clientName = bookingDetails?.client_name || events[0]?.client_name || "";
  const supplier = bookingDetails?.supplier || events[0]?.supplier || "";
  const resortName = bookingDetails?.resort_name || events[0]?.title?.replace(/ - (Booked|Deposit Due|Final Payment|Trip Start|Trip End|Departure|Return)$/, "") || "";
  const tripStart = events.find(e => e.event_type === "trip_start")?.event_date;
  const tripEnd = events.find(e => e.event_type === "trip_end")?.event_date;

  const imageFiles = documents.filter(d => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.name));
  const otherFiles = documents.filter(d => !/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.name));

  useEffect(() => {
    if (bookingNumber) fetchAll();
  }, [bookingNumber]);

  useEffect(() => {
    if (resortName) {
      document.title = `${resortName}. Trip Report`;
    }
    return () => { document.title = "ReviewThenGo.com | Real Reviews, Tested Gear & Travel Insights"; };
  }, [resortName]);

  const fetchAll = async () => {
    if (!bookingNumber) return;
    setLoading(true);

    const [eventsResult, detailsResult] = await Promise.all([
      supabase.from("bookings").select("*").eq("booking_number", bookingNumber).order("event_date", { ascending: true }),
      supabase.from("booking_details").select("*").eq("booking_number", bookingNumber).maybeSingle(),
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
      const details = (detailsResult as any).data;
      setBookingDetails(details);
      setReportMarkdown(details.report_markdown || "");
      setCommissionValue(String(details.commission || 0));
    }

    setLoading(false);
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (!bookingDetails) return;
    setGenerating(true);
    try {
      // Gather document images to send to AI
      const filesPayload: any[] = [];
      if (documents.length > 0) {
        const cs = slugify(clientName);
        for (const doc of documents) {
          if (/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(doc.name)) {
            try {
              const { data: blob } = await supabase.storage.from("booking-documents").download(`${cs}/${doc.name}`);
              if (blob) {
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve((reader.result as string).split(",")[1]);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
                filesPayload.push({ name: doc.name, mimeType: blob.type || "image/jpeg", base64 });
              }
            } catch { /* skip failed downloads */ }
          }
        }
      }

      const { data: result, error } = await supabase.functions.invoke("generate-booking-report", {
        body: {
          bookingData: {
            ...bookingDetails,
            booking_number: bookingNumber,
            events: events.map(e => ({ event_type: e.event_type, event_date: e.event_date, title: e.title, is_completed: e.is_completed, notes: e.notes })),
          },
          files: filesPayload,
        },
      });

      if (error) throw error;

      const markdown = result?.markdown || "";
      const totalValue = result?.total_value || 0;

      // Save to DB
      await supabase.from("booking_details").update({
        report_markdown: markdown,
        total_value: totalValue,
      } as any).eq("booking_number", bookingNumber);

      setReportMarkdown(markdown);
      setBookingDetails((prev: any) => prev ? { ...prev, report_markdown: markdown, total_value: totalValue } : prev);
      toast({ title: "Report generated!", description: "Your booking report is ready." });
    } catch (err: any) {
      console.error("Generate report error:", err);
      toast({ title: "Error", description: err.message || "Failed to generate report.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Save edited markdown
  const handleSaveMarkdown = async () => {
    if (!bookingNumber) return;
    setSavingMarkdown(true);
    try {
      await supabase.from("booking_details").update({ report_markdown: editDraft } as any).eq("booking_number", bookingNumber);
      setReportMarkdown(editDraft);
      setIsEditing(false);
      toast({ title: "Report saved" });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSavingMarkdown(false);
    }
  };

  // Save commission
  const handleSaveCommission = async () => {
    if (!bookingNumber) return;
    setSavingCommission(true);
    try {
      const val = parseFloat(commissionValue) || 0;
      await supabase.from("booking_details").update({ commission: val } as any).eq("booking_number", bookingNumber);
      setBookingDetails((prev: any) => prev ? { ...prev, commission: val } : prev);
      setCommissionEdit(false);
      toast({ title: "Commission saved" });
    } catch (err: any) {
      toast({ title: "Error saving commission", description: err.message, variant: "destructive" });
    } finally {
      setSavingCommission(false);
    }
  };

  // Delete document
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

  // Delete booking
  const handleDeleteBooking = async () => {
    if (!bookingNumber) return;
    setDeletingBooking(true);
    await supabase.from("booking_details").delete().eq("booking_number", bookingNumber);
    const { error } = await supabase.from("bookings").delete().eq("booking_number", bookingNumber);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking deleted" });
      navigate(-1);
    }
    setDeletingBooking(false);
  };

  // Chat - add docs & re-generate
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
    setChatStatus("Uploading documents...");
    try {
      const cs = slugify(clientName);
      
      // Upload files to storage
      for (const af of chatFiles) {
        await supabase.storage.from("booking-documents").upload(`${cs}/${af.file.name}`, af.file, { upsert: true });
      }

      // If files were added, also send them to the booking-assistant for data extraction
      if (chatFiles.length > 0) {
        setChatStatus("Extracting data from documents...");
        const filesPayload = await Promise.all(chatFiles.map(async af => ({
          name: af.file.name, mimeType: af.file.type, base64: await fileToBase64(af.file),
        })));

        const existingBookings = [{ bookingNumber, clientName, title: resortName }];
        const contextMsg = `This is for existing booking ${bookingNumber} (${resortName}) for client ${clientName}. ${chatMessage}`;

        const { data: result, error } = await supabase.functions.invoke("booking-assistant", {
          body: { message: contextMsg, files: filesPayload, existing_bookings: existingBookings, existing_clients: [] },
        });
        if (error) throw error;

        // Process AI response to update booking_details
        const actions = result?.actions || (result?.action ? [{ action: result.action, data: result.data }] : []);
        if (actions.length > 0) {
          for (const act of actions) {
            const d = act.data;
            const mergeData: Record<string, any> = {};
            for (const [k, v] of Object.entries(d)) {
              if (v !== null && v !== undefined && k !== "booking_number" && k !== "client_name") {
                mergeData[k] = v;
              }
            }
            if (d.resort_or_trip) mergeData.resort_name = d.resort_or_trip;
            if (Object.keys(mergeData).length > 0) {
              await supabase.from("booking_details").update(mergeData as any).eq("booking_number", bookingNumber);
            }
          }
        }
      }

      // Re-fetch data and regenerate report
      setChatStatus("Re-generating report...");
      await fetchAll();
      
      // Small delay to let state update, then generate
      setTimeout(() => {
        handleGenerateReport();
      }, 500);

      setChatMessage("");
      setChatFiles([]);
      toast({ title: "Documents added!", description: "Report is being regenerated." });
    } catch (err: any) {
      console.error("Chat error:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-96 w-full rounded-2xl" />
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
        <div className="container mx-auto px-4 pt-6 max-w-4xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* Header Banner */}
        <div className="container mx-auto px-4 max-w-4xl mt-4 mb-8">
          <div className="rounded-2xl bg-primary/5 border border-border p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {bookingDetails?.ship_name && <Ship className="h-5 w-5 text-primary" />}
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    {bookingDetails?.ship_name ? `${bookingDetails.ship_name}, ` : ""}{resortName}
                  </h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {supplier && <Badge variant="outline" className="text-xs">{supplier}</Badge>}
                  <Badge className="font-mono text-xs">{bookingNumber}</Badge>
                  {bookingDetails?.booking_status && <Badge variant="default" className="text-xs">{bookingDetails.booking_status}</Badge>}
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleGenerateReport}
                  disabled={generating}
                >
                  {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {reportMarkdown ? "Re-generate" : "Generate Report"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Field */}
        <div className="container mx-auto px-4 max-w-4xl mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <DollarSign className="h-4 w-4 text-orange-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Commission</span>
            {commissionEdit ? (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveCommission()}
                  className="w-32 h-8 text-sm"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveCommission} disabled={savingCommission}>
                  {savingCommission ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setCommissionEdit(false); setCommissionValue(String(bookingDetails?.commission || 0)); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-lg font-bold text-foreground">${(parseFloat(commissionValue) || 0).toLocaleString()}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCommissionEdit(true)}>
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          {/* Markdown Report */}
          {generating ? (
            <Card className="overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating your booking report...</p>
              </CardContent>
            </Card>
          ) : reportMarkdown ? (
            <Card className="overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking Report</span>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-xs">Cancel</Button>
                      <Button size="sm" onClick={handleSaveMarkdown} disabled={savingMarkdown} className="text-xs gap-1">
                        {savingMarkdown && <Loader2 className="h-3 w-3 animate-spin" />} Save
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => { setEditDraft(reportMarkdown); setIsEditing(true); }} className="gap-1 text-xs">
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  )}
                </div>
              </div>
              <CardContent className="p-6 md:p-8">
                {isEditing ? (
                  <Textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="min-h-[500px] font-mono text-sm border-0 shadow-none focus-visible:ring-0 p-0 resize-none"
                    placeholder="Edit your booking report markdown..."
                  />
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none
                    prose-headings:font-display prose-headings:text-foreground
                    prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
                    prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-strong:text-foreground
                    prose-table:border prose-table:border-border prose-table:rounded-lg
                    prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2 prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-th:text-muted-foreground
                    prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-border prose-td:text-sm
                    prose-ul:text-muted-foreground prose-li:text-muted-foreground
                    prose-a:text-primary
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportMarkdown}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-lg font-display font-semibold mb-2">No Report Generated Yet</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Click "Generate Report" to create a comprehensive booking report from all your trip data and uploaded documents.
                </p>
                <Button onClick={handleGenerateReport} disabled={generating} className="gap-2">
                  <Sparkles className="h-4 w-4" /> Generate Report
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Documents & Photos
                <Badge variant="secondary" className="text-xs">{documents.length}</Badge>
              </h3>
            </div>
            <CardContent className="p-5">
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {/* Image Grid */}
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {imageFiles.map((img, i) => (
                        <div key={img.name} className="relative group">
                          <button
                            onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                            className="w-full aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all"
                          >
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
                          </button>
                          <AlertDialog open={deletingDocName === img.name} onOpenChange={(o) => { if (!o) setDeletingDocName(null); }}>
                            <AlertDialogTrigger asChild>
                              <button
                                onClick={() => setDeletingDocName(img.name)}
                                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete document?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete "{img.name}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteDocument(img.name)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Other Files */}
                  {otherFiles.length > 0 && (
                    <div className="space-y-2">
                      {otherFiles.map((file) => (
                        <div key={file.name} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => getSignedUrl(file.name)}>
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog open={deletingDocName === file.name} onOpenChange={(o) => { if (!o) setDeletingDocName(null); }}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => setDeletingDocName(file.name)}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete document?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently delete "{file.name}".</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteDocument(file.name)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 rounded-lg border border-dashed border-border">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No documents uploaded yet. Use the chat bar below to add documents.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
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
                      {deletingBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Sticky Chat Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl py-3">
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
              placeholder="Add documents, notes, or instructions..."
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
    </div>
  );
};

export default BookingReport;
