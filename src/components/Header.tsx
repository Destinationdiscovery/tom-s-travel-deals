import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/auth/AuthProvider";
import AdminLoginDialog from "@/components/auth/AdminLoginDialog";

const Header = () => {
  const { isAdmin } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AdminLoginDialog />
          <Link to="/">
            <div>
              <h1 className="font-display text-3xl font-bold">
                <span className="text-sky-600">Review</span>
                <span className="text-amber-500">Then</span>
                <span className="text-emerald-600">Go</span>
              </h1>
              <p className="text-sm text-muted-foreground">Real Traveller Reviews and Insights</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              to="/gear-admin"
              className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
