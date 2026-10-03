// supabase/functions/waste-chat/index.ts
// Supabase Edge Function for AI-powered Waste Segregation Assistant (EcoBot)
// Follows Indian Solid Waste Management Rules 2016 (Swachh Bharat)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are EcoBot, an expert Indian Municipal Waste Segregation assistant strictly adhering to India's Solid Waste Management (SWM) Rules 2016 and Swachh Bharat guidelines.

When a citizen asks how to dispose of an item, determine the proper bin:
1. "green" -> Wet / Organic / Biodegradable Waste (kitchen scraps, peels, cooked food, eggshells, garden leaves, flowers).
2. "blue"  -> Dry / Recyclable Waste (clean plastic bottles, paper, cardboard, clean metal cans, intact glass bottles, tetrapaks, milk pouches).
3. "red"   -> Domestic Hazardous / E-Waste (broken glass, batteries, CFL/tubelights, expired medicines, paint, insecticides, chargers, cables).
4. "black" -> Sanitary / Domestic Reject Waste (used sanitary pads, baby/adult diapers, bandages, cotton swabs, wet wipes, floor sweepings, soiled/greasy pizza boxes).

You must respond ONLY with a valid JSON object (no markdown code blocks, no backticks, no extra text) with these exact keys:
{
  "item_detected": "string (name of identified item)",
  "bin_color": "green" | "blue" | "red" | "black",
  "bin_name": "string (e.g. Green Bin (Wet Waste) / Blue Bin (Dry Recyclable) / Red Bin (Hazardous) / Black Bin (Sanitary))",
  "guidelines": ["string", "string", "string"], // 2 to 3 concise, highly practical disposal instructions (e.g. wrap in newspaper, rinse dry, etc.)
  "explanation": "string (1-2 sentences on why it goes into this bin and its environmental impact)"
}`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query string is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('GROQ_API_KEY') || Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'NO_API_KEY',
          message: 'No LLM API key configured in Supabase Secrets. Please fall back to local knowledge base.'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let responsePayload;

    if (Deno.env.get('OPENAI_API_KEY')) {
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: query }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        })
      });

      const data = await openAiRes.json();
      if (!openAiRes.ok) throw new Error(data.error?.message || 'OpenAI error');
      responsePayload = JSON.parse(data.choices[0].message.content);
    } else if (Deno.env.get('GROQ_API_KEY')) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: query }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        })
      });

      const data = await groqRes.json();
      if (!groqRes.ok) throw new Error(data.error?.message || 'Groq error');
      responsePayload = JSON.parse(data.choices[0].message.content);
    } else if (Deno.env.get('GEMINI_API_KEY')) {
      const geminiKey = Deno.env.get('GEMINI_API_KEY');
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${query}` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await geminiRes.json();
      if (!geminiRes.ok) throw new Error(data.error?.message || 'Gemini error');
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      responsePayload = JSON.parse(rawText);
    }

    return new Response(
      JSON.stringify(responsePayload),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Edge function error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
