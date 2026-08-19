'use client';

import { useEffect, useState } from 'react';
import { Comment } from '@/types';
import { formatRelativeTime, getAvatarFallback } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  onCommentAdded?: () => void;
}

export default function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data.data || []);
      setIsLoading(false);
    };
    fetchComments();
  }, [postId]);

  const submitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setComments((prev) => [...prev, data.data]);
        setNewComment('');
        onCommentAdded?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="mt-4 pt-4 space-y-3 animate-slide-up"
      style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}
    >
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div
              className="avatar"
              style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}
            >
              {getAvatarFallback(comment.author?.display_name || comment.author?.username)}
            </div>
            <div className="flex-1">
              <div
                className="rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(30, 41, 59, 0.5)' }}
              >
                <span className="text-sm font-medium text-white">
                  {comment.author?.display_name || comment.author?.username}
                </span>
                <p className="text-sm text-slate-300 mt-0.5">{comment.content}</p>
              </div>
              <p className="text-xs text-slate-600 mt-1 ml-2">
                {formatRelativeTime(comment.created_at)}
              </p>
            </div>
          </div>
        ))
      )}

      {/* Comment input */}
      <div className="flex gap-2 mt-3">
        <input
          id={`comment-input-${postId}`}
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          placeholder="Viết bình luận..."
          className="input-field py-2 text-sm flex-1"
        />
        <button
          id={`comment-submit-${postId}`}
          onClick={submitComment}
          disabled={!newComment.trim() || isSubmitting}
          className="btn-primary py-2 px-3"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
