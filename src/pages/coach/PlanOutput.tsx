import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Mail, Edit, ArrowRight, Check, AlertTriangle, Shield, Clock, Video, ListChecks } from "lucide-react";

interface RiskItem {
  risk: string;
  mitigation: string;
}

interface CheckInSchedule {
  frequency: string;
  format: string;
  topics: string[];
}

const parseRisk = (riskStr: string): RiskItem | null => {
  try {
    return JSON.parse(riskStr);
  } catch {
    return null;
  }
};

const parseCheckInSchedule = (scheduleStr: string): CheckInSchedule | null => {
  try {
    return JSON.parse(scheduleStr);
  } catch {
    return null;
  }
};

const parseRiskItem = (risk: any): RiskItem | null => {
  if (typeof risk === "object" && risk !== null && "risk" in risk && "mitigation" in risk) {
    return risk as RiskItem;
  }
  if (typeof risk === "string") {
    return parseRisk(risk);
  }
  return null;
};

const PlanOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!location.state) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-bold mb-4">No Plan Data</h2>
            <p className="text-muted-foreground mb-6">Please build a plan first.</p>
            <Button onClick={() => navigate("/coach/plan-builder")}>Go to Plan Builder</Button>
          </div>
        </div>
      </div>
    );
  }

  const { plan, aiData } = location.state as any;

  const copyHandoffMessage = () => {
    navigator.clipboard.writeText(plan.handoff_message || "");
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

              {plan.success_criteria && plan.success_criteria.length > 0 && <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Success Criteria</h3>
                <ul className="space-y-2">
                  {plan.success_criteria.map((criteria: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>}

              {plan.context && <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Context</h3>
                <p>{plan.context}</p>
              </div>}

              {plan.risks && plan.risks.length > 0 && <div>
                <h3 className="text-xl font-semibold mb-2 text-warning">Risks & Mitigation</h3>
                <ul className="space-y-3">
                  {plan.risks.map((riskItem: any, i: number) => {
                    const riskData = parseRiskItem(riskItem);
                    const riskStr = typeof riskItem === "string" ? riskItem : JSON.stringify(riskItem);
                    if (!riskData) return (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning mt-1 flex-shrink-0" />
                        <span>{riskStr}</span>
                      </li>
                    );
                    return (
                      <li key={i} className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-warning mt-1 flex-shrink-0" />
                          <span className="font-medium">{riskData.risk}</span>
                        </div>
                        <div className="flex items-start gap-2 ml-6">
                          <Shield className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{riskData.mitigation}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>}

              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Check-in Schedule</h3>
                {(() => {
                  const schedule = parseCheckInSchedule(plan.check_in_schedule);
                  if (!schedule) return <p>{plan.check_in_schedule}</p>;
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span><strong>Frequency:</strong> {schedule.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary" />
                        <span><strong>Format:</strong> {schedule.format}</span>
                      </div>
                      {schedule.topics && schedule.topics.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ListChecks className="w-4 h-4 text-primary" />
                            <strong>Topics to Cover:</strong>
                          </div>
                          <ul className="ml-6 space-y-1">
                            {schedule.topics.map((topic, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
