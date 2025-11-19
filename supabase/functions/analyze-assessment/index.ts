import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://madeeas.app.n8n.cloud/webhook/delegate/ai';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessment } = await req.json();
    const startTime = Date.now();

    const systemPrompt = `You are an expert delegation coach. Analyze the user's delegation assessment and provide insights. Identify: 1) Key patterns in their delegation approach, 2) Specific barriers preventing effective delegation, 3) Actionable recommendations to improve. Be empathetic, specific, and encouraging.`;

    const userPrompt = `Assessment Responses:
- Tasks draining time: ${assessment.draining_tasks}
- Tasks not delegating: ${assessment.tasks_not_delegating}
- Barriers to delegation: ${assessment.delegation_barriers}
- Team members available: ${assessment.team_members}

Analyze these responses and provide specific insights.`;

    const payload = {
      function_type: 'analyze_assessment',
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      data: {
        draining_tasks: assessment.draining_tasks,
        tasks_not_delegating: assessment.tasks_not_delegating,
        delegation_barriers: assessment.delegation_barriers,
        team_members: assessment.team_members
      }
    };

    console.log('[analyze-assessment] Calling webhook with:', payload);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;
    
    console.log(`[analyze-assessment] Received response in ${duration}ms:`, data);

    if (!data.success) {
      throw new Error(data.error || 'Webhook returned unsuccessful response');
    }

    return new Response(JSON.stringify({ insights: data.result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-assessment:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to analyze assessment via webhook'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
