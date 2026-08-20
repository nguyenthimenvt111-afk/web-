import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

// GET — Lấy danh sách ticket của user hiện tại
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      id, title, status, created_at,
      support_messages(id, is_admin, content, created_at)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — Tạo ticket mới
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content } = await request.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Thiếu tiêu đề hoặc nội dung' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const userId = session.user.id;
  const user = session.user as any;

  // Tạo ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .insert({ user_id: userId, title: title.trim(), status: 'open' })
    .select('id')
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Tạo ticket thất bại' }, { status: 500 });
  }

  // Tạo tin nhắn đầu tiên
  await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    is_admin: false,
    content: content.trim(),
  });

  // Báo Telegram cho Admin
  const msg = [
    '🆘 <b>YÊU CẦU HỖ TRỢ MỚI!</b>',
    '',
    `👤 <b>Người dùng:</b> @${user.username || 'unknown'}`,
    `📋 <b>Tiêu đề:</b> ${title.trim()}`,
    `💬 <b>Nội dung:</b> ${content.trim()}`,
    `🆔 <b>Ticket ID:</b> <code>${ticket.id}</code>`,
    '',
    '📝 Để trả lời, hãy dùng lệnh:',
    `<code>/reply ${ticket.id} [Câu trả lời của bạn]</code>`,
  ].join('\n');

  sendTelegramMessage(msg).catch(() => {});

  return NextResponse.json({ data: ticket }, { status: 201 });
}
