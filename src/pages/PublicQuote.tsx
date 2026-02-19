import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import QuoteReviewSection from "@/components/dashboard/QuoteReviewSection";

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
  const currencySymbol = { CAD: "$", USD: "$", EUR: "€", GBP: "£" }[quote.currency as string] || "$";

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 space-y-6">
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

            {/* Embedded Review Section */}
            {quote.include_review && quote.review_data && (
              <QuoteReviewSection reviewData={quote.review_data} />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {quote.check_in && <div><p className="text-muted-foreground text-xs">Check-In</p><p className="font-medium text-foreground">{format(new Date(quote.check_in), "MMM d, yyyy")}</p></div>}
              {quote.check_out && <div><p className="text-muted-foreground text-xs">Check-Out</p><p className="font-medium text-foreground">{format(new Date(quote.check_out), "MMM d, yyyy")}</p></div>}
              <div><p className="text-muted-foreground text-xs">Travellers</p><p className="font-medium text-foreground">{quote.num_travellers}</p></div>
            </div>

            {flights.length > 0 && flights.some((f: any) => f.airline) && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Flight Details</h3>
                {flights.filter((f: any) => f.airline).map((f: any, i: number) => (
                  <div key={i} className="text-sm p-3 rounded-lg bg-muted/50 mb-2">
                    <p className="font-medium text-foreground">{f.airline} {f.flightNumber}</p>
                    <p className="text-muted-foreground">{f.departureAirport} → {f.arrivalAirport}</p>
                    {f.departureTime && <p className="text-xs text-muted-foreground">{format(new Date(f.departureTime), "MMM d, yyyy h:mm a")}</p>}
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Pricing</h3>
              <div className="space-y-1">
                {lineItems.filter((li: any) => li.description).map((li: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{li.description}</span>
                    <span className="text-foreground">{currencySymbol}{li.amount?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{quote.currency} {currencySymbol}{quote.total_price?.toLocaleString()}</span>
                </div>
                {quote.num_travellers > 1 && (
                  <p className="text-xs text-muted-foreground text-right">{currencySymbol}{(quote.total_price / quote.num_travellers).toLocaleString()} per person</p>
                )}
              </div>
            </div>

            {quote.notes && (
              <div className="text-sm"><p className="text-muted-foreground text-xs mb-1">Notes</p><p className="text-foreground">{quote.notes}</p></div>
            )}

            <div className="border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">Generated on {format(new Date(quote.created_at), "MMM d, yyyy")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicQuote;
