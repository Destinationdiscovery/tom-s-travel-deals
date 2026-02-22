import { useState } from "react";
import { ChevronLeft, Download, Link2, Mail, Save, Loader2, Paperclip, ExternalLink, ChevronDown, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { QuoteData } from "./QuoteBuilder";
import { format } from "date-fns";
import QuoteReviewSection from "./QuoteReviewSection";

const AGENT_INFO = {
  name: "Tom Laracy",
  email: "tlaracy@travelonly.com",
  agency: "TravelOnly",
};

const getNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return null;
  const diff = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  return diff > 0 ? diff : null;
};

interface QuotePreviewProps {
  quote: QuoteData;
  totalPrice: number;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
  editingId: string | null;
}

const QuotePreview = ({ quote, totalPrice, onBack, onSave, saving, editingId }: QuotePreviewProps) => {
  const [sendingDirect, setSendingDirect] = useState(false);
  const handlePrint = () => window.print();

  const shareUrl = quote.shareToken ? `${window.location.origin}/quote/${quote.shareToken}` : null;
  const nights = getNights(quote.checkIn, quote.checkOut);

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share this link with your client." });
    } else {
      toast({ title: "Save first", description: "Save the quote to generate a share link.", variant: "destructive" });
    }
  };

  const emailSubject = `Your Vacation Quote — ${quote.resortName}`;
  const emailBody =
    `Hi ${quote.clientName},\n\nPlease find your vacation quote details below:\n\n` +
    `Resort: ${quote.resortName}\n` +
    `Destination: ${quote.destination}\n` +
    (quote.checkIn ? `Dates: ${quote.checkIn} to ${quote.checkOut}\n` : "") +
    `Travellers: ${quote.numTravellers}\n\n` +
    `Total Price: ${quote.currency} $${totalPrice.toLocaleString()}\n\n` +
    (shareUrl ? `View your full quote online: ${shareUrl}\n\n` : "") +
    `Let me know if you have any questions!\n\nBest regards,\n${AGENT_INFO.name}\n${AGENT_INFO.agency}`;

  const openOutlook = () => {
    window.open(`mailto:${quote.clientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  };

  const openGmail = () => {
    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(quote.clientEmail || "")}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  };

  const openYahoo = () => {
    window.open(`https://compose.mail.yahoo.com/?to=${encodeURIComponent(quote.clientEmail || "")}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  };

  const buildHtmlEmail = () => {
    const nights = getNights(quote.checkIn, quote.checkOut);
    const cs = currencySymbol;
    const lineItemsHtml = quote.lineItems.filter(li => li.description).map(li =>
      `<tr><td style="padding:6px 0;color:#666;border-bottom:1px solid #eee;">${li.category ? `<strong>${li.category}:</strong> ` : ""}${li.description}</td><td style="padding:6px 0;text-align:right;border-bottom:1px solid #eee;">${cs}${li.amount.toLocaleString()}</td></tr>`
    ).join("");
    const inclusionsHtml = quote.inclusions.length > 0
      ? `<p style="margin-top:16px;"><strong>Inclusions:</strong> ${quote.inclusions.map(i => `<span style="display:inline-block;background:#e8f4fd;color:#0369a1;padding:2px 10px;border-radius:12px;font-size:12px;margin:2px 3px;">${i}</span>`).join("")}</p>` : "";
    const viewLink = shareUrl ? `<p style="text-align:center;margin:24px 0;"><a href="${shareUrl}" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;">View Full Quote Online</a></p>` : "";

    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f7f7f7;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:24px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#0284c7,#06b6d4);padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Vacation Quote</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Prepared for ${quote.clientName}</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <h2 style="margin:0 0 4px;font-size:20px;color:#1e293b;">${quote.resortName}</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">${quote.destination}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;font-size:13px;color:#334155;">
      <tr>
        ${quote.checkIn ? `<td style="padding:8px 0;"><strong>Check-In</strong><br/>${quote.checkIn}</td>` : ""}
        ${quote.checkOut ? `<td style="padding:8px 0;"><strong>Check-Out</strong><br/>${quote.checkOut}</td>` : ""}
        ${nights ? `<td style="padding:8px 0;"><strong>Duration</strong><br/>${nights} night${nights > 1 ? "s" : ""}</td>` : ""}
        <td style="padding:8px 0;"><strong>Travellers</strong><br/>${quote.numTravellers}</td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${lineItemsHtml}
      <tr><td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#1e293b;">Total</td><td style="padding:12px 0 0;text-align:right;font-size:16px;font-weight:700;color:#1e293b;">${quote.currency} ${cs}${totalPrice.toLocaleString()}</td></tr>
    </table>
    ${inclusionsHtml}
    ${quote.notes ? `<p style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;font-size:13px;color:#475569;"><strong>Notes:</strong> ${quote.notes}</p>` : ""}
    ${viewLink}
  </td></tr>
  <tr><td style="padding:20px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#1e293b;">${AGENT_INFO.name}</p>
    <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${AGENT_INFO.agency} · ${AGENT_INFO.email}</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
  };

  const sendDirect = async () => {
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

  const currencySymbol = { CAD: "$", USD: "$", EUR: "€", GBP: "£" }[quote.currency] || "$";

  // Try to get a hero image from review data
  const heroImage = quote.reviewData?.photos?.[0] || quote.reviewData?.heroImage || null;

  return (
    <div className="space-y-4">
      <Card className="print:shadow-none print:border-none" id="quote-preview">
        <CardContent className="p-8 space-y-6">
          {/* Resort Hero Image */}
          {heroImage && (
            <div className="rounded-lg overflow-hidden -mx-2 -mt-2 mb-4">
              <img src={heroImage} alt={quote.resortName} className="w-full h-48 object-cover" />
            </div>
          )}

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

          {/* Embedded Review Section */}
          {quote.includeReview && quote.reviewData && (
            <QuoteReviewSection reviewData={quote.reviewData} hideHeader />
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {quote.checkIn && (
              <div>
                <p className="text-muted-foreground text-xs">Check-In</p>
                <p className="font-medium text-foreground">{format(new Date(quote.checkIn), "MMM d, yyyy")}</p>
              </div>
            )}
            {quote.checkOut && (
              <div>
                <p className="text-muted-foreground text-xs">Check-Out</p>
                <p className="font-medium text-foreground">{format(new Date(quote.checkOut), "MMM d, yyyy")}</p>
              </div>
            )}
            {nights && (
              <div>
                <p className="text-muted-foreground text-xs">Duration</p>
                <p className="font-medium text-foreground">{nights} {nights === 1 ? "night" : "nights"}</p>
              </div>
            )}
            <div><p className="text-muted-foreground text-xs">Travellers</p><p className="font-medium text-foreground">{quote.numTravellers}</p></div>
            {quote.roomType && <div><p className="text-muted-foreground text-xs">Room Type</p><p className="font-medium text-foreground">{quote.roomType}</p></div>}
          </div>

          {/* Flights */}
          {quote.flights.some((f) => f.airline) && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Flight Details</h4>
              {quote.flights.filter((f) => f.airline).map((f, i) => (
                <div key={i} className="text-sm p-3 rounded-lg bg-muted/50 mb-2">
                  <p className="font-medium text-foreground">{f.airline} {f.flightNumber}</p>
                  <p className="text-muted-foreground">{f.departureAirport} → {f.arrivalAirport}</p>
                  {f.departureTime && <p className="text-xs text-muted-foreground">{format(new Date(f.departureTime), "MMM d, yyyy h:mm a")} → {f.arrivalTime ? format(new Date(f.arrivalTime), "h:mm a") : ""}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Pricing */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Pricing Breakdown</h4>
            <div className="space-y-1">
              {quote.lineItems.filter((li) => li.description).map((li, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {li.category && <span className="font-medium text-foreground">{li.category}: </span>}
                    {li.description}
                  </span>
                  <span className="text-foreground">{currencySymbol}{li.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{quote.currency} {currencySymbol}{totalPrice.toLocaleString()}</span>
              </div>
              {quote.numTravellers > 1 && (
                <p className="text-xs text-muted-foreground text-right">{currencySymbol}{(totalPrice / quote.numTravellers).toLocaleString()} per person</p>
              )}
            </div>
          </div>

          {/* Inclusions */}
          {quote.inclusions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Inclusions</h4>
              <div className="flex flex-wrap gap-1.5">
                {quote.inclusions.map((inc, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{inc}</Badge>
                ))}
              </div>
            </div>
          )}

          {quote.notes && (
            <div className="text-sm"><p className="text-muted-foreground text-xs mb-1">Notes</p><p className="text-foreground">{quote.notes}</p></div>
          )}

          {quote.attachmentUrls && quote.attachmentUrls.length > 0 && (
            <div className="text-sm">
              <p className="text-muted-foreground text-xs mb-1">Attached Documents</p>
              <div className="space-y-1">
                {quote.attachmentUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={async () => {
                      const { data } = await supabase.storage.from("booking-documents").createSignedUrl(url, 3600);
                      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                    }}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    {url.split("/").pop()}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Valid Until & Agent Contact Footer */}
          <div className="border-t border-border pt-4 space-y-2">
            {quote.validUntil && (
              <p className="text-xs text-muted-foreground text-center">
                Quote valid until <span className="font-medium text-foreground">{format(new Date(quote.validUntil + "T00:00:00"), "MMM d, yyyy")}</span>
              </p>
            )}
            <div className="text-center text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{AGENT_INFO.name}</p>
              <p>{AGENT_INFO.agency} · {AGENT_INFO.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions (hidden in print) */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button variant="outline" onClick={onSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
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
      </div>
    </div>
  );
};

export default QuotePreview;
