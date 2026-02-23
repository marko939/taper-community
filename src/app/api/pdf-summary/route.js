import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ summary: 'AI summary unavailable — API key not configured.' });
  }

  try {
    const { entries, assessments, profile } = await request.json();

    const sorted = [...(entries || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    const drug = profile?.drug || 'their medication';
    const name = profile?.display_name || 'The patient';

    // Build a compact representation of check-in history
    const entryLines = sorted.map((e) => {
      const date = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const symptoms = (e.symptoms || []).join(', ') || 'none';
      return `${date}: ${e.current_dose || '?'}, mood ${e.mood_score}/10, symptoms: ${symptoms}${e.notes ? `, notes: "${e.notes}"` : ''}`;
    }).join('\n');

    const assessmentLines = (assessments || []).map((a) => {
      const date = new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const type = a.type === 'phq9' ? 'PHQ-9 (Depression)' : 'GAD-7 (Anxiety)';
      return `${date}: ${type} score ${a.score}`;
    }).join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `You are writing a clinical summary paragraph for a medication taper report that a patient will share with their healthcare provider. Write a single concise paragraph (3-5 sentences) that:
1. Summarizes the patient's taper journey — starting dose, current dose, duration
2. Notes mood trends and any significant symptom patterns
3. Mentions mental health assessment scores if available
4. Uses clinical, professional language appropriate for a medical provider
5. NEVER recommend specific doses, changes, or medical advice
6. End with a neutral statement about the data being self-reported

Respond with ONLY the summary paragraph, no JSON, no headers.`,
        messages: [
          {
            role: 'user',
            content: `Patient: ${name}\nMedication: ${drug}\n${profile?.drug_signature ? `Drug history: ${profile.drug_signature}\n` : ''}\nCheck-in history (${sorted.length} entries):\n${entryLines}\n${assessmentLines ? `\nAssessment history:\n${assessmentLines}` : ''}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text || 'Unable to generate summary.';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('PDF summary error:', error);
    return NextResponse.json({ summary: 'Unable to generate AI summary at this time.' });
  }
}
