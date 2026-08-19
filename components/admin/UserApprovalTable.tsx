'use client';

import { useState } from 'react';
import { User } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

type PendingUser = Pick<User, 'id' | 'email' | 'username' | 'display_name' | 'status' | 'created_at'>;

interface UserApprovalTableProps {
  initialUsers: PendingUser[];
}

export default function UserApprovalTable({ initialUsers }: UserApprovalTableProps) {
  const [users, setUsers] = useState<PendingUser[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        // Remove user from list after action
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="card text-center py-16">
        <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
        <p className="text-white font-medium text-lg mb-1">Tất cả đã được duyệt!</p>
        <p className="text-slate-400 text-sm">Không có tài khoản nào đang chờ duyệt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="card flex items-center gap-4">
          {/* Avatar */}
          <div
            className="avatar flex-shrink-0"
            style={{ width: '3rem', height: '3rem', fontSize: '1rem' }}
          >
            {(user.display_name?.[0] || user.username[0]).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="font-semibold text-white truncate">
                {user.display_name || user.username}
              </p>
              <span className="badge-pending">
                <Clock className="w-3 h-3 mr-1" />
                Đang chờ
              </span>
            </div>
            <p className="text-sm text-slate-400">
              @{user.username} · {user.email}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Đăng ký {formatRelativeTime(user.created_at)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              id={`approve-btn-${user.id}`}
              onClick={() => handleAction(user.id, 'approve')}
              disabled={loadingId === user.id}
              className="btn-success flex items-center gap-1.5"
            >
              {loadingId === user.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Duyệt
            </button>
            <button
              id={`reject-btn-${user.id}`}
              onClick={() => handleAction(user.id, 'reject')}
              disabled={loadingId === user.id}
              className="btn-danger flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Từ chối
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
