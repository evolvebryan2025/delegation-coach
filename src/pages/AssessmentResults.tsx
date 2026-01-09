import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, TrendingUp, PartyPopper, Sprout, Leaf, TreeDeciduous, Crown } from "lucide-react";

interface Results {
  level: number;
  levelName: string;
  score: number;
}

const levelIcons: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Sprout,
  2: Leaf,
  3: TreeDeciduous,
  4: Trophy,
  5: Crown,
};

const levelDescriptions: Record<number, { description: string; nextSteps: string[] }> = {
  1: {
    description: "You're starting your delegation journey! You handle individual tasks but may struggle with letting go completely.",
    nextSteps: [
      "Learn the C.L.E.A.R framework basics",
      "Start with low-risk delegations",
      "Practice giving context with tasks",
    ],
  },
  2: {
    description: "You're delegating projects, not just tasks. You understand the basics but could improve follow-through.",
    nextSteps: [
      "Master the C.L.E.A.R framework",
      "Create delegation templates",
      "Develop better check-in systems",
    ],
  },
  3: {
    description: "You're building processes and systems! Your team knows what to expect and how to deliver.",
    nextSteps: [
      "Focus on knowledge transfer",
      "Empower decision-making",
      "Document your delegation systems",
    ],
  },
  4: {
    description: "You're transferring entire knowledge domains! Your team is highly capable and independent.",
    nextSteps: [
      "Delegate strategic initiatives",
      "Mentor others on delegation",
      "Scale your impact organization-wide",
    ],
  },
  5: {
    description: "You're a Strategic Delegator! You multiply your impact by empowering others to lead initiatives.",
    nextSteps: [
      "Coach other leaders",
      "Build a delegation culture",
      "Focus on transformational work",
    ],
  },
};

const AssessmentResults = () => {
  const [results, setResults] = useState<Results | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("assessmentResults");
    if (stored) {
      setResults(JSON.parse(stored));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      navigate("/assessment");
    }
  }, [navigate]);

  if (!results) return null;

  const levelInfo = levelDescriptions[results.level];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navigation />
      
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-scale-in">
            <PartyPopper className="w-16 h-16 text-warning" />
          </div>
        </div>
      )}

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 animate-slide-up">
            {(() => {
              const LevelIcon = levelIcons[results.level];
              return (
                <div className="w-32 h-32 gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center shadow-glow animate-scale-in">
                  <LevelIcon className="w-16 h-16 text-white" />
                </div>
              );
            })()}
            <h1 className="text-5xl font-bold mb-4">
              You're a{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                {results.levelName}
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Trophy className="w-5 h-5 text-warning" />
              <span>Level {results.level} of 5</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                {(() => {
                  const LevelIcon = levelIcons[results.level];
                  return <LevelIcon className="w-8 h-8 text-primary" />;
                })()}
                Your Level
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {levelInfo.description}
              </p>
              <div className="bg-primary/10 rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">Delegation Score</div>
                <div className="text-4xl font-bold text-primary">
                  {results.score.toFixed(1)}/10
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-success" />
                Next Steps
              </h2>
              <p className="text-muted-foreground mb-6">
                Here's your personalized roadmap to level up:
              </p>
              <ul className="space-y-3">
                {levelInfo.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="gradient-primary rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Level Up?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Start mastering the C.L.E.A.R framework and transform how you delegate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/framework")}
                className="bg-white text-primary hover:bg-white/90"
              >
                Learn C.L.E.A.R Framework
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="border-white text-white hover:bg-white/10"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
