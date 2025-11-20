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
    const { task, responses } = await req.json();
    const startTime = Date.now();

    const systemPrompt = `You are a delegation coach helping clarify task requirements. Ask probing questions to help the user define clear, measurable outcomes. Refine vague descriptions into precise, actionable objectives.`;

    const userPrompt = `Task to delegate: ${task}

User responses so far:
${Object.entries(responses || {}).map(([q, a]) => `${q}: ${a}`).join('\n')}

Based on this information, provide:
1. Any additional clarifying questions needed
2. A refined, clear outcome statement
3. Suggested context the team member needs
4. Recommended success criteria`;

    const sessionId = crypto.randomUUID();
    
    const payload = {
      session_id: sessionId,
      function_type: 'clarify_task',
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      data: {
        task,
        responses
      }
    };

    console.log('[clarify-task] Calling webhook with:', payload);

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
    
    console.log(`[clarify-task] Received response in ${duration}ms:`, data);

    if (!data.success) {
      throw new Error(data.error || 'Webhook returned unsuccessful response');
    }

    return new Response(JSON.stringify({ clarification: data.result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in clarify-task:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to clarify task via webhook'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
