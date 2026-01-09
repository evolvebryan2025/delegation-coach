import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Mail, Edit, ArrowRight, Check, AlertTriangle } from "lucide-react";

const PlanOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plan, aiData } = location.state as any;

  const copyHandoffMessage = () => {
    navigator.clipboard.writeText(plan.handoff_message);
    toast({ title: "Copied!", description: "Handoff message copied to clipboard." });
  };

  const downloadPlan = () => {
    window.print();
  };

  const sendEmail = () => {
    const subject = encodeURIComponent(`Delegation: ${plan.task_name}`);
    const body = encodeURIComponent(plan.handoff_message);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Your Delegation Plan</h1>
            <p className="text-muted-foreground">Professional, clear, and ready to share</p>
          </div>

          <Card className="p-8 mb-6">
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-3xl font-bold mb-2">{plan.task_name}</h2>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Delegated to: <strong>{plan.team_member}</strong></span>
                  <span>Deadline: <strong>{plan.deadline}</strong></span>
                  <span>Autonomy: <strong>{plan.autonomy_level}</strong></span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Outcome</h3>
                <p className="text-lg">{plan.outcome}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Success Criteria</h3>
                <ul className="space-y-2">
                  {plan.success_criteria.map((criteria: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Context</h3>
                <p>{plan.context}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-warning">Risks & Mitigation</h3>
                <ul className="space-y-2">
                  {plan.risks.map((risk: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning mt-1 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Check-in Schedule</h3>
                <p>{plan.check_in_schedule}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6 bg-muted">
            <h3 className="text-lg font-semibold mb-3">Handoff Message</h3>
            <div className="bg-background p-4 rounded-lg mb-4 whitespace-pre-wrap">{plan.handoff_message}</div>
            <div className="flex gap-2">
              <Button onClick={copyHandoffMessage} variant="outline" size="sm"><Copy className="w-4 h-4 mr-2" /> Copy</Button>
              <Button onClick={sendEmail} variant="outline" size="sm"><Mail className="w-4 h-4 mr-2" /> Email</Button>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={downloadPlan}><Download className="w-4 h-4 mr-2" /> Download</Button>
            <Button variant="outline" onClick={() => navigate("/coach/plan-builder", { state: location.state })}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
            <Button onClick={() => navigate("/coach/follow-up", { state: { plan } })} className="flex-1">
              Set Up Follow-Up <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanOutput;
