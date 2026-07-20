import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import PublicTripsGrid from "@/components/trips/PublicTripsGrid";

const PublicTripsGallery = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Explore trips shared by real travelers | ReviewThenGo"
        description="Browse real, published trip plans with hotels, itineraries, and honest first-hand reviews from travelers."
      />
      <Header />
      <main className="pt-24 pb-16">
        <PublicTripsGrid
          showHeader={true}
          showViewAll={false}
          limit={48}
          enableSearch={true}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PublicTripsGallery;
