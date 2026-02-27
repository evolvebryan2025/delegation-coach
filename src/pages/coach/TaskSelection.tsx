import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Zap } from "lucide-react";

const PLAN_TEMPLATES = [
  {
    name: "Weekly Status Reports",
    task: "Creating and distributing weekly status reports",
    importance: "Keeps stakeholders informed and builds accountability across the team.",
    success: "Clear, accurate reports delivered on time every week with key metrics highlighted.",
    context: "Access to project management tools, prior report templates, and stakeholder distribution list.",
    timeline: "Ongoing, weekly cadence",
    autonomy: "medium",
  },
  {
    name: "Meeting Coordination",
    task: "Scheduling and preparing agendas for recurring team meetings",
    importance: "Ensures productive meetings that respect everyone's time.",
    success: "Agendas sent 24h in advance, meeting notes distributed within 2h, action items tracked.",
    context: "Calendar access, meeting templates, and knowledge of key discussion topics.",
    timeline: "Ongoing",
    autonomy: "high",
  },
  {
    name: "Client Onboarding",
    task: "Managing the new client onboarding process",
    importance: "First impressions drive retention. A smooth onboarding builds trust.",
    success: "New clients fully set up within 48h with all resources provided and intro calls completed.",
    context: "CRM access, onboarding checklist, welcome email templates, and key contacts.",
    timeline: "Per new client, 1-2 week cycles",
    autonomy: "medium",
  },
  {
    name: "Data Entry & Cleanup",
    task: "Cleaning and organizing data in our primary database or CRM",
    importance: "Clean data drives better decisions and prevents costly errors.",
    success: "No duplicate records, all fields standardized, validation rules documented.",
    context: "Database access, data standards guide, and list of priority fields.",
    timeline: "2 weeks initial cleanup, then ongoing maintenance",
    autonomy: "low",
  },
];

const TaskSelection = () => {
  const [selectedTask, setSelectedTask] = useState("");
  const [customTask, setCustomTask] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [clarifying, setClarifying] = useState(false);
  const [clarification, setClarification] = useState<any>(null);
  const [extractedTasks, setExtractedTasks] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("delegation_assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const tasks = [
        ...(data.draining_tasks?.split("\n") || []),
        ...(data.tasks_not_delegating?.split("\n") || [])
      ].filter(t => t.trim().length > 10);
      
      setExtractedTasks(tasks.slice(0, 5));
    }
  };

  const applyTemplate = (template: typeof PLAN_TEMPLATES[0]) => {
    setSelectedTask("custom");
    setCustomTask(template.task);
    setResponses({
      importance: template.importance,
      success: template.success,
      context: template.context,
      timeline: template.timeline,
      autonomy: template.autonomy,
    });
    toast({ title: "Template applied", description: `"${template.name}" template loaded. Review and customize as needed.` });
  };

  const handleClarify = async () => {
    const task = selectedTask === "custom" ? customTask : selectedTask;
    
    if (!task.trim()) {
      toast({
        title: "Task required",
        description: "Please select or enter a task to delegate.",
        variant: "destructive",
      });
      return;
    }

    setClarifying(true);
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "clarify-task",
        { body: { task, responses } }
      );

      if (functionError) throw functionError;

      if (functionData?.error) {
        toast({
          title: "AI Error",
          description: functionData.error,
          variant: "destructive",
        });
        return;
      }

      setClarification(functionData.clarification);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClarifying(false);
    }
  };

  const handleProceed = () => {
    const task = selectedTask === "custom" ? customTask : selectedTask;
    navigate("/coach/plan-builder", {
      state: {
        task,
        clarification,
        responses
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Select a Task to Delegate</h1>
            <p className="text-muted-foreground">Choose one task to focus on, and we'll help you create a complete delegation plan.</p>
          </div>

          {/* Quick-start Templates */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              Quick-Start Templates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLAN_TEMPLATES.map((template, i) => (
                <Card
                  key={i}
                  className="p-4 cursor-pointer hover:shadow-card-hover transition-all hover:border-secondary/50"
                  onClick={() => applyTemplate(template)}
                >
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{template.task}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-8 mb-6">
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-4 block">Select Your Task</Label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a task from your assessment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {extractedTasks.map((task, i) => (
                      <SelectItem key={i} value={task}>{task}</SelectItem>
                    ))}
                    <SelectItem value="custom">Enter a different task...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTask === "custom" && (
                <div>
                  <Label>Describe the task you want to delegate</Label>
                  <Textarea
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    placeholder="E.g., Creating weekly status reports..."
                    className="min-h-[100px]"
                  />
                </div>
              )}

              {!clarification && (
                <>
                  <div>
                    <Label>Why is this task important?</Label>
                    <Textarea
                      value={responses.importance || ""}
                      onChange={(e) => setResponses({ ...responses, importance: e.target.value })}
                      placeholder="Explain the business value or impact..."
                    />
                  </div>

                  <div>
                    <Label>What does success look like?</Label>
                    <Textarea
                      value={responses.success || ""}
                      onChange={(e) => setResponses({ ...responses, success: e.target.value })}
                      placeholder="Describe the desired outcome..."
                    />
                  </div>

                  <div>
                    <Label>What context does your team member need?</Label>
                    <Textarea
                      value={responses.context || ""}
                      onChange={(e) => setResponses({ ...responses, context: e.target.value })}
                      placeholder="Background, resources, access, etc..."
                    />
                  </div>

                  <div>
                    <Label>What's the timeline?</Label>
                    <Input
                      value={responses.timeline || ""}
                      onChange={(e) => setResponses({ ...responses, timeline: e.target.value })}
                      placeholder="E.g., 2 weeks, ongoing, by Friday..."
                    />
                  </div>

                  <div>
                    <Label>What level of autonomy do you want to give?</Label>
                    <Select value={responses.autonomy || ""} onValueChange={(v) => setResponses({ ...responses, autonomy: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose autonomy level..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Check with me before decisions</SelectItem>
                        <SelectItem value="medium">Medium - Make decisions, inform me after</SelectItem>
                        <SelectItem value="high">High - Full ownership, update me at milestones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleClarify} disabled={clarifying} className="w-full">
                    {clarifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        AI is clarifying your task...
                      </>
                    ) : (
                      "Get AI Clarification"
                    )}
                  </Button>
                </>
              )}
            </div>
          </Card>

          {clarification && (
            <Card className="p-8 border-success">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Task Clarified!</h3>
                  <p className="text-muted-foreground">Here's a refined version of your delegation:</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label className="font-semibold text-primary">Refined Outcome</Label>
                  <p className="mt-2 p-4 bg-muted rounded-lg">{clarification.refined_outcome}</p>
                </div>

                <div>
                  <Label className="font-semibold text-primary">Context to Provide</Label>
                  <p className="mt-2 p-4 bg-muted rounded-lg">{clarification.suggested_context}</p>
                </div>

                <div>
                  <Label className="font-semibold text-primary">Success Criteria</Label>
                  <ul className="mt-2 p-4 bg-muted rounded-lg space-y-2">
                    {clarification.success_criteria.map((criteria: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button onClick={handleProceed} size="lg" className="w-full">
                Build My Delegation Plan
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskSelection;
