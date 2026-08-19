'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, CreatePostInput } from '@/lib/validations/post';
import { Send, Loader2 } from 'lucide-react';

interface PostFormProps {
  userId: string;
}

export default function PostForm({ userId }: PostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const MAX_CHARS = 2000;

  const { register, handleSubmit, reset, watch, formState: { errors } } =
    useForm<CreatePostInput>({ resolver: zodResolver(createPostSchema) });

  const content = watch('content', '');

  const onSubmit = async (data: CreatePostInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        reset();
        window.dispatchEvent(new CustomEvent('post-created'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <textarea
          id="post-content"
          {...register('content')}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none text-base leading-relaxed"
          placeholder="Bạn đang nghĩ gì?"
          rows={3}
          maxLength={MAX_CHARS}
        />
        {errors.content && (
          <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>
        )}
        <div
          className="flex items-center justify-between mt-4 pt-4"
          style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}
        >
          <span
            className={`text-xs ${
              (content?.length || 0) > MAX_CHARS * 0.9 ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            {content?.length || 0}/{MAX_CHARS}
          </span>
          <button
            type="submit"
            id="post-submit"
            disabled={isLoading || !content?.trim()}
            className="btn-primary flex items-center gap-2 py-2 px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Đăng bài
          </button>
        </div>
      </form>
    </div>
  );
}
