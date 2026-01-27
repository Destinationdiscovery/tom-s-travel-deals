import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import DestinationReview from "./pages/DestinationReview";
import Compass from "./pages/Compass";
import CompassArticle from "./pages/CompassArticle";
import Gear from "./pages/Gear";
import GearReview from "./pages/GearReview";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:slug" element={<DestinationReview />} />
            <Route path="/compass" element={<Compass />} />
            <Route path="/compass/:slug" element={<CompassArticle />} />
            <Route path="/gear" element={<Gear />} />
            <Route path="/gear/:slug" element={<GearReview />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;