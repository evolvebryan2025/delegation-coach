import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUpcomingCheckIns = () => {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from("follow_ups")
        .select(`
          *,
          delegation_plans(task_name, team_member)
        `)
        .eq("user_id", user.id)
        .eq("completed", false)
        .gte("check_in_date", today)
        .order("check_in_date", { ascending: true })
        .limit(10);

      setCheckIns(data || []);
      setLoading(false);
    };

    fetchCheckIns();
  }, []);

  return { checkIns, loading };
};
