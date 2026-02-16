import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import AIReview from "./pages/AIReview";
import Destinations from "./pages/Destinations";
import DestinationReview from "./pages/DestinationReview";
import Compass from "./pages/Compass";
import CompassArticle from "./pages/CompassArticle";
import Gear from "./pages/Gear";
import GearAdmin from "./pages/GearAdmin";
import About from "./pages/About";
import Compare from "./pages/Compare";
import Contact from "./pages/Contact";
import TravelIntel from "./pages/TravelIntel";
import TopDestinations from "./pages/TopDestinations";
import MyReviews from "./pages/MyReviews";
import MyTrips from "./pages/MyTrips";
import Promo from "./pages/Promo";
import TravelSearch from "./pages/TravelSearch";
import ResetPassword from "./pages/ResetPassword";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/review/:slug" element={<AIReview />} />
              <Route path="/destinations" element={<Destinations />} />
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
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
