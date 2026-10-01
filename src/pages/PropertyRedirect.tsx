import { Helmet } from "react-helmet-async";
import { Navigate, useParams } from "@/lib/router-compat";

const PropertyRedirect = () => {
  const { name } = useParams<{ city: string; name: string }>();
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navigate to={`/review/${name || ""}`} replace />
    </>
  );
};

export default PropertyRedirect;
