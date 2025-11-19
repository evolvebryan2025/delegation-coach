import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "./NavLink";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
              DC
            </div>
            <span className="font-bold text-lg">Delegation Coach</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink 
              to="/assessment" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Assessment
            </NavLink>
            <NavLink 
              to="/framework" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-semibold"
            >
              C.L.E.A.R Framework
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Dashboard
            </NavLink>
            <Button variant="hero" size="sm" className="text-white">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 animate-slide-up">
            <div className="flex flex-col gap-4">
              <NavLink 
                to="/assessment" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Assessment
              </NavLink>
              <NavLink 
                to="/framework" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-semibold"
                onClick={() => setIsOpen(false)}
              >
                C.L.E.A.R Framework
              </NavLink>
              <NavLink 
                to="/dashboard" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                activeClassName="text-primary font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </NavLink>
              <Button variant="hero" size="sm" className="w-full text-white">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
