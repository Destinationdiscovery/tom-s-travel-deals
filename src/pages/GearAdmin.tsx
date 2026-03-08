import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import DashboardSidebar, { type DashboardTab } from "@/components/dashboard/DashboardSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import QuoteBuilder from "@/components/dashboard/QuoteBuilder";
import BookingCalendar from "@/components/dashboard/BookingCalendar";
import BookingManager from "@/components/dashboard/BookingManager";
import EmailComposer from "@/components/dashboard/EmailComposer";
import GearImageManager from "@/components/dashboard/GearImageManager";
import ClientList from "@/components/dashboard/ClientList";
import BlogPostCreator from "@/components/dashboard/BlogPostCreator";
import FeaturedDealsManager from "@/components/dashboard/FeaturedDealsManager";
import FeaturedReviewsManager from "@/components/dashboard/FeaturedReviewsManager";
import BannerDealsManager from "@/components/dashboard/BannerDealsManager";

const GearAdmin = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    document.title = "Agent HQ - ReviewThenGo";
  }, []);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 text-center px-4">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Agent HQ</h1>
          <p className="text-muted-foreground">Please sign in as admin to access the dashboard.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden"><Header /></div>
      <div className="pt-16 flex">
        {!previewMode && (
          <div className="print:hidden">
            <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} open={sidebarOpen} onOpenChange={setSidebarOpen} />
          </div>
        )}
        <main className="flex-1 p-6 max-w-6xl pt-16 md:pt-6">
          {activeTab === "overview" && <DashboardOverview onNavigate={setActiveTab} />}
          {activeTab === "quotes" && <QuoteBuilder onPreviewMode={setPreviewMode} />}
          {activeTab === "clients" && <ClientList onNavigate={setActiveTab} />}
          {activeTab === "bookings" && <BookingManager />}
          {activeTab === "calendar" && <BookingCalendar />}
          {activeTab === "emails" && <EmailComposer />}
          {activeTab === "featured-deals" && <FeaturedDealsManager />}
          {activeTab === "banner-deals" && <BannerDealsManager />}
          {activeTab === "reviews" && <FeaturedReviewsManager />}
          {activeTab === "blog" && <BlogPostCreator />}
          {activeTab === "gear" && <GearImageManager />}
        </main>
      </div>
    </div>
  );
};

export default GearAdmin;
