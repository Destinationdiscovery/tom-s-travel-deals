import { useState } from "react";
import { ChevronLeft, Download, Link2, Mail, Save, Loader2, ChevronDown, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { QuoteData } from "./QuoteBuilder";
import { format } from "date-fns";
import QuoteReviewSection from "./QuoteReviewSection";
import TripDetailsCard from "./TripDetailsCard";

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

  const shareUrl = quote.shareToken ? `https://reviewthengo.lovable.app/quote/${quote.shareToken}` : null;
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
    window.location.href = `mailto:${quote.clientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
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
    const nights = getNights(quote.checkIn, quote.checkOut);
    const datesLine = quote.checkIn && quote.checkOut
      ? `<p style="margin:8px 0 0;color:#64748b;font-size:14px;">${quote.checkIn} — ${quote.checkOut}${nights ? ` (${nights} night${nights > 1 ? "s" : ""})` : ""}</p>`
      : "";

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
    ${datesLine}
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

          {/* Professional Summary */}
          {quote.summary && (
            <p className="text-sm text-muted-foreground leading-relaxed">{quote.summary}</p>
          )}

          {/* Embedded Review Section with Trip Details in sidebar */}
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
