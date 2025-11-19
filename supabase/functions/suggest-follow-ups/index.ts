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

    const systemPrompt = `You are a delegation coach helping set up effective follow-ups.
Provide practical templates and accountability questions.`;

    const userPrompt = `Task: ${planData.task_name}
Team Member: ${planData.team_member}
Timeline: ${planData.deadline}
Autonomy: ${planData.autonomy_level}

Generate:
1. Follow-up message templates (3-5 for different check-ins)
2. Reflection questions for later review
3. Recommended follow-up frequency`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_followups',
            description: 'Return follow-up suggestions',
            parameters: {
              type: 'object',
              properties: {
                templates: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Follow-up message templates'
                },
                reflection_questions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Questions for delegation review'
                },
                recommended_frequency: {
                  type: 'string',
                  description: 'Suggested check-in frequency'
                }
              },
              required: ['templates', 'reflection_questions', 'recommended_frequency']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_followups' } }
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
    const suggestions = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in suggest-follow-ups:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
