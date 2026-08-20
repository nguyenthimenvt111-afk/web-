import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

// POST /api/support/reply — Admin trả lời ticket qua Telegram bot
// Được gọi từ nội bộ trong Telegram webhook handler
export async function POST(request: NextRequest) {
  // Xác thực nội bộ bằng secret
  const authHeader = request.headers.get('x-internal-secret');
  if (authHeader !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ticket_id, content } = await request.json();
  if (!ticket_id || !content?.trim()) {
    return NextResponse.json({ error: 'Thiếu ticket_id hoặc content' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Kiểm tra ticket tồn tại
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id, user_id, title')
    .eq('id', ticket_id)
    .single();

  if (!ticket) {
    return NextResponse.json({ error: `Không tìm thấy ticket ${ticket_id}` }, { status: 404 });
  }

  // Lưu tin nhắn trả lời từ admin
  await supabase.from('support_messages').insert({
    ticket_id,
    is_admin: true,
    content: content.trim(),
  });

  // Cập nhật trạng thái ticket thành "answered"
  await supabase
    .from('support_tickets')
    .update({ status: 'answered' })
    .eq('id', ticket_id);

  // Tạo thông báo trong app cho user
  await supabase.from('notifications').insert({
    user_id: ticket.user_id,
    type: 'support_reply',
    data: { ticket_id, message: `Admin đã trả lời yêu cầu hỗ trợ "${ticket.title}" của bạn!` },
    is_read: false,
  });

  return NextResponse.json({ success: true });
}
