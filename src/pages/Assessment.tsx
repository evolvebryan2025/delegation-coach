import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Leaf, TreeDeciduous, Trophy, Crown } from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: "slider" | "scenario";
  options?: { label: string; value: number; description: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "When delegating a task, how often do you provide clear success criteria?",
    type: "slider",
  },
  {
    id: 2,
    text: "A team member asks for help on a delegated task. You:",
    type: "scenario",
    options: [
      { label: "Take over and finish it yourself", value: 1, description: "Fastest way to get it done" },
      { label: "Give quick instructions without context", value: 3, description: "Tell them what to do" },
      { label: "Guide them to find the solution", value: 7, description: "Coach them through it" },
      { label: "Review their approach and provide strategic input", value: 10, description: "Develop their thinking" },
    ],
  },
  {
    id: 3,
    text: "How confident are you in your team's ability to handle important tasks?",
    type: "slider",
  },
  {
    id: 4,
    text: "Your approach to task delegation is:",
    type: "scenario",
    options: [
      { label: "I assign individual tasks", value: 2, description: "Task by task delegation" },
      { label: "I delegate whole projects", value: 5, description: "Project-level delegation" },
      { label: "I empower them with processes", value: 8, description: "System-level delegation" },
      { label: "I transfer knowledge domains", value: 10, description: "Strategic delegation" },
    ],
  },
  {
    id: 5,
    text: "How frequently do you follow up on delegated work?",
    type: "slider",
  },
];

const Assessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [sliderValue, setSliderValue] = useState([5]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleSliderAnswer = () => {
    setAnswers({ ...answers, [question.id]: sliderValue[0] });
    nextQuestion();
  };

  const handleScenarioAnswer = (value: number) => {
    setAnswers({ ...answers, [question.id]: value });
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSliderValue([5]);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const average = total / questions.length;
    
    let level = 1;
    let levelName = "Task Delegator";

    if (average >= 8) {
      level = 5;
      levelName = "Strategic Delegator";
    } else if (average >= 6.5) {
      level = 4;
      levelName = "Knowledge Transferrer";
    } else if (average >= 5) {
      level = 3;
      levelName = "Process Builder";
    } else if (average >= 3.5) {
      level = 2;
      levelName = "Project Manager";
    }

    localStorage.setItem("assessmentResults", JSON.stringify({ level, levelName, score: average }));
    
    toast({
      title: "Assessment Complete!",
      description: "Calculating your delegation maturity level...",
    });
    
    setTimeout(() => navigate("/assessment-results"), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Delegation Maturity Assessment</h1>
            <p className="text-muted-foreground text-lg mb-6">
              Discover your current delegation level and unlock personalized insights
            </p>
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground mt-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>

          <Card className="p-8 animate-scale-in">
            <h2 className="text-2xl font-semibold mb-8">{question.text}</h2>

            {question.type === "slider" && (
              <div className="space-y-8">
                <div className="text-center bg-gradient-to-br from-primary to-secondary rounded-2xl p-8">
                  <div className="text-6xl font-bold text-white mb-2">
                    {sliderValue[0]}
                  </div>
                  <div className="text-white/90 text-lg">
                    {sliderValue[0] <= 3 && "Rarely"}
                    {sliderValue[0] > 3 && sliderValue[0] <= 7 && "Sometimes"}
                    {sliderValue[0] > 7 && "Consistently"}
                  </div>
                </div>

                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={10}
                  min={1}
                  step={1}
                  className="py-4"
                />

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Never</span>
                  <span>Always</span>
                </div>

                <Button variant="hero" onClick={handleSliderAnswer} className="w-full text-white" size="lg">
                  Continue
                </Button>
              </div>
            )}

            {question.type === "scenario" && question.options && (
              <div className="space-y-4">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleScenarioAnswer(option.value)}
                    className="w-full p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {option.label}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
