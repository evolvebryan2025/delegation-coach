import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Target, Lightbulb, Scale, Check, RefreshCw } from "lucide-react";

const frameworkSteps = [
  {
    letter: "C",
    title: "Context",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Explain why this task matters and how it connects to bigger goals",
    before: "Update the report",
    after: "Update Q4 report so exec team can make budget decisions at Friday meeting",
  },
  {
    letter: "L",
    title: "Level of Authority",
    icon: Scale,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    description: "Clarify decision-making power and when to check in",
    before: "Handle this customer issue",
    after: "You can offer discounts up to 20%. Come to me for anything beyond that",
  },
  {
    letter: "E",
    title: "Expected Outcome",
    icon: Check,
    color: "text-success",
    bgColor: "bg-success/10",
    description: "Define what success looks like with specific criteria",
    before: "Improve the onboarding process",
    after: "New hires complete setup in under 2 hours with 90%+ satisfaction rating",
  },
  {
    letter: "A",
    title: "Assets & Support",
    icon: Lightbulb,
    color: "text-warning",
    bgColor: "bg-warning/10",
    description: "Provide resources, tools, and support they'll need",
    before: "Create a social media plan",
    after: "Use our brand guidelines, previous campaigns folder, and schedule time with Sarah from design",
  },
  {
    letter: "R",
    title: "Review Points",
    icon: RefreshCw,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Set checkpoints to ensure alignment and provide support",
    before: "Get this done by Friday",
    after: "Draft by Tuesday, review together Wednesday, final version Friday morning",
  },
];

const Framework = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="text-5xl font-bold mb-4">
              The <span className="gradient-primary bg-clip-text text-white px-3">C.L.E.A.R</span> Framework
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Master the five essential elements of effective delegation. Transform vague assignments into clear,
              empowering delegations.
            </p>
          </div>

          <div className="space-y-8">
            {frameworkSteps.map((step, index) => (
              <Card
                key={step.letter}
                className="p-8 hover:shadow-card-hover transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline gap-4 mb-4">
                      <h2 className="text-3xl font-bold">
                        <span className={step.color}>{step.letter}</span> - {step.title}
                      </h2>
                    </div>

                    <p className="text-lg text-muted-foreground mb-6">{step.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                        <div className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                          ❌ Before
                        </div>
                        <div className="text-muted-foreground italic">"{step.before}"</div>
                      </div>

                      <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                        <div className="text-sm font-semibold text-success mb-2 flex items-center gap-2">✅ After</div>
                        <div className="text-foreground">"{step.after}"</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-12 p-8 gradient-primary text-white">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">Put It All Together</h3>
              <p className="text-lg text-white/90 mb-6">
                Using all five C.L.E.A.R elements transforms delegation from a simple task assignment into an empowering
                growth opportunity for your team.
              </p>
              <div className="bg-white/10 rounded-xl p-6 text-left">
                <div className="font-semibold mb-3 text-lg">Example: Complete Delegation</div>
                <div className="space-y-2 text-white/90 text-sm leading-relaxed">
                  <p>
                    <strong className="text-white">Context:</strong> We need to increase customer retention by 15% this
                    quarter...
                  </p>
                  <p>
                    <strong className="text-white">Level:</strong> You own the strategy - I just need final approval
                    before launch...
                  </p>
                  <p>
                    <strong className="text-white">Expected:</strong> Achieve 15% improvement with documented playbook
                    for future...
                  </p>
                  <p>
                    <strong className="text-white">Assets:</strong> You'll have $5K budget, access to customer data, and
                    marketing support...
                  </p>
                  <p>
                    <strong className="text-white">Review:</strong> Let's check progress weekly on Mondays at 10am...
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Framework;
