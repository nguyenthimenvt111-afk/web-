import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

type ApproveAction = 'approve' | 'reject' | 'ban';

const STATUS_MAP: Record<ApproveAction, string> = {
  approve: 'approved',
  reject: 'rejected',
  ban: 'banned',
};

const ROLE_MAP: Record<ApproveAction, string> = {
  approve: 'approved',
  reject: 'pending',
  ban: 'pending',
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  // Only admin can approve/reject accounts
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { action } = body as { action: string };

  if (!['approve', 'reject', 'ban'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const approveAction = action as ApproveAction;
  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from('users')
    .update({
      status: STATUS_MAP[approveAction],
      role: ROLE_MAP[approveAction],
      approved_by: approveAction === 'approve' ? (session?.user?.id || '') : null,
      approved_at:
        approveAction === 'approve' ? new Date().toISOString() : null,
    })
    .eq('id', params.id)
    .select('username, email')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify Telegram about the action
  const actionLabels: Record<ApproveAction, string> = {
    approve: '✅ đã <b>duyệt</b>',
    reject: '❌ đã <b>từ chối</b>',
    ban: '🚫 đã <b>cấm</b>',
  };

  const msg = `Admin ${actionLabels[approveAction]} tài khoản @${user.username} (${user.email})`;
  sendTelegramMessage(msg).catch(console.error);

  return NextResponse.json({
    data: { success: true, action, user },
  });
}
