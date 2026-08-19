'use client';

import { signOut } from 'next-auth/react';
import { LogOut, Sparkles } from 'lucide-react';

interface TopbarUser {
  name?: string | null;
  email?: string | null;
  username?: string;
  role?: string;
}

export default function Topbar({ user }: { user: TopbarUser }) {
  return (
    <header
      className="sticky top-0 z-30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      }}
    >
      {/* Mobile: hiện logo nhỏ. Desktop: ẩn (vì đã có Sidebar) */}
      <div className="flex items-center gap-2 md:hidden">
        <Sparkles className="w-5 h-5" style={{ color: '#818cf8' }} />
        <span className="text-lg font-bold text-white">MiniSocial</span>
      </div>
      <div className="hidden md:block" />

      <div className="flex items-center gap-3 md:gap-4">
        {user.role === 'admin' && (
          <span className="badge-admin">Admin</span>
        )}
        <button
          id="topbar-logout"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
