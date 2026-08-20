'use client';

import { useState } from 'react';
import { X, Save, Loader2, User } from 'lucide-react';

interface EditProfileModalProps {
  user: {
    username: string;
    display_name: string | null;
    bio: string | null;
  };
  onClose: () => void;
  onSaved: (updated: { display_name: string | null; bio: string | null }) => void;
}

export default function EditProfileModal({ user, onClose, onSaved }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Tên hiển thị không được để trống');
      return;
    }
    if (bio.length > 200) {
      setError('Bio không được vượt quá 200 ký tự');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/profile/${user.username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName.trim(), bio: bio.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Cập nhật thất bại');
        return;
      }

      onSaved({ display_name: data.data.display_name, bio: data.data.bio });
      onClose();
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-slide-up"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Chỉnh sửa hồ sơ</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar placeholder */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="avatar w-20 h-20 text-2xl"
              style={{ width: '5rem', height: '5rem', fontSize: '1.5rem' }}
            >
              {displayName?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: 'rgba(79, 70, 229, 0.9)',
                border: '2px solid rgba(15, 23, 42, 0.95)',
              }}
            >
              <User className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm text-red-400"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="Tên của bạn"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Bio
              <span className="text-slate-500 font-normal ml-2">{bio.length}/200</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field resize-none"
              placeholder="Viết vài dòng giới thiệu về bản thân..."
              rows={3}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={`@${user.username}`}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Username không thể thay đổi</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={isSaving}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !displayName.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Đang lưu...</>
            ) : (
              <><Save className="w-4 h-4" />Lưu thay đổi</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
