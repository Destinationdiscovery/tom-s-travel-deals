import { Helmet } from "react-helmet-async";
import PromoSlideshow from "@/components/PromoSlideshow";

const Promo = () => {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PromoSlideshow
        onComplete={() => {}}
        loop={true}
        showSkip={false}
      />
    </>
  );
};

export default Promo;
