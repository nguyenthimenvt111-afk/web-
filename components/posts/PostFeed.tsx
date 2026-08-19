'use client';

import { useEffect, useState, useCallback } from 'react';
import { Post } from '@/types';
import PostCard from './PostCard';
import { Loader2, RefreshCw } from 'lucide-react';

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number, replace = false) => {
    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      if (!res.ok) return;
      const result = await res.json();
      if (replace) {
        setPosts(result.data || []);
      } else {
        setPosts((prev) => [...prev, ...(result.data || [])]);
      }
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  useEffect(() => {
    const handler = () => {
      setPage(1);
      fetchPosts(1, true);
    };
    window.addEventListener('post-created', handler);
    return () => window.removeEventListener('post-created', handler);
  }, [fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoadingMore(true);
    fetchPosts(nextPage, false);
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
