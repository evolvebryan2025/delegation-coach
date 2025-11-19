import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Copy, Mail, CheckCircle2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plan, setPlan] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    const { data: planData } = await supabase
      .from("delegation_plans")
      .select("*")
      .eq("id", id)
      .single();

    const { data: followUpData } = await supabase
      .from("follow_ups")
      .select("*")
      .eq("delegation_plan_id", id)
      .order("check_in_date", { ascending: true });

    setPlan(planData);
    setFollowUps(followUpData || []);
    setLoading(false);
  };

  const handleComplete = async () => {
    const { error } = await supabase
      .from("delegation_plans")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Plan marked as completed!" });
      fetchPlanDetails();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    const { error } = await supabase
      .from("delegation_plans")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Plan deleted successfully" });
      navigate("/plans");
    }
  };

  const copyHandoffMessage = () => {
    if (plan?.handoff_message) {
      navigator.clipboard.writeText(plan.handoff_message);
      toast({ title: "Copied!", description: "Handoff message copied to clipboard." });
    }
  };

  const sendEmail = () => {
    if (plan) {
      const subject = encodeURIComponent(`Delegation: ${plan.task_name}`);
      const body = encodeURIComponent(plan.handoff_message || "");
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <Skeleton className="h-12 w-96 mb-8" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Plan Not Found</h2>
              <Button onClick={() => navigate("/plans")}>Back to Plans</Button>
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
        <div className="container mx-auto max-w-5xl">
          <Button variant="ghost" onClick={() => navigate("/plans")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>

          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{plan.task_name}</h1>
                <Badge variant={plan.status === "completed" ? "secondary" : "default"}>
                  {plan.status}
                </Badge>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Delegated to: <strong>{plan.team_member}</strong></span>
                {plan.deadline && <span>Deadline: <strong>{new Date(plan.deadline).toLocaleDateString()}</strong></span>}
                {plan.autonomy_level && <span>Autonomy: <strong>{plan.autonomy_level}</strong></span>}
              </div>
            </div>
            <div className="flex gap-2">
              {plan.status !== "completed" && (
                <Button onClick={handleComplete} variant="outline">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <Card className="p-8 mb-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Outcome</h3>
                <p className="text-lg">{plan.outcome}</p>
              </div>

              {plan.success_criteria && plan.success_criteria.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Success Criteria</h3>
                  <ul className="space-y-2">
                    {plan.success_criteria.map((criteria: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.context && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Context</h3>
                  <p>{plan.context}</p>
                </div>
              )}

              {plan.risks && plan.risks.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-warning">Risks & Mitigation</h3>
                  <ul className="space-y-2">
                    {plan.risks.map((risk: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-warning mt-1">⚠</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.check_in_schedule && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Check-in Schedule</h3>
                  <p>{plan.check_in_schedule}</p>
                </div>
              )}
            </div>
          </Card>

          {plan.handoff_message && (
            <Card className="p-6 mb-6 bg-muted">
              <h3 className="text-lg font-semibold mb-3">Handoff Message</h3>
              <div className="bg-background p-4 rounded-lg mb-4 whitespace-pre-wrap">
                {plan.handoff_message}
              </div>
              <div className="flex gap-2">
                <Button onClick={copyHandoffMessage} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
                <Button onClick={sendEmail} variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
              </div>
            </Card>
          )}

          {followUps.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Follow-up Schedule
              </h3>
              <div className="space-y-3">
                {followUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      followUp.completed ? "bg-success/10" : "bg-muted"
                    }`}
                  >
                    <div>
                      <div className="font-medium">
                        {new Date(followUp.check_in_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {followUp.frequency} check-in
                      </div>
                    </div>
                    <Badge variant={followUp.completed ? "secondary" : "outline"}>
                      {followUp.completed ? "Completed" : "Scheduled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
