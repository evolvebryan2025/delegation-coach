import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Clock, Target, Users, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold mb-2">Your Delegation Dashboard</h1>
            <p className="text-muted-foreground text-lg">Track your progress and see your impact grow</p>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center`}>
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">12.5hrs</div>
              <div className="text-sm text-muted-foreground">Time Reclaimed Weekly</div>
              <div className="mt-2 text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +3.5hrs from last week
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center`}>
                  <Target className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">24</div>
              <div className="text-sm text-muted-foreground">Tasks Delegated</div>
              <div className="mt-2 text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                8 this week
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center`}>
                  <Users className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">85%</div>
              <div className="text-sm text-muted-foreground">Team Empowerment</div>
              <div className="mt-2 text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% this month
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
          <Card className="p-8 mb-8 gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl font-bold mb-2 flex items-center gap-3">
                  🔥 <span>7 Week Streak</span>
                </div>
                <p className="text-white/90">
                  You're on fire! Keep up the amazing delegation momentum.
                </p>
              </div>
            </div>
          </Card>

          {/* Activity Feed */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Recent Delegations</h2>
              <div className="space-y-4">
                {[
                  { task: "Q4 Budget Analysis", person: "Sarah J.", time: "2 hours ago", status: "In Progress" },
                  { task: "Customer Survey", person: "Mike T.", time: "Yesterday", status: "Completed" },
                  { task: "Social Media Plan", person: "Alex K.", time: "2 days ago", status: "Review" },
                  { task: "Process Documentation", person: "Jordan L.", time: "3 days ago", status: "Completed" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {item.person.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold mb-1">{item.task}</div>
                      <div className="text-sm text-muted-foreground">
                        Delegated to {item.person} • {item.time}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      item.status === 'Completed' ? 'bg-success/20 text-success' :
                      item.status === 'In Progress' ? 'bg-primary/20 text-primary' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Team Growth</h2>
              <div className="space-y-6">
                {[
                  { name: "Sarah Johnson", growth: 85, tasks: 12 },
                  { name: "Mike Taylor", growth: 92, tasks: 8 },
                  { name: "Alex Kim", growth: 78, tasks: 15 },
                  { name: "Jordan Lee", growth: 88, tasks: 10 },
                ].map((member, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.tasks} tasks</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full gradient-success"
                        style={{ width: `${member.growth}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {member.growth}% capability growth
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
