import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a practical meal suggestion assistant for people following specific therapeutic diets while tapering psychiatric medications. Your meals must be:

- Simple: 3–5 ingredients, 3–5 steps, cookable in under 30 minutes
- Budget-friendly: No expensive specialty ingredients
- Low effort: Suitable for someone with low energy or motivation
- Strictly compliant: Every meal must fully comply with the selected diet's rules
- Supportive in tone: Brief, warm, non-judgmental

Ketogenic rules: Under 20g net carbs per meal. High fat. Moderate protein. No grains, sugar, starchy vegetables, or legumes.

Low-carb rules: Under 50g net carbs per meal. Avoid sugar, refined carbs, and highly processed foods. Whole foods preferred.

Anti-inflammatory rules: Emphasize omega-3 rich foods, colorful vegetables, olive oil, nuts, seeds, berries. Avoid seed oils, refined sugar, processed meats, and refined grains.

Always respond ONLY in the following JSON format — no preamble, no markdown, no extra text:

{
  "meal_name": "string",
  "diet_label": "string (Ketogenic | Low-Carb | Anti-Inflammatory)",
  "why_it_works": "string (1-2 sentences)",
  "tapering_note": "string (1 sentence)",
  "ingredients": ["string", "string"],
  "steps": ["string", "string"]
}`;

const VALID_DIETS = ['ketogenic', 'low-carb', 'anti-inflammatory'];

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI meal generator unavailable — API key not configured.' }, { status: 500 });
  }

  try {
    const { diet, ingredient } = await request.json();

    if (!diet || !VALID_DIETS.includes(diet.toLowerCase())) {
      return NextResponse.json({ error: 'Please select a valid diet type.' }, { status: 400 });
    }

    const dietLabel = diet.charAt(0).toUpperCase() + diet.slice(1);
    const userMessage = ingredient
      ? `Generate a ${dietLabel} meal using ${ingredient} as the main ingredient.`
      : `Generate a ${dietLabel} meal. Choose a simple, practical main ingredient.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Claude API error body:', errorBody);
      if (errorBody.includes('credit balance')) {
        return NextResponse.json(
          { error: 'The AI meal generator is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    try {
      const meal = JSON.parse(text);
      return NextResponse.json(meal);
    } catch {
      // Strip markdown fences if present
      const cleaned = text.replace(/```json|```/g, '').trim();
      const meal = JSON.parse(cleaned);
      return NextResponse.json(meal);
    }
  } catch (error) {
    console.error('Meal generator error:', error);
    return NextResponse.json(
      { error: 'Something went wrong — please try again in a moment.' },
      { status: 500 }
    );
  }
}
