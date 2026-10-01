import { useState, useEffect, useMemo } from "react";
import { openWorkOutlook } from "@/lib/openWorkOutlook";
import { ChevronLeft, Download, Link2, Mail, Loader2, ChevronDown, Send, PlusCircle, Home, Pencil, X, Check, Trash2, ImagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { QuoteData } from "./QuoteBuilder";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuoteReviewSection from "./QuoteReviewSection";
import TripDetailsCard from "./TripDetailsCard";

const AGENT_INFO = {
  name: "Tom Laracy",
  email: "tlaracy@travelonly.com",
  agency: "TravelOnly",
};

interface QuotePreviewProps {
  quote: QuoteData;
  totalPrice: number;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
  editingId: string | null;
  onNewQuote?: () => void;
  onDashboardHome?: () => void;
  onUpdate?: (updates: Partial<QuoteData>) => void;
}

const QuotePreview = ({ quote, totalPrice, onBack, onSave, saving, editingId, onNewQuote, onDashboardHome, onUpdate }: QuotePreviewProps) => {
  const [sendingDirect, setSendingDirect] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftMarkdown, setDraftMarkdown] = useState(quote.quoteMarkdown || "");
  const [draftSummary, setDraftSummary] = useState(quote.summary || "");
  const [draftNotes, setDraftNotes] = useState(quote.notes || "");
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Sync drafts when quote changes (e.g. after save reload)
  useEffect(() => {
    setDraftMarkdown(quote.quoteMarkdown || "");
    setDraftSummary(quote.summary || "");
    setDraftNotes(quote.notes || "");
  }, [quote.quoteMarkdown, quote.summary, quote.notes]);

  const handlePrint = () => window.print();

  const shareUrl = quote.shareToken ? `https://reviewthengo.lovable.app/quote/${quote.shareToken}` : null;
  const hasMarkdown = !!quote.quoteMarkdown;

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    setDraftMarkdown(quote.quoteMarkdown || "");
    setDraftSummary(quote.summary || "");
    setDraftNotes(quote.notes || "");
    setIsEditing(false);
  };
  const saveEdit = () => {
    if (!onUpdate) {
      toast({ title: "Cannot save", description: "Editing is not wired up.", variant: "destructive" });
      return;
    }
    if (hasMarkdown) {
      onUpdate({ quoteMarkdown: draftMarkdown });
    } else {
      onUpdate({ summary: draftSummary, notes: draftNotes });
    }
    setIsEditing(false);
    toast({ title: "Quote updated", description: "Your changes have been saved." });
  };

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share this link with your client." });
    } else {
      toast({ title: "Save first", description: "Save the quote to generate a share link.", variant: "destructive" });
    }
  };

  const emailSubject = `Your Vacation Quote - ${quote.resortName}`;
  const emailBody = shareUrl
    ? `Hi ${quote.clientName},\n\nYour vacation quote for ${quote.resortName} in ${quote.destination} is ready!\n\nClick below to view your quote:\n\n${shareUrl}\n\nLet me know if you have any questions!\n\nBest regards,\n${AGENT_INFO.name} - ${AGENT_INFO.agency}`
    : "";

  const requireSaved = () => {
    if (!shareUrl) {
      toast({ title: "Save first", description: "Please save the quote to generate a shareable link before sending.", variant: "destructive" });
      return true;
    }
    return false;
  };

  const openOutlook = () => {
    if (requireSaved()) return;
    openWorkOutlook(quote.clientEmail || '', emailSubject, emailBody);
  };

  const openGmail = () => {
    if (requireSaved()) return;
    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(quote.clientEmail || "")}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  };

  const openYahoo = () => {
    if (requireSaved()) return;
    window.open(`https://compose.mail.yahoo.com/?to=${encodeURIComponent(quote.clientEmail || "")}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  };

  const buildHtmlEmail = () => {
    if (!shareUrl) return "";
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f7f7f7;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:24px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#0284c7,#06b6d4);padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Your Vacation Quote</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Prepared for ${quote.clientName}</p>
  </td></tr>
  <tr><td style="padding:32px;text-align:center;">
    <h2 style="margin:0 0 4px;font-size:20px;color:#1e293b;">${quote.resortName}</h2>
    <p style="margin:0;color:#64748b;font-size:14px;">${quote.destination}</p>
    <p style="margin:28px 0;"><a href="${shareUrl}" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:16px;">View Your Quote</a></p>
    <p style="margin:0;color:#64748b;font-size:13px;">Let me know if you have any questions!</p>
  </td></tr>
  <tr><td style="padding:20px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#1e293b;">${AGENT_INFO.name}</p>
    <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${AGENT_INFO.agency} · ${AGENT_INFO.email}</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
  };

  const sendDirect = async () => {
    if (requireSaved()) return;
    if (!quote.clientEmail) {
      toast({ title: "No email", description: "Client email is required to send directly.", variant: "destructive" });
      return;
    }
    setSendingDirect(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { to: quote.clientEmail, subject: emailSubject, text: emailBody, html: buildHtmlEmail() },
      });
      if (error) throw error;
      toast({ title: "Email sent!", description: `Quote emailed to ${quote.clientEmail}.` });
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message || "Could not send email.", variant: "destructive" });
    } finally {
      setSendingDirect(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="print:shadow-none print:border-none" id="quote-preview">
        <CardContent className="p-8">
          {isEditing && hasMarkdown ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Edit quote</Label>
                <Button variant="outline" size="sm" onClick={() => setShowLivePreview((v) => !v)}>
                  {showLivePreview ? "Hide preview" : "Show preview"}
                </Button>
              </div>
              <PictureManager markdown={draftMarkdown} onChange={setDraftMarkdown} />
              <div>
                <Label className="text-xs text-muted-foreground">Markdown content (edit any text below)</Label>
                <Textarea
                  value={draftMarkdown}
                  onChange={(e) => setDraftMarkdown(e.target.value)}
                  className="font-mono text-xs min-h-[600px] leading-relaxed mt-1"
                  placeholder="Edit the quote markdown..."
                />
              </div>
              {showLivePreview && (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Live preview</p>
                  <article className="prose prose-sm sm:prose dark:prose-invert max-w-none prose-headings:font-display prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{draftMarkdown}</ReactMarkdown>
                  </article>
                </div>
              )}
            </div>
          ) : isEditing && !hasMarkdown ? (
            <div className="space-y-4">
              <div>
                <Label>Summary</Label>
                <Textarea value={draftSummary} onChange={(e) => setDraftSummary(e.target.value)} className="min-h-[120px]" placeholder="Quote summary..." />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} className="min-h-[120px]" placeholder="Additional notes..." />
              </div>
              <p className="text-xs text-muted-foreground">For other fields (resort, dates, pricing, flights, inclusions), go back and edit them in the form.</p>
            </div>
          ) : hasMarkdown ? (
            <article className="prose prose-sm sm:prose dark:prose-invert max-w-none prose-headings:font-display prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-li:leading-relaxed prose-table:text-sm prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {quote.quoteMarkdown}
              </ReactMarkdown>
            </article>
          ) : (
            /* Fallback: structured layout for manually-built quotes */
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Vacation Quote</h2>
                  <p className="text-sm text-muted-foreground mt-1">Prepared for {quote.clientName}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold">
                    <span className="text-sky-400">Review</span>
                    <span className="text-amber-400">Then</span>
                    <span className="text-emerald-400">Go</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Travel Services</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-display text-xl font-bold text-foreground">{quote.resortName}</h3>
                <p className="text-sm text-muted-foreground">{quote.destination}</p>
              </div>

              {quote.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed">{quote.summary}</p>
              )}

              {quote.includeReview && quote.reviewData ? (
                <QuoteReviewSection
                  reviewData={quote.reviewData}
                  hideHeader
                  tripDetailsProps={{
                    resortName: quote.resortName,
                    destination: quote.destination,
                    roomType: quote.roomType,
                    checkIn: quote.checkIn,
                    checkOut: quote.checkOut,
                    numTravellers: quote.numTravellers,
                    flights: quote.flights,
                    lineItems: quote.lineItems,
                    totalPrice,
                    currency: quote.currency,
                    inclusions: quote.inclusions,
                    notes: quote.notes,
                    attachmentUrls: quote.attachmentUrls,
                  }}
                />
              ) : (
                <TripDetailsCard
                  resortName={quote.resortName}
                  destination={quote.destination}
                  roomType={quote.roomType}
                  checkIn={quote.checkIn}
                  checkOut={quote.checkOut}
                  numTravellers={quote.numTravellers}
                  flights={quote.flights}
                  lineItems={quote.lineItems}
                  totalPrice={totalPrice}
                  currency={quote.currency}
                  inclusions={quote.inclusions}
                  notes={quote.notes}
                  attachmentUrls={quote.attachmentUrls}
                />
              )}

              <div className="border-t border-border pt-4 space-y-2">
                <div className="text-center text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">{AGENT_INFO.name}</p>
                  <p>{AGENT_INFO.agency} · {AGENT_INFO.email}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions (hidden in print) */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
        {saving && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</span>
        )}
        {editingId && !saving && !isEditing && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">✓ Saved</span>
        )}
        {!isEditing ? (
          <>
            <Button variant="outline" onClick={startEdit} className="gap-2">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2"><Download className="h-4 w-4" /> Print / PDF</Button>
            <Button variant="outline" onClick={copyShareLink} className="gap-2"><Link2 className="h-4 w-4" /> Copy Link</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                  {sendingDirect ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Send Email <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={openOutlook}><Mail className="h-4 w-4 mr-2" /> Outlook</DropdownMenuItem>
                <DropdownMenuItem onClick={openGmail}><Mail className="h-4 w-4 mr-2" /> Gmail</DropdownMenuItem>
                <DropdownMenuItem onClick={openYahoo}><Mail className="h-4 w-4 mr-2" /> Yahoo Mail</DropdownMenuItem>
                <DropdownMenuItem onClick={sendDirect} disabled={sendingDirect}>
                  <Send className="h-4 w-4 mr-2" /> Send Direct {sendingDirect && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button onClick={saveEdit} className="gap-2">
              <Check className="h-4 w-4" /> Save Changes
            </Button>
            <Button variant="outline" onClick={cancelEdit} className="gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
          </>
        )}
      </div>

      {/* Navigation (hidden in print) */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2 print:hidden border-t border-border pt-3">
          {onNewQuote && (
            <Button variant="outline" onClick={onNewQuote} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Generate New Quote
            </Button>
          )}
          {onDashboardHome && (
            <Button variant="outline" onClick={onDashboardHome} className="gap-2">
              <Home className="h-4 w-4" /> Return to Dashboard
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuotePreview;

// --- Picture Manager: extract image lines from markdown, allow remove/add ---
interface PictureManagerProps {
  markdown: string;
  onChange: (md: string) => void;
}

const IMG_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

const PictureManager = ({ markdown, onChange }: PictureManagerProps) => {
  const [newUrl, setNewUrl] = useState("");

  const images = useMemo(() => {
    const out: { alt: string; url: string; match: string }[] = [];
    const re = new RegExp(IMG_RE.source, "g");
    let m;
    while ((m = re.exec(markdown)) !== null) {
      out.push({ alt: m[1] ?? "", url: m[2] ?? "", match: m[0] ?? "" });
    }
    return out;
  }, [markdown]);

  const removeImage = (match: string) => {
    // Remove the image line and any blank lines immediately surrounding it
    const escaped = match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\n*${escaped}\\n*`, "g");
    onChange(markdown.replace(re, "\n\n"));
  };

  const addImage = () => {
    const url = newUrl.trim();
    if (!url) return;
    // Insert near the top, after first heading
    const lines = markdown.split("\n");
    let insertAt = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line !== undefined && (line.startsWith("# ") || line.startsWith("## "))) {
        // find next blank line after heading
        for (let j = i + 1; j < lines.length; j++) {
          const next = lines[j];
          if (next !== undefined && next.trim() === "") { insertAt = j; break; }
        }
        break;
      }
    }
    lines.splice(insertAt + 1, 0, "", `![Trip photo](${url})`, "");
    onChange(lines.join("\n"));
    setNewUrl("");
  };

  return (
    <div className="border border-border rounded-lg p-3 bg-muted/20 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Pictures in this quote ({images.length})</Label>
        <p className="text-xs text-muted-foreground">Remove any photo that does not match the trip.</p>
      </div>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-md overflow-hidden border border-border bg-background">
              <img src={img.url} alt={img.alt} className="w-full h-24 object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeImage(img.match)}
                className="absolute top-1 right-1 h-7 w-7 p-0"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No pictures in this quote yet.</p>
      )}
      <div className="flex gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Paste image URL to add..."
          className="text-xs"
        />
        <Button type="button" variant="outline" size="sm" onClick={addImage} disabled={!newUrl.trim()} className="gap-1">
          <ImagePlus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
    </div>
  );
};
