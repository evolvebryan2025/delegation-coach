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
    const { planData } = await req.json();
    const startTime = Date.now();

    const systemPrompt = `You are a delegation coach creating professional delegation plans. Generate a comprehensive plan with clear outcomes, success criteria, and handoff messaging. Be specific, actionable, and professional.`;

    const userPrompt = `Create a delegation plan for:
Task: ${planData.task_name}
Outcome: ${planData.outcome}
Context: ${planData.context}
Team Member: ${planData.team_member}
Deadline: ${planData.deadline}
Autonomy Level: ${planData.autonomy_level}
Support Needed: ${planData.support_needed}

Generate:
1. Refined success criteria (3-5 specific, measurable items)
2. Identified risks and mitigation strategies
3. Recommended check-in schedule
4. Professional handoff message for the team member
5. Best practice tips specific to this delegation`;

    const payload = {
      function_type: 'generate_plan',
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      data: planData
    };

    console.log('[generate-delegation-plan] Calling webhook with:', payload);

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
    
    console.log(`[generate-delegation-plan] Received response in ${duration}ms:`, data);

    if (!data.success) {
      throw new Error(data.error || 'Webhook returned unsuccessful response');
    }

    return new Response(JSON.stringify({ plan: data.result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-delegation-plan:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to generate delegation plan via webhook'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
