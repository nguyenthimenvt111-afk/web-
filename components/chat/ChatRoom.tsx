'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message } from '@/types';
import MessageBubble from './MessageBubble';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ChatRoomProps {
  conversationId: string;
  currentUser: { id: string; name: string; username: string };
}

export default function ChatRoom({ conversationId, currentUser }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Create Supabase client once — stable reference
  const supabaseRef = useRef(createClient());

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}&limit=50`);
      const data = await res.json();
      setMessages(data.data || []);
      setIsLoading(false);
    };
    fetchMessages();
  }, [conversationId]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicate if we sent the message
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content,
      created_at: new Date().toISOString(),
      is_deleted: false,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        display_name: currentUser.name,
        avatar_url: null,
      },
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, content }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? data.data : m))
        );
      }
    } catch {
      // Remove temp message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}
      >
        <Link
          href="/chat"
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="font-semibold text-white">Cuộc trò chuyện</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#818cf8' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <p>Chưa có tin nhắn nào. Bắt đầu trò chuyện!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isSelf={message.sender_id === currentUser.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-6 py-4"
        style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}
      >
        <div className="flex gap-3">
          <input
            id="chat-message-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Nhập tin nhắn... (Enter để gửi)"
            className="input-field py-3 flex-1"
            disabled={isSending}
          />
          <button
            id="chat-send-btn"
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="btn-primary px-4"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
