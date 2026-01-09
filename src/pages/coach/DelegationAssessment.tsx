import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";

const questions = [
  {
    id: "draining_tasks",
    label: "What tasks are draining your time?",
    placeholder: "List the tasks that consume most of your day but don't necessarily require your unique expertise..."
  },
  {
    id: "tasks_not_delegating",
    label: "What tasks do you keep doing even though someone else could?",
    placeholder: "Think about tasks you're holding onto. What stops you from delegating them?"
  },
  {
    id: "delegation_barriers",
    label: "What stops you from delegating these tasks?",
    placeholder: "Is it perfectionism? Lack of trust? Unclear processes? Not enough time to train?"
  },
  {
    id: "team_members",
    label: "Who on your team could take on more responsibility?",
    placeholder: "List team members and their strengths. Who's ready to grow?"
  }
];

const DelegationAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const navigate = useNavigate();
  
  const { toast } = useToast();

  useEffect(() => {
    // Always check for pre-auth data from landing page assessment
    const preAuthData = localStorage.getItem("pre-auth-assessment");
    if (preAuthData) {
      try {
        const assessment = JSON.parse(preAuthData);
        setResponses(assessment);
        setCurrentStep(questions.length - 1);
        localStorage.removeItem("pre-auth-assessment");
        
        toast({
          title: "Assessment loaded!",
          description: "Your responses have been loaded. Click Next to get your insights.",
        });
      } catch (error) {
        console.error("Error loading pre-auth assessment:", error);
      }
    }
  }, [toast]);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = () => {
    if (!responses[currentQuestion.id]?.trim()) {
      toast({
        title: "Response required",
        description: "Please provide a response before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { data: assessment, error: saveError } = await supabase
        .from("delegation_assessments")
        .insert({
          user_id: user.id,
          ...responses,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setAnalyzing(true);
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "analyze-assessment",
        { body: { assessment: responses } }
      );

      if (functionError) throw functionError;

      if (functionData?.error) {
        toast({
          title: "AI Analysis Error",
          description: functionData.error,
          variant: "destructive",
        });
        return;
      }

      await supabase
        .from("delegation_assessments")
        .update({ ai_insights: JSON.stringify(functionData.insights) })
        .eq("id", assessment.id);

      setInsights(functionData.insights);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  if (insights) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-6">Your Delegation Insights</h2>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">Key Patterns</h3>
                  <ul className="space-y-2">
                    {insights.patterns.map((pattern: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-warning">Barriers Identified</h3>
                  <ul className="space-y-2">
                    {insights.barriers.map((barrier: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-warning mt-1">•</span>
                        <span>{barrier}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-success">Recommendations</h3>
                  <ul className="space-y-2">
                  {insights.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-muted-foreground italic">{insights.summary}</p>
                </div>
              </div>

              <Button size="lg" onClick={() => navigate("/coach/task-selection")} className="w-full">
                Continue to Task Selection
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentStep + 1} of {questions.length}
              </span>
              <span className="text-sm font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <Label className="text-xl font-semibold mb-4 block">
                  {currentQuestion.label}
                </Label>
                <Textarea
                  value={responses[currentQuestion.id] || ""}
                  onChange={(e) => setResponses({ ...responses, [currentQuestion.id]: e.target.value })}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex gap-4">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={handleBack} disabled={loading || analyzing}>
                    Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext} 
                  disabled={loading || analyzing} 
                  className="flex-1"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analyzing your responses...
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : currentStep === questions.length - 1 ? (
                    "Complete Assessment"
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DelegationAssessment;
