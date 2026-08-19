import { auth } from '@/lib/auth';
import ChatRoom from '@/components/chat/ChatRoom';

export const metadata = {
  title: 'Trò chuyện — MiniSocial',
};

export default async function ChatRoomPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const session = await auth();

  return (
    <div style={{ height: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column' }}>
      <ChatRoom
        conversationId={params.conversationId}
        currentUser={{
          id: (session?.user?.id as string) || '',
          name: session?.user?.name || '',
          username: ((session?.user as any)?.username as string) || '',
        }}
      />
    </div>
  );
}
