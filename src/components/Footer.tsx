import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} TripGenie. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/about" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
