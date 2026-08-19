import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { createPostSchema } from '@/lib/validations/post';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();
  const userId = session?.user?.id || '';

  // Fetch posts with author info
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id, content, image_url, likes_count, comments_count, created_at, updated_at, author_id, is_visible,
      author:users!author_id(id, username, display_name, avatar_url)
    `)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get user's likes for these posts
  const postIds = (posts || []).map((p) => p.id);

  let likedPostIds = new Set<string>();
  if (postIds.length > 0) {
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);

    likedPostIds = new Set((likes || []).map((l) => l.post_id));
  }

  const enrichedPosts = (posts || []).map((post) => ({
    ...post,
    user_liked: likedPostIds.has(post.id),
  }));

  return NextResponse.json({
    data: enrichedPosts,
    page,
    limit,
    hasMore: enrichedPosts.length === limit,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if ((session.user as any).status !== 'approved') {
    return NextResponse.json({ error: 'Tài khoản chưa được duyệt' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: session?.user?.id || '',
      content: parsed.data.content,
      image_url: parsed.data.image_url || null,
    })
    .select(`
      id, content, image_url, likes_count, comments_count, created_at,
      author:users!author_id(id, username, display_name, avatar_url)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
