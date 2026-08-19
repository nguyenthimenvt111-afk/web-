import { createAdminClient } from '@/lib/supabase/server';
import UserApprovalTable from '@/components/admin/UserApprovalTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Duyệt tài khoản — Admin MiniSocial',
};

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: pendingUsers } = await supabase
    .from('users')
    .select('id, email, username, display_name, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Duyệt tài khoản</h1>
        <p className="text-slate-400 mt-1">
          {pendingUsers?.length || 0} tài khoản đang chờ duyệt
        </p>
      </div>
      <UserApprovalTable initialUsers={pendingUsers || []} />
    </div>
  );
}
