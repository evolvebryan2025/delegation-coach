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

    const systemPrompt = `You are a delegation coach helping set up effective follow-ups. Provide practical templates and accountability questions.`;

    const userPrompt = `Task: ${planData.task_name}
Team Member: ${planData.team_member}
Timeline: ${planData.deadline}
Autonomy: ${planData.autonomy_level}

Generate:
1. Follow-up message templates (3-5 for different check-ins)
2. Reflection questions for later review
3. Recommended follow-up frequency`;

    const payload = {
      function_type: 'suggest_followups',
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      data: planData
    };

    console.log('[suggest-follow-ups] Calling webhook with:', payload);

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
    
    console.log(`[suggest-follow-ups] Received response in ${duration}ms:`, data);

    if (!data.success) {
      throw new Error(data.error || 'Webhook returned unsuccessful response');
    }

    return new Response(JSON.stringify({ suggestions: data.result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in suggest-follow-ups:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to suggest follow-ups via webhook'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
