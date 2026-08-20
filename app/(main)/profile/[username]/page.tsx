import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import ProfileClient from '@/components/profile/ProfileClient';

interface ProfilePageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: ProfilePageProps) {
  return {
    title: `@${params.username} — MiniSocial`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  const currentUsername = (session?.user as any)?.username || '';

  // Fetch profile từ API
  const res = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/profile/${params.username}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    notFound();
  }

  const { data: profile } = await res.json();

  return (
    <ProfileClient
      profile={profile}
      isOwner={currentUsername === params.username}
      currentUserId={session?.user?.id || ''}
    />
  );
}
