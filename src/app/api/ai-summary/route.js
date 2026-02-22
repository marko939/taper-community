import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get('threadId');

  if (!threadId) {
    return NextResponse.json({ error: 'threadId required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch thread + replies
  const { data: thread } = await supabase
    .from('threads')
    .select('title, body, tags')
    .eq('id', threadId)
    .single();

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const { data: replies } = await supabase
    .from('replies')
    .select('body')
    .eq('thread_id', threadId)
    .order('helpful_count', { ascending: false })
    .limit(5);

  const replyContext = (replies || []).map((r) => r.body).join('\n---\n');

  // Call Claude API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      summary: 'AI summary unavailable — API key not configured.',
      guidelines: null,
      similarTopics: [],
      clinicianPrompt: 'Always discuss medication changes with your prescriber.',
    });
  }

  try {
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
        system: `You are a clinical context assistant for a psychiatric medication tapering peer support forum. Your role:
1. Provide relevant context from Maudsley Deprescribing Guidelines and Ashton Manual
2. Suggest similar topics the user might find helpful
3. Always include a prompt to consult their clinician
4. NEVER give specific dose advice — never suggest a specific dose, dose change, or taper schedule
5. NEVER recommend stopping or starting any medication
6. Keep responses concise and supportive

Respond in JSON format:
{
  "summary": "Brief context about the topic being discussed",
  "guidelines": "Relevant guidance from clinical literature (Maudsley/Ashton) without specific doses",
  "similarTopics": ["topic1", "topic2", "topic3"],
  "clinicianPrompt": "A supportive reminder to discuss with their prescriber"
}`,
        messages: [
          {
            role: 'user',
            content: `Thread title: ${thread.title}\n\nThread body: ${thread.body}\n\nTop replies:\n${replyContext}\n\nTags: ${(thread.tags || []).join(', ')}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        summary: text,
        guidelines: null,
        similarTopics: [],
        clinicianPrompt: 'Always discuss medication changes with your prescriber.',
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({
      summary: 'Unable to generate AI summary at this time.',
      guidelines: null,
      similarTopics: [],
      clinicianPrompt: 'Always discuss medication changes with your prescriber.',
    });
  }
}
