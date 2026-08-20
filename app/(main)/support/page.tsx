'use client';

import { useEffect, useState } from 'react';
import {
  LifeBuoy, Send, Loader2, ChevronDown, ChevronUp,
  CheckCircle, Clock, MessageSquare, Plus, X
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface SupportMessage {
  id: string;
  is_admin: boolean;
  content: string;
  created_at: string;
}

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'answered' | 'closed';
  created_at: string;
  support_messages: SupportMessage[];
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    const res = await fetch('/api/support');
    if (res.ok) {
      const data = await res.json();
      setTickets(data.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung!');
      return;
    }
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
    });

    if (res.ok) {
      setNewTitle('');
      setNewContent('');
      setShowNewForm(false);
      fetchTickets();
    } else {
      setError('Gửi yêu cầu thất bại, vui lòng thử lại!');
    }
    setSubmitting(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Đã trả lời</span>;
      case 'closed':
        return <span className="text-xs font-medium text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20 flex items-center gap-1"><X className="w-3 h-3" />Đã đóng</span>;
      default:
        return <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 flex items-center gap-1"><Clock className="w-3 h-3" />Đang chờ</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-indigo-400" />
            Hỗ trợ
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gửi yêu cầu và nhận phản hồi từ Admin</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {showNewForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNewForm ? 'Hủy' : 'Gửi yêu cầu'}
        </button>
      </div>

      {/* Form tạo ticket mới */}
      {showNewForm && (
        <div className="card mb-6 animate-fade-in">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Yêu cầu hỗ trợ mới
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Tiêu đề vấn đề</label>
              <input
                type="text"
                className="input-field"
                placeholder="VD: Không đăng nhập được, Lỗi hiển thị..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mô tả chi tiết</label>
              <textarea
                className="input-field resize-none h-28"
                placeholder="Mô tả vấn đề bạn gặp phải, càng chi tiết càng tốt..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{newContent.length}/1000</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách ticket */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-16">
          <LifeBuoy className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">Chưa có yêu cầu nào</p>
          <p className="text-slate-500 text-sm mt-1">Bấm "Gửi yêu cầu" để liên hệ Admin khi cần hỗ trợ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const isExpanded = expandedId === ticket.id;
            const msgs = [...(ticket.support_messages || [])].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            return (
              <div key={ticket.id} className="card overflow-hidden">
                {/* Header ticket */}
                <button
                  className="w-full flex items-start justify-between gap-3 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {statusBadge(ticket.status)}
                      <span className="text-xs text-slate-500">{formatRelativeTime(ticket.created_at)}</span>
                    </div>
                    <p className="text-white font-medium truncate">{ticket.title}</p>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                    : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                  }
                </button>

                {/* Nội dung chat */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                    {msgs.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className="max-w-xs rounded-2xl px-4 py-2.5 text-sm"
                          style={msg.is_admin
                            ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '4px 16px 16px 16px' }
                            : { background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '16px 4px 16px 16px' }
                          }
                        >
                          {msg.is_admin && (
                            <p className="text-xs font-semibold text-indigo-400 mb-1">👮 Admin</p>
                          )}
                          <p className={msg.is_admin ? 'text-slate-200' : 'text-slate-300'}>
                            {msg.content}
                          </p>
                          <p className="text-xs text-slate-500 mt-1.5">
                            {formatRelativeTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {ticket.status === 'open' && (
                      <p className="text-center text-xs text-slate-500 py-2">
                        ⏳ Admin sẽ phản hồi sớm nhất có thể...
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
