'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { MessageCircle, Search, Loader2 } from 'lucide-react';

type UserPreview = Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;

interface ConversationListProps {
  users: UserPreview[];
}

export default function ConversationList({ users }: ConversationListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [startingWith, setStartingWith] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const startConversation = async (targetUserId: string) => {
    setStartingWith(targetUserId);
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId }),
      });
      const data = await res.json();
      if (data.data?.conversation_id) {
        router.push(`/chat/${data.data.conversation_id}`);
      }
    } finally {
      setStartingWith(null);
    }
  };

  return (
    <div className="card">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          id="user-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm người dùng..."
          className="input-field pl-10 py-2.5"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">
          {search ? 'Không tìm thấy người dùng' : 'Không có người dùng nào để chat'}
        </p>
      ) : (
        <div className="space-y-1">
          {filtered.map((user) => (
            <button
              key={user.id}
              id={`chat-user-${user.id}`}
              onClick={() => startConversation(user.id)}
              disabled={startingWith === user.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(30, 41, 59, 0.5)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div
                className="avatar flex-shrink-0"
                style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' }}
              >
                {user.display_name?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {user.display_name || user.username}
                </p>
                <p className="text-sm text-slate-500">@{user.username}</p>
              </div>
              {startingWith === user.id ? (
                <Loader2 className="w-4 h-4 text-slate-500 animate-spin flex-shrink-0" />
              ) : (
                <MessageCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
