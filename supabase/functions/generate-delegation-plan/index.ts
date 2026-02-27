import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://madeeas.app.n8n.cloud/webhook/delegate/ai';

/**
 * n8n Structured Output Parser2 returns:
 * {
 *   "success": true,
 *   "result": {
 *     "success_criteria": ["..."],
 *     "risks": [{ "risk": "...", "mitigation": "..." }],
 *     "check_in_schedule": { "frequency": "...", "format": "...", "topics": ["..."] },
 *     "handoff_message": "...",
 *     "tips": ["..."]                <-- n8n uses "tips", frontend expects "best_practices"
 *   }
 * }
 */
function extractResult(data: any): any {
  if (data?.success && data?.result) return data.result;
  if (data?.success_criteria || data?.handoff_message || data?.risks) return data;
  if (Array.isArray(data) && data[0]) return extractResult(data[0]);
  if (data?.output) return extractResult(typeof data.output === 'string' ? JSON.parse(data.output) : data.output);
  return data;
}

function normalizePlan(result: any): {
  success_criteria: string[];
  risks: Array<{ risk: string; mitigation: string }>;
  check_in_schedule: { frequency: string; format: string; topics: string[] };
  handoff_message: string;
  best_practices: string[];
} {
  // Normalize risks — handle both string[] and object[] formats
  let risks: Array<{ risk: string; mitigation: string }> = [];
  if (Array.isArray(result?.risks)) {
    risks = result.risks.map((r: any) => {
      if (typeof r === 'string') return { risk: r, mitigation: '' };
      return { risk: r.risk || r.description || '', mitigation: r.mitigation || r.solution || '' };
    });
  }

  // Normalize check-in schedule
  let checkInSchedule = result?.check_in_schedule || result?.checkInSchedule;
  if (typeof checkInSchedule === 'string') {
    checkInSchedule = { frequency: checkInSchedule, format: 'sync', topics: ['progress', 'blockers'] };
  }
  if (!checkInSchedule) {
    checkInSchedule = { frequency: 'weekly', format: 'sync', topics: ['progress', 'blockers'] };
  }

  // Map n8n's "tips" → frontend's "best_practices"
  const bestPractices = Array.isArray(result?.best_practices)
    ? result.best_practices
    : Array.isArray(result?.tips)
      ? result.tips
      : [];

  return {
    success_criteria: Array.isArray(result?.success_criteria) ? result.success_criteria : [],
    risks,
    check_in_schedule: checkInSchedule,
    handoff_message: typeof result?.handoff_message === 'string' ? result.handoff_message : '',
    best_practices: bestPractices,
  };
}

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

    const sessionId = crypto.randomUUID();

    const payload = {
      session_id: sessionId,
      function_type: 'generate_plan',
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      data: planData
    };

    console.log('[generate-delegation-plan] Calling webhook with:', JSON.stringify(payload));

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
    console.log(`[generate-delegation-plan] Raw response in ${duration}ms:`, JSON.stringify(rawData));

    if (rawData?.error || rawData?.success === false) {
      throw new Error(rawData.error || rawData.message || 'Webhook returned unsuccessful response');
    }

    const result = extractResult(rawData);
    const plan = normalizePlan(result);

    console.log('[generate-delegation-plan] Mapped plan:', JSON.stringify(plan));

    return new Response(JSON.stringify({ plan }), {
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
