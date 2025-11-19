import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Target, Users, TrendingUp, Plus } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useActivePlans } from "@/hooks/useActivePlans";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useUserStats();
  const { plans, loading: plansLoading } = useActivePlans();

  if (statsLoading || plansLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <Skeleton className="h-12 w-96 mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 animate-slide-up flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Delegation Dashboard</h1>
              <p className="text-muted-foreground text-lg">Track your progress and see your impact grow</p>
            </div>
            <Button onClick={() => navigate("/coach/welcome")}>
              <Plus className="w-4 h-4 mr-2" />
              New Delegation
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center`}>
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.timeReclaimed.toFixed(1)}hrs</div>
              <div className="text-sm text-muted-foreground">Time Reclaimed Weekly</div>
              <div className="mt-2 text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Growing your impact
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center`}>
                  <Target className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.tasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Active Delegations</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Currently tracking
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center`}>
                  <Users className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.teamEmpowerment}%</div>
              <div className="text-sm text-muted-foreground">Team Empowerment</div>
              <div className="mt-2 text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Building capability
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center`}>
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">Level 3</div>
              <div className="text-sm text-muted-foreground">Process Builder</div>
              <div className="mt-2 text-xs text-primary">
                🌳 75% to Level 4
              </div>
            </Card>
          </div>

          {/* Delegation Streak */}
          {stats.currentStreak > 0 && (
            <Card className="p-8 mb-8 gradient-primary text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-bold mb-2 flex items-center gap-3">
                    🔥 <span>{stats.currentStreak} Week Streak</span>
                  </div>
                  <p className="text-white/90">
                    You're on fire! Keep up the amazing delegation momentum.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Activity Feed */}
          <div className="grid lg:grid-cols-1 gap-8">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Active Delegations</h2>
                <Button variant="outline" onClick={() => navigate("/plans")}>
                  View All
                </Button>
              </div>
              {plans.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No active delegations yet</p>
                  <Button onClick={() => navigate("/coach/welcome")}>
                    Create Your First Plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {plans.slice(0, 5).map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/plans/${plan.id}`)}
                    >
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {plan.team_member?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold mb-1">{plan.task_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Delegated to {plan.team_member} • Due {new Date(plan.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 bg-primary/20 text-primary">
                        {plan.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
