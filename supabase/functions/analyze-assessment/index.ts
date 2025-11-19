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
    const { assessment } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert delegation coach. Analyze the user's delegation assessment and provide insights.

Identify:
1. Key patterns in their delegation approach
2. Specific barriers preventing effective delegation
3. Actionable recommendations to improve

Be empathetic, specific, and encouraging. Focus on practical next steps.`;

    const userPrompt = `Assessment Responses:
- Tasks draining time: ${assessment.draining_tasks}
- Tasks not delegating: ${assessment.tasks_not_delegating}
- Barriers to delegation: ${assessment.delegation_barriers}
- Team members available: ${assessment.team_members}

Analyze these responses and provide specific insights about their delegation habits, barriers, and recommendations.`;

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
            name: 'provide_insights',
            description: 'Return structured delegation insights',
            parameters: {
              type: 'object',
              properties: {
                patterns: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Key patterns identified in delegation approach'
                },
                barriers: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Specific barriers preventing delegation'
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Actionable recommendations'
                },
                summary: {
                  type: 'string',
                  description: 'Overall summary of insights'
                }
              },
              required: ['patterns', 'barriers', 'recommendations', 'summary']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_insights' } }
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
    const insights = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-assessment:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
