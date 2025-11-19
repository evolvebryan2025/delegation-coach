import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Plus, Calendar, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Plans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, [statusFilter]);

  const fetchPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("delegation_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setPlans(data || []);
    setLoading(false);
  };

  const filteredPlans = plans.filter(plan =>
    plan.task_name.toLowerCase().includes(search.toLowerCase()) ||
    plan.team_member?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
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
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Delegation Plans</h1>
              <p className="text-muted-foreground">Manage and track all your delegations</p>
            </div>
            <Button onClick={() => navigate("/coach/welcome")}>
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by task or team member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPlans.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No plans found</p>
              <Button onClick={() => navigate("/coach/welcome")}>
                Create Your First Plan
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="p-6 hover:shadow-card-hover transition-all cursor-pointer"
                  onClick={() => navigate(`/plans/${plan.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{plan.task_name}</h3>
                        <Badge variant={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {plan.outcome}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {plan.team_member && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{plan.team_member}</span>
                          </div>
                        )}
                        {plan.deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(plan.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        {plan.autonomy_level && (
                          <Badge variant="outline">{plan.autonomy_level} Autonomy</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;
