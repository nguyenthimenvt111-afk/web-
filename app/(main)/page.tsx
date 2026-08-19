import { auth } from '@/lib/auth';
import PostFeed from '@/components/posts/PostFeed';
import PostForm from '@/components/posts/PostForm';

export const metadata = {
  title: 'Bảng tin — MiniSocial',
};

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Bảng tin</h1>
      <PostForm userId={session?.user?.id || ''} />
      <PostFeed />
    </div>
  );
}
