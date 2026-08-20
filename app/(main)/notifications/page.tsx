import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { Bell, CheckCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Thông báo — MiniSocial',
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const supabase = createAdminClient();

  // 1. Lấy thông báo
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // 2. Đánh dấu tất cả là đã đọc
  if (notifications && notifications.some(n => !n.is_read)) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
  }

  // Phân loại icon theo type
  const getIcon = (type: string) => {
    switch (type) {
      case 'verified':
        return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-green-400" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getMessageText = (notif: any) => {
    if (notif.type === 'verified') return notif.data?.message || 'Tài khoản của bạn đã được cấp Tích Xanh!';
    if (notif.type === 'message') return 'Bạn có một tin nhắn mới!';
    if (notif.type === 'approved') return 'Tài khoản của bạn đã được admin phê duyệt.';
    return 'Bạn có một thông báo mới';
  };

  const getLink = (notif: any) => {
    if (notif.type === 'message' && notif.data?.sender_id) return `/chat?user=${notif.data.sender_id}`;
    if (notif.type === 'verified') return `/profile/${session.user?.name}`;
    return '#';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Thông báo</h1>
      
      {!notifications || notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium mb-1">Chưa có thông báo</p>
          <p className="text-slate-500 text-sm">Các thông báo về xác thực và tin nhắn sẽ hiển thị ở đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Link 
              key={notif.id} 
              href={getLink(notif)}
              className="card flex items-start gap-4 hover:bg-slate-800/50 transition-colors p-4 block"
              style={{
                background: notif.is_read ? 'var(--card-bg)' : 'rgba(99, 102, 241, 0.05)',
                border: notif.is_read ? '1px solid var(--card-border)' : '1px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              <div className="mt-1 p-2 rounded-full bg-slate-800 border border-slate-700">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notif.is_read ? 'text-slate-300' : 'text-white font-medium'}`}>
                  {getMessageText(notif)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatRelativeTime(notif.created_at)}
                </p>
              </div>
              {!notif.is_read && (
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
