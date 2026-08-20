import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const supabase = createAdminClient();

  // Lấy thông tin user
  const { data: user } = await supabase
    .from('users')
    .select('id, username, display_name, is_verified')
    .eq('id', userId)
    .single();

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Gửi thông báo tới Telegram Bot cho Admin
  if (!user.is_verified) {
    const msg = [
      '👤 <b>YÊU CẦU XÁC THỰC KHUÔN MẶT</b>',
      '',
      `🏷️ <b>Tên:</b> ${user.display_name || user.username}`,
      `👤 <b>Username:</b> @${user.username}`,
      `🆔 <b>User ID:</b> <code>${user.id}</code>`,
      '',
      '👉 Người dùng vừa hoàn thành quét mặt trên Siziin.',
      'Để duyệt cấp Tích Xanh (Cấp 2) cho user này, hãy copy và gõ lệnh sau:',
      '',
      `<code>/xacthuc ${user.id}</code>`
    ].join('\n');
    
    // Gửi ngầm (không await để chuyển hướng cho nhanh)
    sendTelegramMessage(msg).catch(() => {});
  }

  // Chuyển hướng người dùng về trang cá nhân của họ kèm theo biến "pending=true"
  return NextResponse.redirect(new URL(`/profile/${user.username}?verify=pending`, request.url));
}
