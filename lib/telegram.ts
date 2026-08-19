const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// ────────────────────────────────────────
// Core: sendMessage with optional keyboard
// ────────────────────────────────────────
interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export async function sendTelegramMessage(
  message: string,
  replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] }
): Promise<number | null> {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || !chatId) {
    console.warn('[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID');
    return null;
  }

  try {
    const res = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        ...(replyMarkup && { reply_markup: replyMarkup }),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Telegram] API Error:', err);
      return null;
    }

    const data = await res.json();
    // Return message_id so we can edit it later
    return data.result?.message_id ?? null;
  } catch (error) {
    console.error('[Telegram] Network error:', error);
    return null;
  }
}

// Edit an existing message (to update buttons after action)
export async function editTelegramMessage(
  messageId: number,
  newText: string,
  replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] }
): Promise<void> {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;

  await fetch(`${TELEGRAM_API_URL}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: newText,
      parse_mode: 'HTML',
      ...(replyMarkup && { reply_markup: replyMarkup }),
    }),
  });
}

// Answer a callback query (dismisses loading spinner on button)
export async function answerCallbackQuery(
  callbackQueryId: string,
  text: string,
  showAlert = false
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    }),
  });
}

// ────────────────────────────────────────
// Notification: New user registration
// Sends message with ✅ Duyệt / ❌ Từ chối buttons
// ────────────────────────────────────────
export async function notifyNewUserRegistration(user: {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  autoApproved?: boolean;
}): Promise<void> {
  if (user.autoApproved) {
    const message = [
      '🤖 <b>Tài khoản tự động được duyệt!</b>',
      '',
      `👤 <b>Username:</b> @${user.username}`,
      `📧 <b>Email:</b> ${user.email}`,
      `🏷️ <b>Tên:</b> ${user.display_name || 'Chưa cập nhật'}`,
      '',
      '🟢 Trạng thái: <b>Approved</b> (Auto)',
    ].join('\n');
    await sendTelegramMessage(message);
    return;
  }

  const message = [
    '🆕 <b>Người dùng mới đăng ký!</b>',
    '',
    `👤 <b>Username:</b> @${user.username}`,
    `📧 <b>Email:</b> ${user.email}`,
    `🏷️ <b>Tên:</b> ${user.display_name || 'Chưa cập nhật'}`,
    '',
    '⏳ Tài khoản đang <b>chờ duyệt</b>.',
  ].join('\n');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Duyệt', callback_data: `approve:${user.id}` },
        { text: '❌ Từ chối', callback_data: `reject:${user.id}` },
      ],
    ],
  };

  await sendTelegramMessage(message, keyboard);
}

// ────────────────────────────────────────
// Register webhook with Telegram
// Call once: GET /api/webhooks/telegram/setup
// ────────────────────────────────────────
export async function registerWebhook(webhookUrl: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token) return false;

  const res = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret || '',
      allowed_updates: ['message', 'callback_query'],
    }),
  });

  const data = await res.json();
  console.log('[Telegram] Webhook registration:', data);
  return data.ok;
}
