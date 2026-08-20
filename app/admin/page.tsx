import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { Users, FileText, ShieldCheck, Clock, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard — MiniSocial',
};

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [usersRes, postsRes] = await Promise.all([
    supabase.from('users').select('status'),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
  ]);

  const pendingCount = usersRes.data?.filter((u) => u.status === 'pending').length || 0;
  const approvedCount = usersRes.data?.filter((u) => u.status === 'approved').length || 0;
  const totalPosts = postsRes.count || 0;

  const stats = [
    {
      label: 'Chờ duyệt',
      value: pendingCount,
      icon: Clock,
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    {
      label: 'Đã duyệt',
      value: approvedCount,
      icon: ShieldCheck,
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    {
      label: 'Bài viết',
      value: totalPosts,
      icon: FileText,
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.2)',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Quản lý hệ thống MiniSocial</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-6"
            style={{ borderColor: stat.border, borderWidth: '1px', borderStyle: 'solid' }}
          >
            <div
              className="inline-flex p-3 rounded-xl mb-4"
              style={{ background: stat.bg }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="card-hover group block">
          <Users className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" style={{ color: '#818cf8' }} />
          <h2 className="text-lg font-semibold text-white mb-1">Duyệt tài khoản</h2>
          <p className="text-slate-400 text-sm">
            {pendingCount > 0 ? (
              <span className="text-amber-400 font-medium">{pendingCount} tài khoản đang chờ</span>
            ) : (
              'Không có tài khoản nào đang chờ'
            )}
          </p>
        </Link>

        <Link href="/admin/settings" className="card-hover group block">
          <Settings className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" style={{ color: '#f472b6' }} />
          <h2 className="text-lg font-semibold text-white mb-1">Cài đặt Hệ thống</h2>
          <p className="text-slate-400 text-sm">Chỉnh sửa thông báo chào mừng (Popup) và các cấu hình khác</p>
        </Link>
      </div>
    </div>
  );
}
