import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, TrendingUp, Target, Zap } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  const mindsetShifts = [
    {
      icon: Users,
      title: "Leverage & Empowerment",
      description: "Delegation multiplies your impact by empowering others to grow."
    },
    {
      icon: TrendingUp,
      title: "Building Capacity",
      description: "Every delegation is an investment in your team's capabilities."
    },
    {
      icon: Target,
      title: "Strategic Focus",
      description: "Free yourself to focus on what only you can do."
    },
    {
      icon: Zap,
      title: "Trust & Clarity",
      description: "Clear delegation creates trust and accelerates results."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Master the Art of <span className="gradient-primary bg-clip-text text-transparent">Delegation</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Transform how you work by learning to delegate effectively. 
              Multiply your impact, empower your team, and reclaim your time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {mindsetShifts.map((shift, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-card-hover transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <shift.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{shift.title}</h3>
                    <p className="text-muted-foreground">{shift.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 gradient-primary text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              This guided coaching experience will help you identify what to delegate, 
              create clear plans, and build lasting delegation habits.
            </p>
            <Button 
              size="xl"
              variant="secondary"
              onClick={() => navigate("/coach/assessment")}
              className="group"
            >
              Begin Delegation Coaching
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
