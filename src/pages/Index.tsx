import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { BenefitCard } from "@/components/BenefitCard";
import { OnboardingModal, OnboardingData } from "@/components/OnboardingModal";
import { Clock, Rocket, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-delegation.jpg";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [assessmentResponses, setAssessmentResponses] = useState({
    draining_tasks: "",
    tasks_not_delegating: "",
    delegation_barriers: "",
    team_members: ""
  });
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const assessmentRef = useRef<HTMLDivElement>(null);

  const handleOnboardingComplete = (data: OnboardingData) => {
    localStorage.setItem("onboarding", JSON.stringify(data));
    navigate("/auth?redirect=/coach/assessment");
  };

  const handleAssessmentSubmit = () => {
    const { draining_tasks, tasks_not_delegating, delegation_barriers, team_members } = assessmentResponses;
    
    if (!draining_tasks || !tasks_not_delegating || !delegation_barriers || !team_members) {
      toast({
        title: "Please complete all questions",
        description: "All fields are required to get your personalized insights.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("pre-auth-assessment", JSON.stringify({
      ...assessmentResponses,
      timestamp: new Date().toISOString()
    }));

    setShowLoginPrompt(true);
  };

  const handleSignupRedirect = () => {
    navigate("/auth?redirect=/coach/assessment&hasPreAuth=true&tab=signup");
  };

  const handleLoginRedirect = () => {
    navigate("/auth?redirect=/coach/assessment&hasPreAuth=true&tab=login");
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero Glow Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[radial-gradient(ellipse_at_center,hsl(217_91%_60%_/_0.12)_0%,transparent_70%)]" />
      </div>
      
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 animate-icon-glow" />
                <span>Transform Your Leadership</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                Delegate Like a Pro,{" "}
                <span className="text-gradient-primary">Lead Like a Boss</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform delegation from a burden into your leadership superpower. Join 10,000+ leaders who've
                reclaimed their time and empowered their teams.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" onClick={() => setShowOnboarding(true)} className="group">
                  Start Your Delegation Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => assessmentRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-foreground">10,000+</div>
                  <div className="text-sm text-muted-foreground">Leaders Trained</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-foreground">15+</div>
                  <div className="text-sm text-muted-foreground">Hours Saved Weekly</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="relative animate-float">
              <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="Delegation workflow visualization"
                className="relative rounded-3xl shadow-card-hover border border-border w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Section */}
      <section ref={assessmentRef} className="py-20 px-4 bg-background-secondary relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container mx-auto max-w-4xl relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Take the 2-Minute Delegation Assessment</h2>
            <p className="text-xl text-muted-foreground">
              Get personalized insights and actionable recommendations to improve your delegation skills
            </p>
          </div>

          <Card className="p-8 space-y-6 hover:border-border-accent">
            <div className="space-y-6">
              <div>
                <Label htmlFor="draining_tasks" className="text-lg font-semibold mb-2 block">
                  What tasks are draining your time?
                </Label>
                <Textarea
                  id="draining_tasks"
                  placeholder="List the tasks that consume most of your day but don't necessarily require your unique expertise..."
                  value={assessmentResponses.draining_tasks}
                  onChange={(e) => setAssessmentResponses({ ...assessmentResponses, draining_tasks: e.target.value })}
                  rows={4}
                  className="mt-2 bg-background border-border focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="tasks_not_delegating" className="text-lg font-semibold mb-2 block">
                  What tasks do you keep doing even though someone else could?
                </Label>
                <Textarea
                  id="tasks_not_delegating"
                  placeholder="Think about tasks you're holding onto. What stops you from delegating them?"
                  value={assessmentResponses.tasks_not_delegating}
                  onChange={(e) => setAssessmentResponses({ ...assessmentResponses, tasks_not_delegating: e.target.value })}
                  rows={4}
                  className="mt-2 bg-background border-border focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="delegation_barriers" className="text-lg font-semibold mb-2 block">
                  What stops you from delegating these tasks?
                </Label>
                <Textarea
                  id="delegation_barriers"
                  placeholder="Is it perfectionism? Lack of trust? Unclear processes? Not enough time to train?"
                  value={assessmentResponses.delegation_barriers}
                  onChange={(e) => setAssessmentResponses({ ...assessmentResponses, delegation_barriers: e.target.value })}
                  rows={4}
                  className="mt-2 bg-background border-border focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="team_members" className="text-lg font-semibold mb-2 block">
                  Who on your team could take on more responsibility?
                </Label>
                <Textarea
                  id="team_members"
                  placeholder="List team members and their strengths. Who's ready to grow?"
                  value={assessmentResponses.team_members}
                  onChange={(e) => setAssessmentResponses({ ...assessmentResponses, team_members: e.target.value })}
                  rows={4}
                  className="mt-2 bg-background border-border focus:border-primary"
                />
              </div>
            </div>

            <Button 
              onClick={handleAssessmentSubmit} 
              size="lg" 
              className="w-full"
              variant="hero"
            >
              Get My Personalized Insights
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Why Master the Art of Delegation?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock your full potential as a leader while building a more capable, engaged team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard
              icon={Clock}
              title="Reclaim 10+ Hours Weekly"
              description="Stop drowning in tasks that don't require your expertise. Free up time for strategic thinking and high-impact work."
            />
            <BenefitCard
              icon={Rocket}
              title="Empower Your Team"
              description="Build confidence and capability in your team members. Watch them grow as you delegate meaningful responsibilities."
            />
            <BenefitCard
              icon={TrendingUp}
              title="Scale Your Impact"
              description="Multiply your effectiveness by leveraging your team's collective skills. Lead at a higher level."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="gradient-primary rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-glow">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Transform Your Leadership?</h2>
              <p className="text-xl mb-8 text-white/90">
                Start your personalized delegation journey today. Takes just 3 minutes to get started.
              </p>
              <Button
                variant="secondary"
                size="xl"
                onClick={() => setShowOnboarding(true)}
                className="bg-white text-primary hover:bg-white/90 shadow-xl hover:text-primary border-0"
              >
                Get Started - It's Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl">Sign Up to See Your Results</DialogTitle>
            <DialogDescription className="text-base pt-2 text-muted-foreground">
              Create a free account to get your personalized delegation insights and coaching plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button onClick={handleSignupRedirect} size="lg" className="w-full" variant="hero">
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={handleLoginRedirect}>
              Already have an account? Sign in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
