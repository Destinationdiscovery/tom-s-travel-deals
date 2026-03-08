import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ScrollToTop from "@/components/ScrollToTop";

const Index = lazy(() => import("./pages/Index"));
const AIReview = lazy(() => import("./pages/AIReview"));
const Destinations = lazy(() => import("./pages/Destinations"));
const DestinationReview = lazy(() => import("./pages/DestinationReview"));
const Compass = lazy(() => import("./pages/Compass"));
const CompassArticle = lazy(() => import("./pages/CompassArticle"));
const Gear = lazy(() => import("./pages/Gear"));
const GearAdmin = lazy(() => import("./pages/GearAdmin"));
const About = lazy(() => import("./pages/About"));
const Compare = lazy(() => import("./pages/Compare"));
const Contact = lazy(() => import("./pages/Contact"));
const TravelIntel = lazy(() => import("./pages/TravelIntel"));
const TopDestinations = lazy(() => import("./pages/TopDestinations"));
const MyReviews = lazy(() => import("./pages/MyReviews"));
const MyTrips = lazy(() => import("./pages/MyTrips"));
const Promo = lazy(() => import("./pages/Promo"));
const TravelSearch = lazy(() => import("./pages/TravelSearch"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AffiliateDisclosure = lazy(() => import("./pages/AffiliateDisclosure"));
const BookingReport = lazy(() => import("./pages/BookingReport"));
const ClientFile = lazy(() => import("./pages/ClientFile"));
const PublicQuote = lazy(() => import("./pages/PublicQuote"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/review/:slug" element={<AIReview />} />
                {/* /destinations route removed — reviews are now managed via Featured Reviews */}
                <Route path="/destinations/:slug" element={<DestinationReview />} />
                <Route path="/compass" element={<Compass />} />
                <Route path="/compass/:slug" element={<CompassArticle />} />
                <Route path="/gear" element={<Gear />} />
                <Route path="/gear-admin" element={<GearAdmin />} />
                <Route path="/about" element={<About />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/travel-intel" element={<TravelIntel />} />
                <Route path="/top/:location" element={<TopDestinations />} />
                <Route path="/my-reviews" element={<MyReviews />} />
                <Route path="/my-trips" element={<MyTrips />} />
                <Route path="/promo" element={<Promo />} />
                <Route path="/search" element={<TravelSearch />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
                <Route path="/booking/:bookingNumber" element={<BookingReport />} />
                <Route path="/client/:clientSlug" element={<ClientFile />} />
                <Route path="/quote/:token" element={<PublicQuote />} />
                <Route path="/install" element={<Install />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
