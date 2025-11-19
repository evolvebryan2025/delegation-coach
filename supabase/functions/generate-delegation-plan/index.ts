import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a delegation coach creating professional delegation plans.
Generate a comprehensive plan with clear outcomes, success criteria, and handoff messaging.
Be specific, actionable, and professional.`;

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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_plan',
            description: 'Return complete delegation plan',
            parameters: {
              type: 'object',
              properties: {
                success_criteria: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Specific, measurable success criteria'
                },
                risks: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Potential risks with mitigation strategies'
                },
                check_in_schedule: {
                  type: 'string',
                  description: 'Recommended check-in frequency and timing'
                },
                handoff_message: {
                  type: 'string',
                  description: 'Professional message to send to team member'
                },
                best_practices: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Specific tips for this delegation'
                }
              },
              required: ['success_criteria', 'risks', 'check_in_schedule', 'handoff_message', 'best_practices']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_plan' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    const plan = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-delegation-plan:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
