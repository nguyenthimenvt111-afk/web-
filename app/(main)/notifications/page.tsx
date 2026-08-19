import { Bell } from 'lucide-react';

export const metadata = {
  title: 'Thông báo — MiniSocial',
};

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Thông báo</h1>
      <div className="card text-center py-16">
        <Bell className="w-14 h-14 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg font-medium mb-1">Chưa có thông báo</p>
        <p className="text-slate-500 text-sm">Các thông báo về lượt thích và bình luận sẽ hiển thị ở đây.</p>
      </div>
    </div>
  );
}
