import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://madeeas.app.n8n.cloud/webhook/delegate/ai';

/**
 * n8n Structured Output Parser3 returns:
 * {
 *   "success": true,
 *   "result": {
 *     "templates": [
 *       { "timing": "After 1 week", "message": "Hi Maple! How's..." },
 *       { "timing": "After 2 weeks", "message": "Quick check-in..." }
 *     ],
 *     "reflection_questions": ["..."],
 *     "recommended_frequency": "Weekly for first month, bi-weekly..."
 *   }
 * }
 */
function extractResult(data: any): any {
  if (data?.success && data?.result) return data.result;
  if (data?.templates || data?.reflection_questions || data?.recommended_frequency) return data;
  if (Array.isArray(data) && data[0]) return extractResult(data[0]);
  if (data?.output) return extractResult(typeof data.output === 'string' ? JSON.parse(data.output) : data.output);
  return data;
}

function normalizeSuggestions(result: any): {
  templates: Array<{ timing: string; message: string }>;
  reflection_questions: string[];
  recommended_frequency: string;
} {
  // Normalize templates — n8n returns objects {timing, message}
  let templates: Array<{ timing: string; message: string }> = [];
  if (Array.isArray(result?.templates)) {
    templates = result.templates.map((t: any) => {
      if (typeof t === 'string') return { timing: '', message: t };
      return { timing: t.timing || '', message: t.message || '' };
    });
  }

  // Map n8n's "recommended_frequency" → also accept "frequency"
  const frequency = typeof result?.recommended_frequency === 'string'
    ? result.recommended_frequency
    : typeof result?.frequency === 'string'
      ? result.frequency
      : 'weekly';

  return {
    templates,
    reflection_questions: Array.isArray(result?.reflection_questions) ? result.reflection_questions : [],
    recommended_frequency: frequency,
  };
}

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

    const sessionId = crypto.randomUUID();

    const payload = {
      session_id: sessionId,
      function_type: 'suggest_followups',
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      data: planData
    };

    console.log('[suggest-follow-ups] Calling webhook with:', JSON.stringify(payload));

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
    console.log(`[suggest-follow-ups] Raw response in ${duration}ms:`, JSON.stringify(rawData));

    if (rawData?.error || rawData?.success === false) {
      throw new Error(rawData.error || rawData.message || 'Webhook returned unsuccessful response');
    }

    const result = extractResult(rawData);
    const suggestions = normalizeSuggestions(result);

    console.log('[suggest-follow-ups] Mapped suggestions:', JSON.stringify(suggestions));

    return new Response(JSON.stringify({ suggestions }), {
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
