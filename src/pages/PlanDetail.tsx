import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Copy, Mail, CheckCircle2, Calendar, Check, AlertTriangle, Shield, Clock, Video, ListChecks, Download, CalendarPlus } from "lucide-react";

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

const parseRiskItem = (risk: any): RiskItem | null => {
  if (typeof risk === "object" && risk !== null && "risk" in risk && "mitigation" in risk) {
    return risk as RiskItem;
  }
  if (typeof risk === "string") {
    return parseRisk(risk);
  }
  return null;
};

const parseCheckInSchedule = (scheduleData: any): CheckInSchedule | null => {
  if (typeof scheduleData === "object" && scheduleData !== null && "frequency" in scheduleData) {
    return scheduleData as CheckInSchedule;
  }
  if (typeof scheduleData === "string") {
    try {
      return JSON.parse(scheduleData);
    } catch {
      return null;
    }
  }
  return null;
};
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

  const exportPDF = () => {
    if (!plan) return;
    // Build a printable HTML document and trigger print
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Blocked", description: "Please allow popups to export PDF.", variant: "destructive" });
      return;
    }

    const risks = (plan.risks || []).map((r: any) => {
      const parsed = parseRiskItem(r);
      return parsed ? `<li><strong>${parsed.risk}</strong> — ${parsed.mitigation}</li>` : `<li>${typeof r === "string" ? r : JSON.stringify(r)}</li>`;
    }).join("");

    const criteria = (plan.success_criteria || []).map((c: string) => `<li>${c}</li>`).join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${plan.task_name} - Delegation Plan</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a2e; }
        h1 { color: #152e47; border-bottom: 3px solid #fd5811; padding-bottom: 12px; }
        h2 { color: #152e47; margin-top: 24px; }
        .meta { display: flex; gap: 24px; color: #666; margin-bottom: 24px; }
        .meta strong { color: #333; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .handoff { background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap; margin-top: 8px; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
      </style></head><body>
      <h1>${plan.task_name}</h1>
      <div class="meta">
        <span>Delegated to: <strong>${plan.team_member || "N/A"}</strong></span>
        ${plan.deadline ? `<span>Deadline: <strong>${new Date(plan.deadline).toLocaleDateString()}</strong></span>` : ""}
        ${plan.autonomy_level ? `<span>Autonomy: <strong>${plan.autonomy_level}</strong></span>` : ""}
        <span>Status: <strong>${plan.status}</strong></span>
      </div>
      <h2>Outcome</h2><p>${plan.outcome || ""}</p>
      ${criteria ? `<h2>Success Criteria</h2><ul>${criteria}</ul>` : ""}
      ${plan.context ? `<h2>Context</h2><p>${plan.context}</p>` : ""}
      ${risks ? `<h2>Risks & Mitigation</h2><ul>${risks}</ul>` : ""}
      ${plan.handoff_message ? `<h2>Handoff Message</h2><div class="handoff">${plan.handoff_message}</div>` : ""}
      <div class="footer">Generated by Madeea Delegate on ${new Date().toLocaleDateString()}</div>
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const exportICS = () => {
    if (!followUps.length) {
      toast({ title: "No follow-ups", description: "Schedule a follow-up first to export to calendar.", variant: "destructive" });
      return;
    }

    const events = followUps.map((fu) => {
      const date = new Date(fu.check_in_date);
      const dtStart = date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endDate = new Date(date.getTime() + 30 * 60 * 1000);
      const dtEnd = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const uid = `${fu.id}@madeea-delegate`;

      return `BEGIN:VEVENT
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:Delegation Check-in: ${plan?.task_name || "Delegation"}
DESCRIPTION:${fu.frequency} check-in for delegation to ${plan?.team_member || "team member"}
UID:${uid}
END:VEVENT`;
    }).join("\n");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Madeea Delegate//EN
${events}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(plan?.task_name || "delegation").replace(/[^a-zA-Z0-9]/g, "_")}_followups.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Calendar file downloaded. Open it to add events to your calendar." });
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
              <Button onClick={exportPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              {followUps.length > 0 && (
                <Button onClick={exportICS} variant="outline">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
              )}
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
                        <Check className="w-4 h-4 text-success mt-1 flex-shrink-0" />
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
                  <ul className="space-y-3">
                    {plan.risks.map((riskItem: any, i: number) => {
                      const riskData = parseRiskItem(riskItem);
                      const displayStr = typeof riskItem === "string" ? riskItem : (riskItem?.risk || JSON.stringify(riskItem));
                      if (!riskData) return (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning mt-1 flex-shrink-0" />
                          <span>{displayStr}</span>
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
                </div>
              )}

              {plan.check_in_schedule && (
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

          {followUps.length === 0 && plan.status !== "completed" ? (
            <Card className="p-6 border-dashed border-2">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Follow-Up Scheduled</h3>
                <p className="text-muted-foreground mb-4">
                  Set up check-in reminders to ensure successful delegation
                </p>
                <Button onClick={() => navigate("/coach/follow-up", { state: { plan } })}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Set Up Follow-Up
                </Button>
              </div>
            </Card>
          ) : followUps.length > 0 ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
