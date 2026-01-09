import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirectTo);
      }
    });
  }, [navigate, redirectTo]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created. Please check your email to verify.",
      });
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate(redirectTo);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-[radial-gradient(ellipse_at_center,hsl(217_91%_60%_/_0.08)_0%,transparent_70%)]" />
      </div>
      
      <Card className="w-full max-w-md p-8 relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-glow-sm">
            DC
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome to Delegate</h1>
          <p className="text-muted-foreground">Your AI delegation coach</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="bg-background border-border focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-background border-border focus:border-primary"
                />
              </div>
              <Button type="submit" className="w-full" variant="hero" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="bg-background border-border focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="bg-background border-border focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="bg-background border-border focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="signup-role">Your Role</Label>
                <Input
                  id="signup-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Manager, Team Lead, etc."
                  className="bg-background border-border focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="signup-team">Team Size</Label>
                <Input
                  id="signup-team"
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="5"
                  className="bg-background border-border focus:border-primary"
                />
              </div>
              <Button type="submit" className="w-full" variant="hero" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
