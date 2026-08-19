import Link from 'next/link';
import { Clock, CheckCircle, Bell } from 'lucide-react';

export const metadata = {
  title: 'Chờ duyệt tài khoản — MiniSocial',
};

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="card">
          {/* Status icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-6"
               style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Clock className="w-10 h-10 text-amber-400 animate-pulse-soft" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">Đang chờ duyệt</h1>

          <p className="text-slate-400 mb-8 leading-relaxed">
            Tài khoản của bạn đã được gửi đến admin để xem xét.
            Vui lòng đợi trong khi chúng tôi kiểm tra thông tin của bạn.
          </p>

          {/* Progress steps */}
          <div className="space-y-3 text-left mb-8">
            <div className="flex items-center gap-3 p-3 rounded-xl"
                 style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">Tài khoản đã được tạo thành công</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl"
                 style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
              <Bell className="w-5 h-5 flex-shrink-0" style={{ color: '#818cf8' }} />
              <span className="text-sm text-slate-300">Admin đã nhận được thông báo qua Telegram</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl"
                 style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">Đang chờ admin duyệt tài khoản...</span>
            </div>
          </div>

          <Link
            href="/login"
            className="btn-secondary w-full inline-flex items-center justify-center"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
