import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";

const FollowUp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [checkInDate, setCheckInDate] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [loading, setLoading] = useState(false);

  if (!location.state || !(location.state as any).plan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold mb-4">No Plan Selected</h2>
            <p className="text-muted-foreground mb-6">Please create a delegation plan first.</p>
            <Button onClick={() => navigate("/coach/plan-builder")}>Go to Plan Builder</Button>
          </div>
        </div>
      </div>
    );
  }

  const { plan } = location.state as any;

  const handleComplete = async () => {
    if (!checkInDate) {
      toast({ title: "Date Required", description: "Please select a check-in date.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("follow_ups").insert({
        delegation_plan_id: plan.id,
        user_id: user.id,
        check_in_date: checkInDate,
        frequency,
      });

      await supabase.from("delegation_plans").update({ status: "active" }).eq("id", plan.id);

      toast({ title: "Success!", description: "Follow-up schedule created." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Set Up Follow-Up</h1>
              <p className="text-muted-foreground">Schedule check-ins to ensure successful delegation</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>First Check-In Date</Label>
                <Input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
              </div>

              <div>
                <Label>Follow-Up Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleComplete} disabled={loading} size="lg" className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Complete & View Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FollowUp;
