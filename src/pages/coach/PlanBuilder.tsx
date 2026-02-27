import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";

const PlanBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [taskName, setTaskName] = useState("");
  const [outcome, setOutcome] = useState("");
  const [context, setContext] = useState("");
  const [successCriteria, setSuccessCriteria] = useState<string[]>([""]);
  const [teamMember, setTeamMember] = useState("");
  const [risks, setRisks] = useState<string[]>([""]);
  const [support, setSupport] = useState("");
  const [checkInSchedule, setCheckInSchedule] = useState("");
  const [deadline, setDeadline] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState([50]);

  useEffect(() => {
    const state = location.state as any;
    if (!state) {
      navigate("/coach/task-selection");
      return;
    }

    setTaskName(state.task || "");
    setOutcome(state.clarification?.refined_outcome || state.responses?.success || "");
    setContext(state.clarification?.suggested_context || state.responses?.context || "");
    setSuccessCriteria(state.clarification?.success_criteria || [""]);
  }, [location, navigate]);

  const addCriteria = () => setSuccessCriteria([...successCriteria, ""]);
  const removeCriteria = (index: number) => setSuccessCriteria(successCriteria.filter((_, i) => i !== index));
  const updateCriteria = (index: number, value: string) => {
    const updated = [...successCriteria];
    updated[index] = value;
    setSuccessCriteria(updated);
  };

  const addRisk = () => setRisks([...risks, ""]);
  const removeRisk = (index: number) => setRisks(risks.filter((_, i) => i !== index));
  const updateRisk = (index: number, value: string) => {
    const updated = [...risks];
    updated[index] = value;
    setRisks(updated);
  };

  const getAutonomyLabel = (value: number) => {
    if (value < 33) return "Low";
    if (value < 67) return "Medium";
    return "High";
  };

  const handleGenerate = async () => {
    if (!taskName.trim()) {
      toast({ title: "Task name required", description: "Please enter a task name.", variant: "destructive" });
      return;
    }
    if (!teamMember.trim()) {
      toast({ title: "Team member required", description: "Please enter who you're delegating to.", variant: "destructive" });
      return;
    }
    if (!outcome.trim()) {
      toast({ title: "Outcome required", description: "Please describe the desired outcome.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const planData = {
        task_name: taskName,
        outcome,
        context,
        team_member: teamMember,
        deadline,
        autonomy_level: getAutonomyLabel(autonomyLevel[0]),
        support_needed: support,
      };

      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "generate-delegation-plan",
        { body: { planData } }
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

      // Stringify objects for text/text[] DB columns
      const risksForDb = Array.isArray(functionData.plan.risks)
        ? functionData.plan.risks.map((r: any) => typeof r === 'string' ? r : JSON.stringify(r))
        : [];
      const scheduleForDb = typeof functionData.plan.check_in_schedule === 'string'
        ? functionData.plan.check_in_schedule
        : JSON.stringify(functionData.plan.check_in_schedule);

      const { data: savedPlan, error: saveError } = await supabase
        .from("delegation_plans")
        .insert({
          user_id: user.id,
          task_name: taskName,
          outcome,
          context,
          success_criteria: functionData.plan.success_criteria,
          risks: risksForDb,
          support_needed: support,
          check_in_schedule: scheduleForDb,
          deadline,
          autonomy_level: getAutonomyLabel(autonomyLevel[0]),
          team_member: teamMember,
          handoff_message: functionData.plan.handoff_message,
          status: "draft",
        })
        .select()
        .single();

      if (saveError) throw saveError;

      navigate("/coach/plan-output", { state: { plan: savedPlan, aiData: functionData.plan } });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Build Your Delegation Plan</h1>
            <p className="text-muted-foreground">Fill in the details. AI will help refine and complete your plan.</p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <Label>Task Name</Label>
                <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} />
              </div>

              <div>
                <Label>Outcome (What success looks like)</Label>
                <Textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} className="min-h-[100px]" />
              </div>

              <div>
                <Label>Context (Why this matters)</Label>
                <Textarea value={context} onChange={(e) => setContext(e.target.value)} className="min-h-[100px]" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Success Criteria</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addCriteria}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {successCriteria.map((criteria, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={criteria}
                        onChange={(e) => updateCriteria(i, e.target.value)}
                        placeholder={`Criteria ${i + 1}`}
                      />
                      {successCriteria.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCriteria(i)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Delegated To</Label>
                <Input value={teamMember} onChange={(e) => setTeamMember(e.target.value)} placeholder="Team member name" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Potential Risks/Blockers</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addRisk}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {risks.map((risk, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={risk}
                        onChange={(e) => updateRisk(i, e.target.value)}
                        placeholder={`Risk ${i + 1}`}
                      />
                      {risks.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeRisk(i)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Support & Resources Needed</Label>
                <Textarea value={support} onChange={(e) => setSupport(e.target.value)} placeholder="Tools, access, training, etc..." />
              </div>

              <div>
                <Label>Deadline</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Autonomy Level</Label>
                  <span className="text-sm font-semibold text-primary">{getAutonomyLabel(autonomyLevel[0])}</span>
                </div>
                <Slider
                  value={autonomyLevel}
                  onValueChange={setAutonomyLevel}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low (Check first)</span>
                  <span>Medium (Inform after)</span>
                  <span>High (Full ownership)</span>
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating your plan...
                  </>
                ) : (
                  "Generate My Delegation Plan"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanBuilder;
