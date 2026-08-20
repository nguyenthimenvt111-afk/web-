import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  editTelegramMessage,
  answerCallbackQuery,
  sendTelegramMessage,
} from '@/lib/telegram';

// ─────────────────────────────────────────────────────────
// POST /api/webhooks/telegram
// Handles Telegram Bot updates: callback_query + commands
// ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Verify secret token from Telegram webhook header
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const incomingSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (incomingSecret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // ── Handle inline button presses (Duyệt / Từ chối) ──
  if (body.callback_query) {
    await handleCallbackQuery(body.callback_query);
    return NextResponse.json({ ok: true });
  }

  // ── Handle text commands ──
  if (body.message?.text) {
    await handleCommand(body.message);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

// ─────────────────────────────────────────────────────────
// Handle button presses: approve:<id> or reject:<id>
// ─────────────────────────────────────────────────────────
async function handleCallbackQuery(callbackQuery: any) {
  const { id: queryId, data, message } = callbackQuery;

  if (!data) return;

  const [action, userId] = data.split(':');
  if (!userId || !['approve', 'reject'].includes(action)) return;

  const supabase = createAdminClient();

  // Fetch user info
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, display_name, status')
    .eq('id', userId)
    .single();

  if (error || !user) {
    await answerCallbackQuery(queryId, '❌ Không tìm thấy user!', true);
    return;
  }

  // Already processed
  if (user.status !== 'pending') {
    await answerCallbackQuery(
      queryId,
      `ℹ️ Tài khoản này đã được ${user.status === 'approved' ? 'duyệt' : 'từ chối'} rồi!`,
      true
    );
    return;
  }

  if (action === 'approve') {
    await supabase
      .from('users')
      .update({
        status: 'approved',
        role: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Update the Telegram message to show result
    const newText = [
      '✅ <b>Đã duyệt tài khoản!</b>',
      '',
      `👤 <b>Username:</b> @${user.username}`,
      `📧 <b>Email:</b> ${user.email}`,
      `🏷️ <b>Tên:</b> ${user.display_name || 'N/A'}`,
      '',
      '🟢 Trạng thái: <b>Approved</b>',
    ].join('\n');

    if (message?.message_id) {
      await editTelegramMessage(message.message_id, newText); // Remove buttons
    }

    await answerCallbackQuery(queryId, '✅ Đã duyệt thành công!');
  } else {
    // reject
    await supabase
      .from('users')
      .update({ status: 'rejected', role: 'pending' })
      .eq('id', userId);

    const newText = [
      '❌ <b>Đã từ chối tài khoản!</b>',
      '',
      `👤 <b>Username:</b> @${user.username}`,
      `📧 <b>Email:</b> ${user.email}`,
      '',
      '🔴 Trạng thái: <b>Rejected</b>',
    ].join('\n');

    if (message?.message_id) {
      await editTelegramMessage(message.message_id, newText);
    }

    await answerCallbackQuery(queryId, '❌ Đã từ chối!');
  }
}

// ─────────────────────────────────────────────────────────
// Handle text commands:
//   /auto on   — bật auto duyệt
//   /auto off  — tắt auto duyệt
//   /pending   — xem danh sách chờ duyệt
//   /status    — xem trạng thái hệ thống
// ─────────────────────────────────────────────────────────
async function handleCommand(message: any) {
  const text: string = message.text?.trim() ?? '';
  const supabase = createAdminClient();

  // /auto on | /auto off
  if (text.startsWith('/auto')) {
    const parts = text.split(' ');
    const subCmd = parts[1]?.toLowerCase();

    if (subCmd === 'on') {
      await supabase
        .from('settings')
        .upsert({ key: 'auto_approve', value: 'true' }, { onConflict: 'key' });

      await sendTelegramMessage(
        [
          '🤖 <b>Auto duyệt: BẬT ✅</b>',
          '',
          'Từ bây giờ, tài khoản mới sẽ được <b>tự động duyệt</b> ngay sau khi đăng ký.',
          '',
          '💡 Dùng <code>/auto off</code> để tắt.',
        ].join('\n')
      );
    } else if (subCmd === 'off') {
      await supabase
        .from('settings')
        .upsert({ key: 'auto_approve', value: 'false' }, { onConflict: 'key' });

      await sendTelegramMessage(
        [
          '🔒 <b>Auto duyệt: TẮT ❌</b>',
          '',
          'Tài khoản mới sẽ cần <b>admin duyệt thủ công</b>.',
          '',
          '💡 Dùng <code>/auto on</code> để bật lại.',
        ].join('\n')
      );
    } else {
      // Show current status
      const { data: setting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'auto_approve')
        .single();

      const isOn = setting?.value === 'true';
      const keyboard = {
        inline_keyboard: [
          [
            { text: isOn ? '✅ Auto Duyệt: BẬT' : '❌ Auto Duyệt: TẮT', callback_data: 'noop' },
          ],
          [
            { text: '🟢 Bật Auto Duyệt', callback_data: 'auto_on' },
            { text: '🔴 Tắt Auto Duyệt', callback_data: 'auto_off' },
          ],
        ],
      };

      await sendTelegramMessage(
        `⚙️ <b>Cài đặt Auto Duyệt</b>\n\nTrạng thái hiện tại: ${isOn ? '🟢 <b>BẬT</b>' : '🔴 <b>TẮT</b>'}`,
        keyboard
      );
    }
    return;
  }

  // /pending — xem danh sách chờ
  if (text === '/pending') {
    const { data: users, count } = await supabase
      .from('users')
      .select('username, email, created_at', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!count || count === 0) {
      await sendTelegramMessage('✅ <b>Không có tài khoản nào đang chờ duyệt!</b>');
      return;
    }

    const lines = [
      `⏳ <b>${count} tài khoản đang chờ duyệt:</b>`,
      '',
      ...(users || []).map(
        (u, i) => `${i + 1}. @${u.username} — ${u.email}`
      ),
      '',
      `🔗 Vào <b>Admin Panel</b> để duyệt.`,
    ];

    await sendTelegramMessage(lines.join('\n'));
    return;
  }

  // /xacthuc <userId> — duyệt xác thực khuôn mặt
  if (text.startsWith('/xacthuc ')) {
    const targetUserId = text.split(' ')[1]?.trim();
    if (!targetUserId) {
      await sendTelegramMessage('⚠️ Thiếu ID. Cú pháp: <code>/xacthuc [Mã_User_ID]</code>');
      return;
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', targetUserId)
      .select('username, display_name')
      .single();

    if (error || !updatedUser) {
      await sendTelegramMessage(`❌ <b>Lỗi:</b> Không tìm thấy user có ID <code>${targetUserId}</code>`);
    } else {
      // Gửi thông báo trực tiếp vào app cho người dùng
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'verified',
        data: { message: 'Tài khoản của bạn đã được duyệt và cấp Tích Xanh!' }
      });

      await sendTelegramMessage(`✅ <b>Thành công!</b>\n\nĐã cấp Tích Xanh (Xác thực Cấp 2) cho người dùng <b>@${updatedUser.username}</b>!`);
    }
    return;
  }

  // /status — tổng quan hệ thống
  if (text === '/status') {
    const [usersRes, postsRes, settingRes] = await Promise.all([
      supabase.from('users').select('status'),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('settings').select('value').eq('key', 'auto_approve').single(),
    ]);

    const pending = usersRes.data?.filter((u) => u.status === 'pending').length ?? 0;
    const approved = usersRes.data?.filter((u) => u.status === 'approved').length ?? 0;
    const autoOn = settingRes.data?.value === 'true';

    const msg = [
      '📊 <b>Trạng thái hệ thống MiniSocial</b>',
      '',
      `👥 Tổng users: <b>${(usersRes.data?.length ?? 0)}</b>`,
      `⏳ Chờ duyệt: <b>${pending}</b>`,
      `✅ Đã duyệt: <b>${approved}</b>`,
      `📝 Bài viết: <b>${postsRes.count ?? 0}</b>`,
      `🤖 Auto duyệt: <b>${autoOn ? '✅ BẬT' : '❌ TẮT'}</b>`,
    ].join('\n');

    await sendTelegramMessage(msg);
    return;
  }

  // /start — help menu
  if (text === '/start' || text === '/help') {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '⏳ Xem Chờ Duyệt', callback_data: 'cmd_pending' },
          { text: '📊 Trạng thái', callback_data: 'cmd_status' },
        ],
        [
          { text: '🟢 Bật Auto Duyệt', callback_data: 'auto_on' },
          { text: '🔴 Tắt Auto Duyệt', callback_data: 'auto_off' },
        ],
      ],
    };

    await sendTelegramMessage(
      [
        '🤖 <b>MiniSocial Admin Bot</b>',
        '',
        '📋 <b>Lệnh có thể dùng:</b>',
        '• /pending — Xem danh sách chờ duyệt',
        '• /status — Tổng quan hệ thống',
        '• /auto on — Bật auto duyệt',
        '• /auto off — Tắt auto duyệt',
        '',
        'Hoặc nhấn các nút bên dưới 👇',
      ].join('\n'),
      keyboard
    );
    return;
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/webhooks/telegram/setup
// Call once to register webhook URL with Telegram
// ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  // Simple auth check
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (token !== process.env.NEXTAUTH_SECRET?.slice(0, 8)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const host = request.headers.get('host') || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const webhookUrl = `${protocol}://${host}/api/webhooks/telegram`;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || '';

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/setWebhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: ['message', 'callback_query'],
      }),
    }
  );

  const data = await res.json();
  return NextResponse.json({ webhookUrl, result: data });
}
