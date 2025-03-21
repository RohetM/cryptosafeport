
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  Shield, 
  FileSearch, 
  LayoutDashboard, 
  LogOut, 
  FileDigit, 
  Menu, 
  X, 
  ClipboardList 
} from "lucide-react";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = isAuthenticated ? [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { name: "Encrypt", path: "/encrypt", icon: <Lock className="h-4 w-4 mr-2" /> },
    { name: "Decrypt", path: "/decrypt", icon: <Shield className="h-4 w-4 mr-2" /> },
    { name: "Scan", path: "/scan", icon: <FileSearch className="h-4 w-4 mr-2" /> },
    { name: "Logs", path: "/logs", icon: <ClipboardList className="h-4 w-4 mr-2" /> }
  ] : [];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? "glass shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-foreground font-medium"
            >
              <FileDigit className="h-6 w-6" />
              <span className="text-lg font-medium">CryptoSafePort</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors 
                  ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-accent"
                  }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center space-x-2 ml-2">
              <ThemeToggle />
              
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    asChild
                    className="text-sm font-medium"
                  >
                    <Link to="/login">Log In</Link>
                  </Button>
                  <Button 
                    variant="default" 
                    asChild
                    className="text-sm font-medium"
                  >
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="rounded-full w-10 h-10"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass animate-fade-in">
          <nav className="flex flex-col px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-3 rounded-md transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                onClick={logout}
                className="justify-start px-3 py-3 h-auto text-foreground/70 hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            ) : (
              <div className="flex flex-col space-y-1 pt-2">
                <Button 
                  variant="ghost" 
                  asChild
                  className="justify-start"
                >
                  <Link to="/login">Log In</Link>
                </Button>
                <Button 
                  variant="default" 
                  asChild
                >
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
