import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { type, targetId, voteType, userId } = await request.json();

  if (!type || !targetId || !userId) {
    return NextResponse.json({ error: 'type, targetId, and userId are required' }, { status: 400 });
  }

  if (!['thread', 'reply', 'helpful'].includes(type)) {
    return NextResponse.json({ error: 'type must be "thread", "reply", or "helpful"' }, { status: 400 });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    if (type === 'helpful') {
      // Helpful vote on a reply
      const { data: existing } = await supabase
        .from('helpful_votes')
        .select('user_id')
        .eq('user_id', userId)
        .eq('reply_id', targetId)
        .maybeSingle();

      let action;
      if (existing) {
        await supabase.from('helpful_votes').delete().eq('user_id', userId).eq('reply_id', targetId);
        action = 'removed';
      } else {
        const { error: insertErr } = await supabase
          .from('helpful_votes')
          .insert({ user_id: userId, reply_id: targetId });
        if (insertErr) throw insertErr;
        action = 'added';
      }

      // Count actual helpful votes and update
      const { count } = await supabase
        .from('helpful_votes')
        .select('*', { count: 'exact', head: true })
        .eq('reply_id', targetId);

      const newScore = count ?? 0;
      await supabase.from('replies').update({ helpful_count: newScore }).eq('id', targetId);

      return NextResponse.json({ action, score: newScore });
    }

    // Thread or reply vote
    const voteTable = type === 'thread' ? 'thread_votes' : 'reply_votes';
    const idColumn = type === 'thread' ? 'thread_id' : 'reply_id';
    const scoreTable = type === 'thread' ? 'threads' : 'replies';

    // Check if user already voted
    const { data: existing } = await supabase
      .from(voteTable)
      .select('vote_type')
      .eq('user_id', userId)
      .eq(idColumn, targetId)
      .maybeSingle();

    let action;

    if (existing) {
      // Already voted — toggle off (unlike)
      await supabase.from(voteTable).delete().eq('user_id', userId).eq(idColumn, targetId);
      action = 'removed';
    } else {
      // New vote — insert
      const { error: insertErr } = await supabase
        .from(voteTable)
        .insert({ user_id: userId, [idColumn]: targetId, vote_type: voteType || 'up' });
      if (insertErr) throw insertErr;
      action = 'added';
    }

    // Count actual votes and update score — always accurate
    const { count } = await supabase
      .from(voteTable)
      .select('*', { count: 'exact', head: true })
      .eq(idColumn, targetId);

    const newScore = count ?? 0;

    await supabase
      .from(scoreTable)
      .update({ vote_score: newScore })
      .eq('id', targetId);

    return NextResponse.json({ action, score: newScore });
  } catch (err) {
    console.error('[api/vote] error:', err);
    return NextResponse.json({ error: err.message || 'Vote failed' }, { status: 500 });
  }
}
