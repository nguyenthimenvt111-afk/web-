'use client';

import { useState } from 'react';
import { Post } from '@/types';
import { Heart, MessageCircle } from 'lucide-react';
import { formatRelativeTime, getAvatarFallback } from '@/lib/utils';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  onUpdate?: (post: Post) => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.user_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/likes`, { method: 'POST' });
      const data = await res.json();
      // Sync with server response
      setIsLiked(data.data.liked);
    } catch {
      // Revert on error
      setIsLiked(isLiked);
      setLikesCount(post.likes_count);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="card animate-fade-in">
      {/* Author */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="avatar"
          style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' }}
        >
          {getAvatarFallback(post.author?.display_name || post.author?.username)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">
            {post.author?.display_name || post.author?.username}
          </p>
          <p className="text-sm text-slate-500">
            @{post.author?.username} · {formatRelativeTime(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap mb-4">
        {post.content}
      </p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post image"
          className="w-full rounded-xl mb-4 object-cover"
          style={{ maxHeight: '24rem' }}
          loading="lazy"
        />
      )}

      {/* Actions */}
      <div
        className="flex items-center gap-6 pt-3"
        style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}
      >
        <button
          id={`like-btn-${post.id}`}
          onClick={handleLike}
          disabled={isLiking}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: isLiked ? '#f87171' : '#64748b',
            transition: 'all 0.2s',
            transform: isLiking ? 'scale(0.9)' : 'scale(1)',
          }}
          className="hover:scale-110 disabled:opacity-70"
        >
          <Heart
            className="w-5 h-5 transition-all"
            style={{ fill: isLiked ? '#f87171' : 'none' }}
          />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        <button
          id={`comment-btn-${post.id}`}
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-400 transition-colors"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentsCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentAdded={() => setCommentsCount((c) => c + 1)}
        />
      )}
    </article>
  );
}
