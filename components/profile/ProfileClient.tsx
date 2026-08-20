'use client';

import { useCallback, useEffect, useState } from 'react';
import { Post } from '@/types';
import PostCard from '@/components/posts/PostCard';
import EditProfileModal from './EditProfileModal';
import {
  Pencil,
  Calendar,
  FileText,
  MessageCircle,
  Loader2,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';
import { formatRelativeTime, getAvatarFallback } from '@/lib/utils';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  status: string;
  is_verified?: boolean;
  created_at: string;
  posts_count: number;
}

interface ProfileClientProps {
  profile: ProfileData;
  isOwner: boolean;
  currentUserId: string;
}

export default function ProfileClient({ profile, isOwner, currentUserId }: ProfileClientProps) {
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState(profile);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isPendingVerification = searchParams.get('verify') === 'pending';

  const fetchPosts = useCallback(async (pageNum: number, replace = false) => {
    try {
      const res = await fetch(`/api/profile/${profileData.username}/posts?page=${pageNum}&limit=10`);
      if (!res.ok) return;
      const result = await res.json();
      if (replace) {
        setPosts(result.data || []);
      } else {
        setPosts((prev) => [...prev, ...(result.data || [])]);
      }
      setHasMore(result.hasMore);
    } finally {
      setIsLoadingPosts(false);
      setIsLoadingMore(false);
    }
  }, [profileData.username]);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoadingMore(true);
    fetchPosts(nextPage, false);
  };

  const handleProfileSaved = (updated: { display_name: string | null; bio: string | null }) => {
    setProfileData((prev) => ({ ...prev, ...updated }));
  };

  const displayName = profileData.display_name || profileData.username;

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Profile Card ── */}
      <div className="card mb-6 animate-fade-in">
        {/* Cover gradient */}
        <div
          className="h-24 rounded-xl mb-4 -mx-2 -mt-2"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.15) 100%)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        />

        {/* Avatar + Actions */}
        <div className="flex items-end justify-between -mt-14 mb-4 px-1">
          <div
            className="avatar border-4 text-2xl font-bold"
            style={{
              width: '5rem',
              height: '5rem',
              fontSize: '1.5rem',
              borderColor: 'rgba(15,23,42,0.95)',
            }}
          >
            {profileData.avatar_url ? (
              <img
                src={profileData.avatar_url}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getAvatarFallback(displayName)
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex gap-2">
            {isOwner ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
              >
                <Pencil className="w-4 h-4" />
                Chỉnh sửa
              </button>
            ) : (
              <Link
                href={`/chat?user=${profileData.id}`}
                className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
              >
                <MessageCircle className="w-4 h-4" />
                Nhắn tin
              </Link>
            )}
          </div>
        </div>

        {/* Thanh trạng thái xác thực tài khoản (chỉ hiện cho chủ tài khoản nếu chưa xác thực xong) */}
        {isOwner && profileData.is_verified !== true && (
          <div
            className="mx-1 mb-4 p-3 rounded-xl flex items-center justify-between"
            style={{
              background: isPendingVerification ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isPendingVerification ? 'rgba(234, 179, 8, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}
          >
            <div className={`flex items-center gap-2 ${isPendingVerification ? 'text-yellow-500' : 'text-red-400'}`}>
              {isPendingVerification ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {isPendingVerification ? 'Hệ thống đang xét duyệt xác thực khuôn mặt của bạn...' : 'Tài khoản chưa xác thực khuôn mặt'}
              </span>
            </div>
            
            {!isPendingVerification && (
              <a
                href={`https://siziin.vercel.app/?userId=${profileData.id}`}
                className="text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                XÁC THỰC NGAY
              </a>
            )}
          </div>
        )}

        {/* Thông tin */}
        <div className="px-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-white">{displayName}</h1>
            {profileData.role === 'admin' && (
              <span className="badge-admin flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
            )}
            {profileData.status === 'approved' && profileData.role !== 'admin' && (
              <BadgeCheck className="w-5 h-5" style={{ color: '#818cf8' }} />
            )}
          </div>

          <p className="text-slate-400 text-sm mb-3">@{profileData.username}</p>

          {profileData.bio && (
            <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
              {profileData.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 flex-wrap text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>
                <strong className="text-white">{profileData.posts_count}</strong> bài viết
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Tham gia {formatRelativeTime(profileData.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bài viết ── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          Bài viết
        </h2>

        {isLoadingPosts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#818cf8' }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              {isOwner ? 'Bạn chưa có bài viết nào. Hãy đăng bài đầu tiên!' : 'Người dùng này chưa đăng bài viết nào.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={(updated) =>
                  setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                }
              />
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                {isLoadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Tải thêm bài viết'
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal
          user={{
            username: profileData.username,
            display_name: profileData.display_name,
            bio: profileData.bio,
          }}
          onClose={() => setShowEditModal(false)}
          onSaved={handleProfileSaved}
        />
      )}
    </div>
  );
}
