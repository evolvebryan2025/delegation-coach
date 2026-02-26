import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const calculateStreak = (plans: { status: string; created_at: string }[]): number => {
  const completedDates = plans
    .filter(p => p.status === "completed" || p.status === "active")
    .map(p => {
      const d = new Date(p.created_at);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    })
    .sort((a, b) => b - a);

  if (completedDates.length === 0) return 0;

  const uniqueWeeks = [...new Set(completedDates.map(d => {
    const date = new Date(d);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.getTime();
  }))].sort((a, b) => b - a);

  let streak = 1;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  for (let i = 1; i < uniqueWeeks.length; i++) {
    if (uniqueWeeks[i - 1] - uniqueWeeks[i] <= oneWeek + 86400000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

export const useUserStats = () => {
  const [stats, setStats] = useState({
    timeReclaimed: 0,
    tasksCompleted: 0,
    teamEmpowerment: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: plans } = await supabase
        .from("delegation_plans")
        .select("status, autonomy_level, created_at")
        .eq("user_id", user.id);

      if (plans) {
        const completed = plans.filter(p => p.status === "completed").length;
        const timeReclaimed = completed * 2.5;

        const empowermentScores = plans.map(p => {
          if (p.autonomy_level === "High") return 100;
          if (p.autonomy_level === "Medium") return 60;
          return 30;
        });

        const avgEmpowerment = empowermentScores.length
          ? empowermentScores.reduce((a, b) => a + b, 0) / empowermentScores.length
          : 0;

        setStats({
          timeReclaimed,
          tasksCompleted: plans.filter(p => p.status === "active").length,
          teamEmpowerment: Math.round(avgEmpowerment),
          currentStreak: calculateStreak(plans as any),
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
