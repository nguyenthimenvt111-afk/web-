'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Home,
  MessageCircle,
  Bell,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarUser {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string;
  role?: string;
  avatar_url?: string | null;
}

export default function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const [unreadMsgs, setUnreadMsgs] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Lấy số lượng thông báo chưa đọc khi vừa mở web
    const fetchUnread = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('type, is_read')
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (data) {
        setUnreadMsgs(data.some(n => n.type === 'message'));
        setUnreadNotifs(data.some(n => n.type !== 'message'));
      }
    };
    fetchUnread();

    // Lắng nghe Realtime khi có thông báo mới (tin nhắn hoặc xác thực)
    const channel = supabase
      .channel('sidebar_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.type === 'message') {
            if (!pathname.startsWith('/chat')) setUnreadMsgs(true);
          } else {
            if (!pathname.startsWith('/notifications')) setUnreadNotifs(true);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchUnread()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.id, pathname]);

  // Xóa chấm đỏ khi truy cập đúng trang
  useEffect(() => {
    if (pathname.startsWith('/chat')) setUnreadMsgs(false);
    if (pathname.startsWith('/notifications')) setUnreadNotifs(false);
  }, [pathname]);

  const navItems = [
    { href: '/', label: 'Trang chủ', icon: Home, exact: true },
    { href: '/chat', label: 'Tin nhắn', icon: MessageCircle, hasDot: unreadMsgs },
    { href: '/notifications', label: 'Thông báo', icon: Bell, hasDot: unreadNotifs },
    { href: `/profile/${user.username}`, label: 'Trang cá nhân', icon: User },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Sidebar (ẩn trên mobile) ── */}
      <aside
        className="fixed left-0 top-0 h-full w-64 flex-col z-40 hidden md:flex"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(99, 102, 241, 0.12)',
        }}
      >
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: 'rgba(79, 70, 229, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: '#818cf8' }} />
            </div>
            <span className="text-xl font-bold text-white">MiniSocial</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href, item.exact) ? 'sidebar-item-active relative' : 'sidebar-item relative'}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.hasDot && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-[rgb(15,23,42)]"></span>
                  </span>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {user.role === 'admin' && (
            <>
              <div className="my-3" style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)' }} />
              <Link
                href="/admin"
                className={isActive('/admin') ? 'sidebar-item-active' : 'sidebar-item'}
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* User info */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(30, 41, 59, 0.4)' }}
          >
            <div
              className="avatar w-9 h-9 text-sm"
              style={{ width: '2.25rem', height: '2.25rem', fontSize: '0.875rem' }}
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">@{user.username}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar (ẩn trên desktop) ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around"
        style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(99, 102, 241, 0.12)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2.5 px-3 transition-colors relative"
              style={{ color: active ? '#818cf8' : '#64748b' }}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.hasDot && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-[rgb(15,23,42)]"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        {user.role === 'admin' && (
          <Link
            href="/admin"
            className="flex flex-col items-center gap-0.5 py-2.5 px-3 transition-colors"
            style={{ color: isActive('/admin') ? '#818cf8' : '#64748b' }}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Admin</span>
          </Link>
        )}
      </nav>
    </>
  );
}
