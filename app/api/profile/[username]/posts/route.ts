import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

// GET /api/profile/[username]/posts — Lấy bài viết của một user
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  const session = await auth();
  const currentUserId = session?.user?.id || '';

  const supabase = createAdminClient();

  // Lấy ID user từ username
  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', params.username)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
  }

  // Lấy bài viết của user đó
  const { data: posts, count, error } = await supabase
    .from('posts')
    .select(
      `id, content, image_url, likes_count, comments_count, created_at,
       author:users!author_id(id, username, display_name, avatar_url)`,
      { count: 'exact' }
    )
    .eq('author_id', targetUser.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Kiểm tra user hiện tại đã like bài nào chưa
  let likedPostIds: string[] = [];
  if (currentUserId && posts && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId)
      .in('post_id', postIds);
    likedPostIds = (likes || []).map((l) => l.post_id);
  }

  const enrichedPosts = (posts || []).map((post) => ({
    ...post,
    user_liked: likedPostIds.includes(post.id),
  }));

  return NextResponse.json({
    data: enrichedPosts,
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  });
}
