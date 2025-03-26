import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Lock, Shield, BarChart, LogOut, FileDown, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navbar() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  // Navbar links for authenticated users
  const links = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      icon: <BarChart className="h-4 w-4 mr-2" aria-hidden="true" />
    },
    { 
      name: "Encrypt", 
      path: "/encrypt", 
      icon: <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
    },
    { 
      name: "Decrypt", 
      path: "/decrypt", 
      icon: <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
    },
    { 
      name: "Storage", 
      path: "/storage", 
      icon: <Database className="h-4 w-4 mr-2" aria-hidden="true" />
    },
    { 
      name: "Scan", 
      path: "/scan", 
      icon: <FileDown className="h-4 w-4 mr-2" aria-hidden="true" />
    },
    { 
      name: "Logs", 
      path: "/logs", 
      icon: <BarChart className="h-4 w-4 mr-2" aria-hidden="true" />
    },
  ];
  
  return (
    <nav className="fixed top-0 w-full bg-background/85 backdrop-blur-md z-50 border-b py-2">
      <div className="container mx-auto px-4 flex items-center justify-between h-12">
        {/* Logo and site name */}
        <Link to="/" className="flex items-center">
          <Lock className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg hidden sm:inline-block">CryptoSafePort</span>
        </Link>
        
        {/* Desktop navigation */}
        {isAuthenticated && !isMobile && (
          <div className="hidden md:flex space-x-1">
            {links.map((link) => (
              <Button
                key={link.path}
                variant={location.pathname === link.path ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to={link.path} className="flex items-center">
                  {link.icon}
                  {link.name}
                </Link>
              </Button>
            ))}
          </div>
        )}
        
        {/* Right-side actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <>
              {/* Mobile menu toggle */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
              )}
              
              {/* User and logout (desktop) */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                  Logout
                </Button>
              )}
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/login" className="flex items-center">
                <User className="h-4 w-4 mr-2" aria-hidden="true" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {isOpen && isMobile && isAuthenticated && (
        <div className="md:hidden p-4 pt-0 bg-background border-b">
          <div className="space-y-1">
            {links.map((link) => (
              <Button
                key={link.path}
                variant={location.pathname === link.path ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to={link.path} className="flex items-center">
                  {link.icon}
                  {link.name}
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
