import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { HeartCrack, Clock, Target, Handshake, BarChart3, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  teamSize: string;
  challenge: string;
  hoursSpent: number;
}

const challenges = [
  { id: "letgo", icon: HeartCrack, label: "I struggle to let go" },
  { id: "time", icon: Clock, label: "I don't have time to explain" },
  { id: "what", icon: Target, label: "I don't know what to delegate" },
  { id: "ready", icon: Handshake, label: "My team isn't ready" },
  { id: "track", icon: BarChart3, label: "I'm not sure how to track it" },
];

export const OnboardingModal = ({ open, onOpenChange, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [challenge, setChallenge] = useState("");
  const [hoursSpent, setHoursSpent] = useState([10]);
  const { toast } = useToast();

  const progress = (step / 3) * 100;

  const handleNext = () => {
    if (step === 1 && !name) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (step === 2 && (!teamSize || !challenge)) {
      toast({ title: "Please complete all fields", variant: "destructive" });
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ name, teamSize, challenge, hoursSpent: hoursSpent[0] });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to Your Delegation Journey</DialogTitle>
        </DialogHeader>

        <Progress value={progress} className="mb-6" />

        <div className="space-y-6">
          {step === 1 && (
            <div className="animate-scale-in space-y-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Hi! Let's get started</h3>
                <p className="text-muted-foreground">What should we call you?</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-scale-in space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Tell us about your team</h3>
                <div className="space-y-2">
                  <Label htmlFor="team-size">How many people report to you?</Label>
                  <Select value={teamSize} onValueChange={setTeamSize}>
                    <SelectTrigger id="team-size">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3 people</SelectItem>
                      <SelectItem value="4-7">4-7 people</SelectItem>
                      <SelectItem value="8-15">8-15 people</SelectItem>
                      <SelectItem value="16+">16+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">What's your biggest delegation challenge?</Label>
                <div className="grid grid-cols-1 gap-3">
                  {challenges.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setChallenge(c.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left hover:border-primary flex items-center ${
                        challenge === c.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <c.icon className="w-6 h-6 mr-3 text-muted-foreground" />
                      <span className="font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-scale-in space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">One more thing, {name}!</h3>
                <p className="text-muted-foreground mb-6">
                  How many hours per week do you spend on tasks others could handle?
                </p>
                
                <div className="space-y-4">
                  <div className="text-center bg-gradient-to-br from-primary to-secondary rounded-2xl p-6">
                    <div className="text-6xl font-bold text-white mb-2">
                      {hoursSpent[0]}
                    </div>
                    <div className="text-white/90 text-lg">hours per week</div>
                  </div>
                  
                  <Slider
                    value={hoursSpent}
                    onValueChange={setHoursSpent}
                    max={40}
                    step={1}
                    className="py-4"
                  />

                  <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Target className="w-6 h-6 text-success flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-success-foreground mb-1">
                          Potential Time Savings
                        </div>
                        <div className="text-sm text-muted-foreground">
                          By mastering delegation, you could reclaim up to{" "}
                          <span className="font-bold text-success">{Math.round(hoursSpent[0] * 0.7)}</span> hours weekly!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              variant="hero"
              onClick={handleNext}
              className="flex-1 text-white"
            >
              {step === 3 ? "Complete Setup" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
