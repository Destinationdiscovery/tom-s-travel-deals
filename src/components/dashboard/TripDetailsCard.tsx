import { format } from "date-fns";
import { Plane, Users, Calendar, BedDouble, Paperclip, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface FlightDetail {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
}

interface LineItem {
  category?: string;
  description: string;
  amount: number;
}

interface TripDetailsCardProps {
  resortName: string;
  destination?: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  numTravellers: number;
  flights: FlightDetail[];
  lineItems: LineItem[];
  totalPrice: number;
  currency: string;
  inclusions: string[];
  notes?: string;
  attachmentUrls?: string[];
}

const getNights = (checkIn: string, checkOut: string) => {
  const diff = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  return diff > 0 ? diff : null;
};

const TripDetailsCard = ({
  resortName,
  destination,
  roomType,
  checkIn,
  checkOut,
  numTravellers,
  flights,
  lineItems,
  totalPrice,
  currency,
  inclusions,
  notes,
  attachmentUrls,
}: TripDetailsCardProps) => {
  const currencySymbol = { CAD: "$", USD: "$", EUR: "€", GBP: "£" }[currency] || "$";
  const nights = checkIn && checkOut ? getNights(checkIn, checkOut) : null;
  const validFlights = flights.filter((f) => f.airline);
  const validLineItems = lineItems.filter((li) => li.description);

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card print:break-inside-avoid">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-4">
        <h3 className="text-lg font-bold text-white">{resortName}</h3>
        <div className="flex items-center gap-3 text-sky-100 text-sm mt-1">
          {destination && <span>{destination}</span>}
          {roomType && (
            <>
              <span className="opacity-50">·</span>
              <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{roomType}</span>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Date boxes row */}
        {(checkIn || checkOut) && (
          <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden">
            {checkIn && (
              <div className="p-3 text-center border-r border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Check-in</p>
                <p className="text-sm font-bold text-foreground mt-1">{format(new Date(checkIn), "MMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(checkIn), "EEEE")}</p>
              </div>
            )}
            {checkOut && (
              <div className="p-3 text-center border-r border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Check-out</p>
                <p className="text-sm font-bold text-foreground mt-1">{format(new Date(checkOut), "MMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(checkOut), "EEEE")}</p>
              </div>
            )}
            <div className="p-3 text-center flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Duration</p>
              {nights ? (
                <p className="text-sm font-bold text-foreground mt-1">{nights} {nights === 1 ? "night" : "nights"}</p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">—</p>
              )}
            </div>
          </div>
        )}

        {/* Travellers row */}
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">{numTravellers}</span> {numTravellers === 1 ? "traveller" : "travellers"}
          </span>
        </div>

        {/* Flights */}
        {validFlights.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Plane className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Flight Details</h4>
            </div>
            <div className="space-y-2">
              {validFlights.map((f, i) => (
                <div key={i} className="text-sm p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{f.airline} {f.flightNumber}</p>
                  </div>
                  <p className="text-muted-foreground mt-0.5">{f.departureAirport} → {f.arrivalAirport}</p>
                  {f.departureTime && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(f.departureTime), "MMM d, yyyy h:mm a")}
                      {f.arrivalTime ? ` → ${format(new Date(f.arrivalTime), "h:mm a")}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        {validLineItems.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Pricing</h4>
            <div className="space-y-1.5">
              {validLineItems.map((li, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {li.category && <span className="font-medium text-foreground">{li.category}: </span>}
                    {li.description}
                  </span>
                  <span className="text-foreground font-medium">{currencySymbol}{li.amount?.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-baseline text-base font-bold border-t border-border pt-3 mt-3">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{currency} {currencySymbol}{totalPrice?.toLocaleString()}</span>
              </div>
              {numTravellers > 1 && (
                <p className="text-xs text-muted-foreground text-right">
                  {currencySymbol}{(totalPrice / numTravellers).toLocaleString()} per person
                </p>
              )}
            </div>
          </div>
        )}

        {/* Inclusions */}
        {inclusions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Inclusions</h4>
            <div className="flex flex-wrap gap-1.5">
              {inclusions.map((inc, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{inc}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="text-sm rounded-lg bg-muted/30 p-3 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
            <p className="text-foreground">{notes}</p>
          </div>
        )}

        {/* Attachments */}
        {attachmentUrls && attachmentUrls.length > 0 && (
          <div className="text-sm">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Documents</p>
            <div className="space-y-1">
              {attachmentUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={async () => {
                    const { data } = await supabase.storage.from("booking-documents").createSignedUrl(url, 3600);
                    if (data?.signedUrl) {
                      const res = await fetch(data.signedUrl);
                      const blob = await res.blob();
                      const blobUrl = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = blobUrl;
                      a.download = url.split("/").pop() || "document";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(blobUrl);
                    }
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
      </div>
    </div>
  );
};

export default TripDetailsCard;
