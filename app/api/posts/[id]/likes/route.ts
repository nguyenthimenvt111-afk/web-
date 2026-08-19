import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const userId = session?.user?.id || '';
  const postId = params.id;

  // Toggle like: check if already liked
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();

  if (existing) {
    // Unlike
    await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId);
    await supabase.rpc('decrement_likes_count', { post_id: postId });
    return NextResponse.json({ data: { liked: false } });
  } else {
    // Like
    await supabase.from('likes').insert({ user_id: userId, post_id: postId });
    await supabase.rpc('increment_likes_count', { post_id: postId });
    return NextResponse.json({ data: { liked: true } });
  }
}
