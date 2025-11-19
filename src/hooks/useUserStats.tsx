import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserStats = () => {
  const [stats, setStats] = useState({
    timeReclaimed: 0,
    tasksCompleted: 0,
    teamEmpowerment: 0,
    currentStreak: 7,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: plans } = await supabase
        .from("delegation_plans")
        .select("status, autonomy_level")
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
          currentStreak: 7,
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
