'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Post } from '@/types';
import PostCard from './PostCard';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const supabaseRef = useRef(createClient());

  const fetchPosts = useCallback(async (pageNum: number, replace = false) => {
    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      if (!res.ok) return;
      const result = await res.json();
      if (replace) {
        setPosts(result.data || []);
        setNewPostCount(0);
      } else {
        setPosts((prev) => [...prev, ...(result.data || [])]);
      }
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Fetch lần đầu
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Lắng nghe sự kiện đăng bài mới từ PostForm
  useEffect(() => {
    const handler = () => {
      setPage(1);
      fetchPosts(1, true);
    };
    window.addEventListener('post-created', handler);
    return () => window.removeEventListener('post-created', handler);
  }, [fetchPosts]);

  // Supabase Realtime: lắng nghe bài viết mới từ người khác
  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel('public-posts-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        () => {
          // Có bài mới → tăng bộ đếm để hiện nút "Xem thêm X bài mới"
          setNewPostCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoadingMore(true);
    fetchPosts(nextPage, false);
  };

  const loadNewPosts = () => {
    setPage(1);
    fetchPosts(1, true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400 mb-3">Chưa có bài viết nào. Hãy là người đưa tin đầu tiên!</p>
        <RefreshCw className="w-6 h-6 text-slate-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Nút thông báo bài mới (chỉ hiện khi có người khác đăng bài) */}
      {newPostCount > 0 && (
        <button
          onClick={loadNewPosts}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all animate-fade-in"
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818cf8',
          }}
        >
          <Sparkles className="w-4 h-4" />
          Có {newPostCount} bài viết mới — Bấm để tải
        </button>
      )}

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
          id="load-more-posts"
          onClick={loadMore}
          disabled={isLoadingMore}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          {isLoadingMore ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Tải thêm'
          )}
        </button>
      )}
    </div>
  );
}
