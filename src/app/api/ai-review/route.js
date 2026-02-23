import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ review: 'AI review unavailable — API key not configured.' });
  }

  try {
    const { entries, assessments, profile, dataSummary } = await request.json();

    const sorted = [...(entries || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    const drug = profile?.drug || 'their medication';
    const name = profile?.display_name || 'The patient';

    // Build compact check-in history
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

    // Calculate key metrics
    const doses = sorted.filter((e) => e.dose_numeric).map((e) => e.dose_numeric);
    const firstDose = doses[0];
    const lastDose = doses[doses.length - 1];
    const moods = sorted.map((e) => e.mood_score).filter(Boolean);
    const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null;
    const recentMoods = moods.slice(-5);
    const earlyMoods = moods.slice(0, 5);

    const metricsBlock = [
      firstDose ? `Starting dose: ${firstDose}mg` : null,
      lastDose ? `Current dose: ${lastDose}mg` : null,
      firstDose && lastDose && firstDose > lastDose ? `Dose reduction: ${Math.round(((firstDose - lastDose) / firstDose) * 100)}%` : null,
      avgMood ? `Average mood: ${avgMood}/10` : null,
      earlyMoods.length >= 3 ? `Early mood trend (first 5): ${earlyMoods.join(', ')}` : null,
      recentMoods.length >= 3 ? `Recent mood trend (last 5): ${recentMoods.join(', ')}` : null,
      `Total check-ins: ${sorted.length}`,
      sorted.length >= 2 ? `Tracking period: ${new Date(sorted[0].date).toLocaleDateString()} to ${new Date(sorted[sorted.length - 1].date).toLocaleDateString()}` : null,
    ].filter(Boolean).join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: `You are writing a clinical review paragraph for a psychiatrist or prescriber reviewing a patient's medication taper progress. This review accompanies a detailed data report that includes dose/mood charts, assessment scores, and journal entries.

Write ONE detailed paragraph (5-8 sentences) that provides a clinical overview of the patient's taper journey. Your review should:

1. Summarize the taper trajectory — starting dose, current dose, percentage reduction, and duration
2. Analyze mood trends — whether mood has been stable, improving, or declining during the taper
3. Identify the most frequently reported symptoms and any concerning patterns
4. Interpret PHQ-9 and GAD-7 scores if available, noting any severity level changes
5. Note any correlation between dose changes and mood/symptom changes
6. Highlight any red flags or areas that may warrant clinical attention
7. Use professional clinical language appropriate for a medical provider

IMPORTANT:
- NEVER recommend specific doses, medication changes, or treatment decisions
- NEVER diagnose or suggest diagnoses
- Present observations neutrally — let the clinician draw conclusions
- End by noting that all data is self-reported via TaperCommunity

Respond with ONLY the review paragraph, no JSON, no headers, no bullet points.`,
        messages: [
          {
            role: 'user',
            content: `Patient: ${name}\nMedication: ${drug}\n${profile?.drug_signature ? `Drug history: ${profile.drug_signature}\n` : ''}\nKey metrics:\n${metricsBlock}\n\nCheck-in history (${sorted.length} entries):\n${entryLines}\n${assessmentLines ? `\nAssessment history:\n${assessmentLines}` : ''}${dataSummary ? `\n\nData report summary:\n${dataSummary}` : ''}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const review = data.content?.[0]?.text || 'Unable to generate review.';

    return NextResponse.json({ review });
  } catch (error) {
    console.error('AI review error:', error);
    return NextResponse.json({ review: 'Unable to generate AI clinical review at this time.' });
  }
}
