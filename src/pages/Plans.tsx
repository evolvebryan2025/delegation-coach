import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Calendar, User, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

const PLANS_PER_PAGE = 10;

const Plans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, [statusFilter]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [search, statusFilter]);

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

  const filteredPlans = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return plans;
    return plans.filter(plan =>
      plan.task_name?.toLowerCase().includes(q) ||
      plan.team_member?.toLowerCase().includes(q) ||
      plan.outcome?.toLowerCase().includes(q) ||
      plan.context?.toLowerCase().includes(q) ||
      plan.autonomy_level?.toLowerCase().includes(q)
    );
  }, [plans, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / PLANS_PER_PAGE));
  const paginatedPlans = filteredPlans.slice((page - 1) * PLANS_PER_PAGE, page * PLANS_PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedPlans.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPlans.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from("delegation_plans")
        .delete()
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      toast({ title: "Deleted", description: `${selectedIds.size} plan(s) deleted.` });
      setSelectedIds(new Set());
      fetchPlans();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from("delegation_plans")
        .update({ status: newStatus })
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      toast({ title: "Updated", description: `${selectedIds.size} plan(s) marked as ${newStatus}.` });
      setSelectedIds(new Set());
      fetchPlans();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  };

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
                placeholder="Search tasks, team members, outcomes..."
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

          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange("active")}
                disabled={bulkLoading}
              >
                Mark Active
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange("completed")}
                disabled={bulkLoading}
              >
                Mark Completed
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkLoading}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          )}

          {filteredPlans.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No plans found</p>
              <Button onClick={() => navigate("/coach/welcome")}>
                Create Your First Plan
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {/* Select all header */}
                <div className="flex items-center gap-3 px-2">
                  <Checkbox
                    checked={paginatedPlans.length > 0 && selectedIds.size === paginatedPlans.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-xs text-muted-foreground">
                    {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""} total
                  </span>
                </div>

                {paginatedPlans.map((plan) => (
                  <div key={plan.id} className="flex items-start gap-3">
                    <div className="pt-6">
                      <Checkbox
                        checked={selectedIds.has(plan.id)}
                        onCheckedChange={() => toggleSelect(plan.id)}
                      />
                    </div>
                    <Card
                      className="p-6 hover:shadow-card-hover transition-all cursor-pointer flex-1"
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
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;
