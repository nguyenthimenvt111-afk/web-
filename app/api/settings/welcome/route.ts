import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('settings')
    .select('*')
    .in('key', ['welcome_title', 'welcome_content', 'welcome_enabled']);

  const settings = {
    title: data?.find((s) => s.key === 'welcome_title')?.value || 'Chào mừng đến với MiniSocial',
    content: data?.find((s) => s.key === 'welcome_content')?.value || 'Chúc bạn có những giây phút vui vẻ!',
    enabled: data?.find((s) => s.key === 'welcome_enabled')?.value === 'true',
  };

  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { title, content, enabled } = await request.json();
  const supabase = createAdminClient();

  await Promise.all([
    supabase.from('settings').upsert({ key: 'welcome_title', value: title }, { onConflict: 'key' }),
    supabase.from('settings').upsert({ key: 'welcome_content', value: content }, { onConflict: 'key' }),
    supabase.from('settings').upsert({ key: 'welcome_enabled', value: enabled ? 'true' : 'false' }, { onConflict: 'key' }),
  ]);

  return NextResponse.json({ success: true });
}
