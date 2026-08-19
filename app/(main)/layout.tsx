import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect('/login');

  const user = session.user as any;

  if (user.status === 'pending') redirect('/pending');
  if (user.status === 'rejected' || user.status === 'banned') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} />
      {/* Desktop: margin-left cho Sidebar cố định. Mobile: không có margin */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Topbar user={user} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
