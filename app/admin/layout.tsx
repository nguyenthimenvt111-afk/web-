import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import WelcomePopup from '@/components/layout/WelcomePopup';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any).role !== 'admin') {
    redirect('/');
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen flex">
      <WelcomePopup />
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Topbar user={user} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
