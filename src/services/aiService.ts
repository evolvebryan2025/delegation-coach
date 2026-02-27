/**
 * AI Service — calls n8n webhook directly via Vite proxy (dev) or direct URL (prod).
 *
 * Matches the n8n structured output parser schemas from formats.md:
 * - analyze_assessment → { success, result: { patterns, barriers, recommendations, summary } }
 * - clarify_task       → { success, result: { questions, refined_outcome, context_needed, success_criteria } }
 * - generate_plan      → { success, result: { success_criteria, risks, check_in_schedule, handoff_message, tips } }
 * - suggest_followups  → { success, result: { templates, reflection_questions, recommended_frequency } }
 */

const WEBHOOK_URL = import.meta.env.DEV
  ? '/api/webhook'  // Vite proxy → https://madeeas.app.n8n.cloud/webhook/delegate/ai
  : 'https://madeeas.app.n8n.cloud/webhook/delegate/ai';

// ─── Generic helpers ───────────────────────────────────────────────

function extractResult(data: any): any {
  if (data?.success && data?.result) return data.result;
  if (Array.isArray(data) && data[0]) return extractResult(data[0]);
  if (data?.output) {
    const output = data.output;
    return typeof output === 'string' ? safeParse(output) : extractResult(output);
  }
  if (data?.data) return extractResult(data.data);
  return data;
}

function safeParse(str: string): any {
  try {
    const jsonMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/) || str.match(/(\{[\s\S]*\})/);
    if (jsonMatch) return JSON.parse(jsonMatch[1].trim());
    return JSON.parse(str);
  } catch {
    return str;
  }
}

async function callWebhook(payload: Record<string, any>): Promise<any> {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'No error body');
    throw new Error(`Webhook error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const rawData = await response.json();

  if (rawData?.error || rawData?.success === false) {
    throw new Error(rawData.error || rawData.message || 'Webhook returned unsuccessful response');
  }

  return extractResult(rawData);
}

function uuid(): string {
  return crypto.randomUUID();
}

// ─── 1. Analyze Assessment ────────────────────────────────────────

export interface AssessmentInsights {
  patterns: string[];
  barriers: string[];
  recommendations: string[];
  summary: string;
}

export async function analyzeAssessment(assessment: {
  draining_tasks: string;
  tasks_not_delegating: string;
  delegation_barriers: string;
  team_members: string;
}): Promise<AssessmentInsights> {
  const result = await callWebhook({
    session_id: uuid(),
    function_type: 'analyze_assessment',
    system_prompt: `You are an expert delegation coach. Analyze the user's delegation assessment and provide insights. Identify: 1) Key patterns in their delegation approach, 2) Specific barriers preventing effective delegation, 3) Actionable recommendations to improve. Be empathetic, specific, and encouraging.`,
    user_prompt: `Assessment Responses:\n- Tasks draining time: ${assessment.draining_tasks}\n- Tasks not delegating: ${assessment.tasks_not_delegating}\n- Barriers to delegation: ${assessment.delegation_barriers}\n- Team members available: ${assessment.team_members}\n\nAnalyze these responses and provide specific insights.`,
    data: assessment,
  });

  return {
    patterns: Array.isArray(result?.patterns) ? result.patterns : [],
    barriers: Array.isArray(result?.barriers) ? result.barriers : [],
    recommendations: Array.isArray(result?.recommendations) ? result.recommendations : [],
    summary: typeof result?.summary === 'string' ? result.summary : 'Assessment analysis complete.',
  };
}

// ─── 2. Clarify Task ──────────────────────────────────────────────

export interface TaskClarification {
  refined_outcome: string;
  suggested_context: string;
  success_criteria: string[];
  questions: string[];
}

export async function clarifyTask(
  task: string,
  responses: Record<string, string>
): Promise<TaskClarification> {
  const result = await callWebhook({
    session_id: uuid(),
    function_type: 'clarify_task',
    system_prompt: `You are a delegation coach helping clarify task requirements. Ask probing questions to help the user define clear, measurable outcomes. Refine vague descriptions into precise, actionable objectives.`,
    user_prompt: `Task to delegate: ${task}\n\nUser responses so far:\n${Object.entries(responses || {}).map(([q, a]) => `${q}: ${a}`).join('\n')}\n\nBased on this information, provide:\n1. Any additional clarifying questions needed\n2. A refined, clear outcome statement\n3. Suggested context the team member needs\n4. Recommended success criteria`,
    data: { task, responses },
  });

  // Map n8n's "context_needed" (array) → "suggested_context" (string)
  let suggestedContext = '';
  if (typeof result?.suggested_context === 'string') {
    suggestedContext = result.suggested_context;
  } else if (Array.isArray(result?.context_needed)) {
    suggestedContext = result.context_needed.map((c: string) => `• ${c}`).join('\n');
  }

  return {
    refined_outcome: typeof result?.refined_outcome === 'string' ? result.refined_outcome : '',
    suggested_context: suggestedContext,
    success_criteria: Array.isArray(result?.success_criteria) ? result.success_criteria : [],
    questions: Array.isArray(result?.questions) ? result.questions : [],
  };
}

// ─── 3. Generate Delegation Plan ──────────────────────────────────

export interface DelegationPlan {
  success_criteria: string[];
  risks: Array<{ risk: string; mitigation: string }>;
  check_in_schedule: { frequency: string; format: string; topics: string[] };
  handoff_message: string;
  best_practices: string[];
}

export async function generateDelegationPlan(planData: {
  task_name: string;
  outcome: string;
  context: string;
  team_member: string;
  deadline: string;
  autonomy_level: string;
  support_needed: string;
}): Promise<DelegationPlan> {
  const result = await callWebhook({
    session_id: uuid(),
    function_type: 'generate_plan',
    system_prompt: `You are a delegation coach creating professional delegation plans. Generate a comprehensive plan with clear outcomes, success criteria, and handoff messaging. Be specific, actionable, and professional.`,
    user_prompt: `Create a delegation plan for:\nTask: ${planData.task_name}\nOutcome: ${planData.outcome}\nContext: ${planData.context}\nTeam Member: ${planData.team_member}\nDeadline: ${planData.deadline}\nAutonomy Level: ${planData.autonomy_level}\nSupport Needed: ${planData.support_needed}\n\nGenerate:\n1. Refined success criteria (3-5 specific, measurable items)\n2. Identified risks and mitigation strategies\n3. Recommended check-in schedule\n4. Professional handoff message for the team member\n5. Best practice tips specific to this delegation`,
    data: planData,
  });

  // Normalize risks
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

  // Map n8n's "tips" → "best_practices"
  const bestPractices = Array.isArray(result?.best_practices)
    ? result.best_practices
    : Array.isArray(result?.tips) ? result.tips : [];

  return {
    success_criteria: Array.isArray(result?.success_criteria) ? result.success_criteria : [],
    risks,
    check_in_schedule: checkInSchedule,
    handoff_message: typeof result?.handoff_message === 'string' ? result.handoff_message : '',
    best_practices: bestPractices,
  };
}

// ─── 4. Suggest Follow-ups ────────────────────────────────────────

export interface FollowUpSuggestions {
  templates: Array<{ timing: string; message: string }>;
  reflection_questions: string[];
  recommended_frequency: string;
}

export async function suggestFollowUps(planData: {
  task_name: string;
  team_member: string;
  deadline: string;
  autonomy_level: string;
}): Promise<FollowUpSuggestions> {
  const result = await callWebhook({
    session_id: uuid(),
    function_type: 'suggest_followups',
    system_prompt: `You are a delegation coach helping set up effective follow-ups. Provide practical templates and accountability questions.`,
    user_prompt: `Task: ${planData.task_name}\nTeam Member: ${planData.team_member}\nTimeline: ${planData.deadline}\nAutonomy: ${planData.autonomy_level}\n\nGenerate:\n1. Follow-up message templates (3-5 for different check-ins)\n2. Reflection questions for later review\n3. Recommended follow-up frequency`,
    data: planData,
  });

  let templates: Array<{ timing: string; message: string }> = [];
  if (Array.isArray(result?.templates)) {
    templates = result.templates.map((t: any) => {
      if (typeof t === 'string') return { timing: '', message: t };
      return { timing: t.timing || '', message: t.message || '' };
    });
  }

  return {
    templates,
    reflection_questions: Array.isArray(result?.reflection_questions) ? result.reflection_questions : [],
    recommended_frequency: typeof result?.recommended_frequency === 'string'
      ? result.recommended_frequency
      : typeof result?.frequency === 'string' ? result.frequency : 'weekly',
  };
}
