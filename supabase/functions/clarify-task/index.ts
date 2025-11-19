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
    const { task, responses } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a delegation coach helping clarify task requirements. 
Ask probing questions to help the user define clear, measurable outcomes.
Refine vague descriptions into precise, actionable objectives.`;

    const userPrompt = `Task to delegate: ${task}

User responses so far:
${Object.entries(responses || {}).map(([q, a]) => `${q}: ${a}`).join('\n')}

Based on this information, provide:
1. Any additional clarifying questions needed
2. A refined, clear outcome statement
3. Suggested context the team member needs
4. Recommended success criteria`;

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
            name: 'clarify_task',
            description: 'Return clarified task information',
            parameters: {
              type: 'object',
              properties: {
                questions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Additional questions to ask'
                },
                refined_outcome: {
                  type: 'string',
                  description: 'Clear, measurable outcome statement'
                },
                suggested_context: {
                  type: 'string',
                  description: 'Context the team member needs'
                },
                success_criteria: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Recommended success criteria'
                }
              },
              required: ['refined_outcome', 'suggested_context', 'success_criteria']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'clarify_task' } }
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
    const clarification = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ clarification }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in clarify-task:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
