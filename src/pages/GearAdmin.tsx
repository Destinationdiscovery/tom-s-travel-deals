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
import DealMaker from "@/components/dashboard/DealMaker";

const GearAdmin = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

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
      <Header />
      <div className="pt-16 flex">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6 max-w-6xl">
          {activeTab === "overview" && <DashboardOverview onNavigate={setActiveTab} />}
          {activeTab === "quotes" && <QuoteBuilder />}
          {activeTab === "clients" && <ClientList onNavigate={setActiveTab} />}
          {activeTab === "bookings" && <BookingManager />}
          {activeTab === "calendar" && <BookingCalendar />}
          {activeTab === "emails" && <EmailComposer />}
          {activeTab === "deals" && <DealMaker />}
          {activeTab === "gear" && <GearImageManager />}
        </main>
      </div>
    </div>
  );
};

export default GearAdmin;
