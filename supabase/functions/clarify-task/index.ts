import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://madeeas.app.n8n.cloud/webhook/delegate/ai';

/**
 * n8n Structured Output Parser1 returns:
 * {
 *   "success": true,
 *   "result": {
 *     "questions": ["..."],
 *     "refined_outcome": "...",
 *     "context_needed": ["..."],       <-- array, frontend expects "suggested_context" (string)
 *     "success_criteria": ["..."]
 *   }
 * }
 */
function extractResult(data: any): any {
  if (data?.success && data?.result) return data.result;
  if (data?.refined_outcome || data?.context_needed || data?.success_criteria) return data;
  if (Array.isArray(data) && data[0]) return extractResult(data[0]);
  if (data?.output) return extractResult(typeof data.output === 'string' ? JSON.parse(data.output) : data.output);
  return data;
}

function normalizeClarification(result: any): {
  refined_outcome: string;
  suggested_context: string;
  success_criteria: string[];
  questions: string[];
} {
  // Map n8n's "context_needed" (array) → frontend's "suggested_context" (string)
  let suggestedContext = '';
  if (typeof result?.suggested_context === 'string') {
    suggestedContext = result.suggested_context;
  } else if (Array.isArray(result?.context_needed)) {
    suggestedContext = result.context_needed.join('\n• ');
    if (suggestedContext) suggestedContext = '• ' + suggestedContext;
  } else if (typeof result?.context_needed === 'string') {
    suggestedContext = result.context_needed;
  }

  return {
    refined_outcome: typeof result?.refined_outcome === 'string' ? result.refined_outcome : '',
    suggested_context: suggestedContext,
    success_criteria: Array.isArray(result?.success_criteria) ? result.success_criteria : [],
    questions: Array.isArray(result?.questions) ? result.questions : [],
  };
}

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

    console.log('[clarify-task] Calling webhook with:', JSON.stringify(payload));

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error body');
      throw new Error(`Webhook error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const rawData = await response.json();
    const duration = Date.now() - startTime;
    console.log(`[clarify-task] Raw response in ${duration}ms:`, JSON.stringify(rawData));

    if (rawData?.error || rawData?.success === false) {
      throw new Error(rawData.error || rawData.message || 'Webhook returned unsuccessful response');
    }

    const result = extractResult(rawData);
    const clarification = normalizeClarification(result);

    console.log('[clarify-task] Mapped clarification:', JSON.stringify(clarification));

    return new Response(JSON.stringify({ clarification }), {
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
