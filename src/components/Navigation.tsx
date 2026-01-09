import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import logo from "@/assets/madeea-logo.png";
import { useState } from "react";
import { NavLink } from "./NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/coach/welcome");
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center">
            <img src={logo} alt="Madeea Logo" className="h-8" />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  activeClassName="text-primary font-medium"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/plans"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  activeClassName="text-primary font-medium"
                >
                  My Plans
                </NavLink>
                <NavLink
                  to="/framework"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  activeClassName="text-primary font-medium"
                >
                  Framework
                </NavLink>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span>{user?.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <NavLink
                  to="/framework"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  activeClassName="text-primary font-medium"
                >
                  Framework
                </NavLink>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors" 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in border-t border-border">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/plans"
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    My Plans
                  </NavLink>
                  <NavLink
                    to="/framework"
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Framework
                  </NavLink>
                  <div className="pt-2 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-2 px-2">{user?.email}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <NavLink
                    to="/framework"
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    activeClassName="text-primary font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Framework
                  </NavLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate("/auth");
                      setIsOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => {
                      handleGetStarted();
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
