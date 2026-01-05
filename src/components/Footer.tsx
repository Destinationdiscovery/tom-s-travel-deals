import { Plane, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-display text-lg font-bold text-background">Tom Laracy</h3>
              <p className="text-xs text-muted-foreground">Travelonly Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>for travelers everywhere</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © {currentYear} Tom Laracy Travel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
