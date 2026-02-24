import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import QuoteReviewSection from "@/components/dashboard/QuoteReviewSection";
import TripDetailsCard from "@/components/dashboard/TripDetailsCard";

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

const PublicQuote = () => {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = "Your Vacation Quote - ReviewThenGo";
    if (!token) { setError(true); setLoading(false); return; }
    supabase.from("client_quotes").select("*").eq("share_token", token).single()
      .then(({ data, error: err }) => {
        if (err || !data) setError(true);
        else setQuote(data);
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (error || !quote) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Quote Not Found</h1>
        <p className="text-muted-foreground">This quote link may be invalid or expired.</p>
      </div>
    </div>
  );

  const lineItems = (quote.line_items as any[]) || [];
  const flights = (quote.flight_details as any[]) || [];
  const inclusions = (quote.inclusions as string[]) || [];
  const attachments = (quote.attachment_urls as string[]) || [];
  const heroImage = (quote.review_data as any)?.photos?.[0] || (quote.review_data as any)?.heroImage || null;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-8 space-y-6">
            {/* Resort Hero Image */}
            {heroImage && (
              <div className="rounded-lg overflow-hidden -mx-2 -mt-2 mb-4">
                <img src={heroImage} alt={quote.resort_name} className="w-full h-48 object-cover" />
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Vacation Quote</h1>
                <p className="text-sm text-muted-foreground mt-1">Prepared for {quote.client_name}</p>
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
              <h2 className="font-display text-xl font-bold text-foreground">{quote.resort_name}</h2>
              {quote.destination && <p className="text-sm text-muted-foreground">{quote.destination}</p>}
            </div>

            {/* Embedded Review Section with Trip Details in sidebar */}
            {quote.include_review && quote.review_data ? (
              <QuoteReviewSection
                reviewData={quote.review_data}
                hideHeader
                tripDetailsProps={{
                  resortName: quote.resort_name,
                  destination: quote.destination,
                  roomType: quote.room_type,
                  checkIn: quote.check_in,
                  checkOut: quote.check_out,
                  numTravellers: quote.num_travellers,
                  flights,
                  lineItems,
                  totalPrice: quote.total_price,
                  currency: quote.currency || "CAD",
                  inclusions,
                  notes: quote.notes,
                  attachmentUrls: attachments,
                }}
              />
            ) : (
              <TripDetailsCard
                resortName={quote.resort_name}
                destination={quote.destination}
                roomType={quote.room_type}
                checkIn={quote.check_in}
                checkOut={quote.check_out}
                numTravellers={quote.num_travellers}
                flights={flights}
                lineItems={lineItems}
                totalPrice={quote.total_price}
                currency={quote.currency || "CAD"}
                inclusions={inclusions}
                notes={quote.notes}
                attachmentUrls={attachments}
              />
            )}

            {/* Footer: Valid Until + Agent Contact */}
            <div className="border-t border-border pt-4 space-y-2">
              {quote.valid_until && (
                <p className="text-xs text-muted-foreground text-center">
                  Quote valid until <span className="font-medium text-foreground">{format(new Date(quote.valid_until + "T00:00:00"), "MMM d, yyyy")}</span>
                </p>
              )}
              <div className="text-center text-xs text-muted-foreground">
                <p className="font-medium text-foreground">{AGENT_INFO.name}</p>
                <p>{AGENT_INFO.agency} · {AGENT_INFO.email}</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">Generated on {format(new Date(quote.created_at), "MMM d, yyyy")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicQuote;
