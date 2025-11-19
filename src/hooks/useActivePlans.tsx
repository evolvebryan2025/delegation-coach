import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useActivePlans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("delegation_plans")
        .select(`
          *,
          follow_ups(check_in_date, frequency, completed)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("deadline", { ascending: true })
        .limit(5);

      setPlans(data || []);
      setLoading(false);
    };

    fetchPlans();
  }, []);

  return { plans, loading };
};
