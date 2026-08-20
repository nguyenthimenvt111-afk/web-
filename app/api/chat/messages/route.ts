import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  const limit = parseInt(searchParams.get('limit') || '50');
  const before = searchParams.get('before'); // cursor for pagination

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify user is a participant
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', session?.user?.id || '')
    .single();

  if (!participant) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let query = supabase
    .from('messages')
    .select(`
      id, content, created_at, is_deleted,
      sender:users!sender_id(id, username, display_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Reverse to show oldest first in UI
  return NextResponse.json({ data: (data || []).reverse() });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { conversation_id, content } = body;

  if (!conversation_id || !content?.trim()) {
    return NextResponse.json(
      { error: 'conversation_id and content are required' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Verify participant before sending
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversation_id)
    .eq('user_id', session?.user?.id || '')
    .single();

  if (!participant) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      sender_id: session?.user?.id || '',
      content: content.trim(),
    })
    .select(`
      id, content, created_at, is_deleted,
      sender:users!sender_id(id, username, display_name, avatar_url)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // --- Tạo thông báo cho người nhận (để hiển thị dấu ! đỏ) ---
  const { data: otherParticipants } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversation_id)
    .neq('user_id', session?.user?.id || '');

  if (otherParticipants && otherParticipants.length > 0) {
    const notifications = otherParticipants.map(p => ({
      user_id: p.user_id,
      type: 'message',
      data: { conversation_id, sender_id: session?.user?.id || '' }
    }));
    await supabase.from('notifications').insert(notifications);
  }

  // Supabase Realtime will automatically broadcast the INSERT event
  return NextResponse.json({ data }, { status: 201 });
}
