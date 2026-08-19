import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { createCommentSchema } from '@/lib/validations/post';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, content, created_at,
      author:users!author_id(id, username, display_name, avatar_url)
    `)
    .eq('post_id', params.id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if ((session.user as any).status !== 'approved') {
    return NextResponse.json({ error: 'Tài khoản chưa được duyệt' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: params.id,
      author_id: session?.user?.id || '',
      content: parsed.data.content,
    })
    .select(`
      id, content, created_at,
      author:users!author_id(id, username, display_name, avatar_url)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment comments_count via DB function
  await supabase.rpc('increment_comments_count', { post_id: params.id });

  return NextResponse.json({ data }, { status: 201 });
}
