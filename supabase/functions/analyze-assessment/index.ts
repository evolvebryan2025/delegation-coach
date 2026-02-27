import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://madeeas.app.n8n.cloud/webhook/delegate/ai';

/**
 * n8n "Respond to Webhook" node returns: JSON.stringify($json.output)
 * where $json.output is the structured output parser result:
 * {
 *   "success": true,
 *   "result": {
 *     "patterns": ["..."],
 *     "barriers": ["..."],
 *     "recommendations": ["..."],
 *     "summary": "..."
 *   }
 * }
 */
function extractResult(data: any): any {
  // n8n structured output: { success: true, result: { ... } }
  if (data?.success && data?.result) return data.result;
  // If $json.output was the result object directly
  if (data?.patterns || data?.barriers || data?.recommendations) return data;
  // Array wrapper
  if (Array.isArray(data) && data[0]) return extractResult(data[0]);
  // Nested under output key
  if (data?.output) return extractResult(typeof data.output === 'string' ? JSON.parse(data.output) : data.output);
  return data;
}

function normalizeInsights(result: any): {
  patterns: string[];
  barriers: string[];
  recommendations: string[];
  summary: string;
} {
  return {
    patterns: Array.isArray(result?.patterns) ? result.patterns : [],
    barriers: Array.isArray(result?.barriers) ? result.barriers : [],
    recommendations: Array.isArray(result?.recommendations) ? result.recommendations : [],
    summary: typeof result?.summary === 'string' ? result.summary : 'Assessment analysis complete.',
  };
}

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

    const sessionId = crypto.randomUUID();

    const payload = {
      session_id: sessionId,
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

    console.log('[analyze-assessment] Calling webhook with:', JSON.stringify(payload));

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
    console.log(`[analyze-assessment] Raw response in ${duration}ms:`, JSON.stringify(rawData));

    if (rawData?.error || rawData?.success === false) {
      throw new Error(rawData.error || rawData.message || 'Webhook returned unsuccessful response');
    }

    const result = extractResult(rawData);
    const insights = normalizeInsights(result);

    console.log('[analyze-assessment] Mapped insights:', JSON.stringify(insights));

    return new Response(JSON.stringify({ insights }), {
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
