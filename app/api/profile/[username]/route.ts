import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

// GET /api/profile/[username] — Lấy thông tin hồ sơ
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const supabase = createAdminClient();
  const { username } = params;

  // Lấy thông tin user
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, display_name, avatar_url, bio, role, status, is_verified, created_at')
    .eq('username', username)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
  }

  // Đếm số bài viết
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('is_visible', true);

  return NextResponse.json({
    data: {
      ...user,
      posts_count: postsCount || 0,
    },
  });
}

// PATCH /api/profile/[username] — Cập nhật hồ sơ (chỉ chủ tài khoản)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { username } = params;

  // Chỉ được sửa hồ sơ của chính mình
  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (!targetUser || targetUser.id !== (session?.user?.id || '')) {
    return NextResponse.json({ error: 'Không có quyền chỉnh sửa' }, { status: 403 });
  }

  const body = await request.json();
  const { display_name, bio } = body;

  // Validate
  if (display_name !== undefined && (typeof display_name !== 'string' || display_name.trim().length < 1)) {
    return NextResponse.json({ error: 'Tên hiển thị không hợp lệ' }, { status: 400 });
  }
  if (bio !== undefined && typeof bio === 'string' && bio.length > 200) {
    return NextResponse.json({ error: 'Bio không được vượt quá 200 ký tự' }, { status: 400 });
  }

  const updateData: Record<string, string> = {};
  if (display_name !== undefined) updateData.display_name = display_name.trim();
  if (bio !== undefined) updateData.bio = bio.trim();

  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', targetUser.id)
    .select('id, username, display_name, avatar_url, bio, role, status, created_at')
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }

  return NextResponse.json({ data: updated });
}
