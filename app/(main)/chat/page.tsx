import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import ConversationList from '@/components/chat/ConversationList';

export const metadata = {
  title: 'Tin nhắn — MiniSocial',
};

export default async function ChatPage() {
  const session = await auth();
  const supabase = createAdminClient();

  // Get all approved users to start new chats
  const { data: users } = await supabase
    .from('users')
    .select('id, username, display_name, avatar_url')
    .eq('status', 'approved')
    .neq('id', session?.user?.id || '')
    .order('display_name');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Tin nhắn</h1>
      <ConversationList users={users || []} />
    </div>
  );
}
