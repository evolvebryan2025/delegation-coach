import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { BenefitCard } from "@/components/BenefitCard";
import { OnboardingModal, OnboardingData } from "@/components/OnboardingModal";
import { Clock, Rocket, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-delegation.jpg";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  const handleOnboardingComplete = (data: OnboardingData) => {
    localStorage.setItem("onboarding", JSON.stringify(data));
    navigate("/auth?redirect=/coach/welcome");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Transform Your Leadership</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Delegate Like a Pro,{" "}
                <span className="gradient-primary bg-clip-text text-white px-3">Lead Like a Boss</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform delegation from a burden into your leadership superpower. Join 10,000+ leaders who've
                reclaimed their time and empowered their teams.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" onClick={() => setShowOnboarding(true)} className="group text-white">
                  Start Your Delegation Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="xl">
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
                className="relative rounded-3xl shadow-card-hover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Master the Art of Delegation?</h2>
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
          <div className="gradient-primary rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Leadership?</h2>
              <p className="text-xl mb-8 text-white/90">
                Start your personalized delegation journey today. Takes just 3 minutes to get started.
              </p>
              <Button
                variant="secondary"
                size="xl"
                onClick={() => setShowOnboarding(true)}
                className="bg-white text-primary hover:bg-white/90 shadow-xl hover:text-primary"
              >
                Get Started - It's Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  );
};

export default Index;
