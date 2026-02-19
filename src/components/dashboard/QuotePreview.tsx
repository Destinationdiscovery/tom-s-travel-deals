import { ChevronLeft, Download, Link2, Mail, Save, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { QuoteData } from "./QuoteBuilder";
import { format } from "date-fns";

interface QuotePreviewProps {
  quote: QuoteData;
  totalPrice: number;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
  editingId: string | null;
}

const QuotePreview = ({ quote, totalPrice, onBack, onSave, saving, editingId }: QuotePreviewProps) => {
  const handlePrint = () => window.print();

  const shareUrl = quote.shareToken ? `${window.location.origin}/quote/${quote.shareToken}` : null;

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share this link with your client." });
    } else {
      toast({ title: "Save first", description: "Save the quote to generate a share link.", variant: "destructive" });
    }
  };

  const openInOutlook = () => {
    const subject = encodeURIComponent(`Your Vacation Quote — ${quote.resortName}`);
    const body = encodeURIComponent(
      `Hi ${quote.clientName},\n\nPlease find your vacation quote details below:\n\n` +
      `Resort: ${quote.resortName}\n` +
      `Destination: ${quote.destination}\n` +
      (quote.checkIn ? `Dates: ${quote.checkIn} to ${quote.checkOut}\n` : "") +
      `Travellers: ${quote.numTravellers}\n\n` +
      `Total Price: ${quote.currency} $${totalPrice.toLocaleString()}\n\n` +
      (shareUrl ? `View your full quote online: ${shareUrl}\n\n` : "") +
      `Let me know if you have any questions!\n\nBest regards`
    );
    window.open(`mailto:${quote.clientEmail}?subject=${subject}&body=${body}`);
  };

  const currencySymbol = { CAD: "$", USD: "$", EUR: "€", GBP: "£" }[quote.currency] || "$";

  return (
    <div className="space-y-4">
      {/* Print-optimized quote card */}
      <Card className="print:shadow-none print:border-none" id="quote-preview">
        <CardContent className="p-8 space-y-6">
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
            {quote.reviewSummary && (
              <p className="text-sm text-muted-foreground mt-2 italic">"{quote.reviewSummary}"</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {quote.checkIn && <div><p className="text-muted-foreground text-xs">Check-In</p><p className="font-medium text-foreground">{format(new Date(quote.checkIn), "MMM d, yyyy")}</p></div>}
            {quote.checkOut && <div><p className="text-muted-foreground text-xs">Check-Out</p><p className="font-medium text-foreground">{format(new Date(quote.checkOut), "MMM d, yyyy")}</p></div>}
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
                  <span className="text-muted-foreground">{li.description}</span>
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

          {quote.notes && (
            <div className="text-sm"><p className="text-muted-foreground text-xs mb-1">Notes</p><p className="text-foreground">{quote.notes}</p></div>
          )}
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
        {quote.clientEmail && (
          <Button onClick={openInOutlook} className="gap-2"><Mail className="h-4 w-4" /> Send via Outlook</Button>
        )}
      </div>
    </div>
  );
};

export default QuotePreview;
