'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { Loader2, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('STATUS:pending')) {
          router.push('/pending');
          return;
        }
        if (result.error.includes('STATUS:rejected')) {
          setError('Tài khoản của bạn đã bị từ chối. Liên hệ admin để biết thêm chi tiết.');
          return;
        }
        if (result.error.includes('STATUS:banned')) {
          setError('Tài khoản của bạn đã bị cấm.');
          return;
        }
        setError('Email hoặc mật khẩu không đúng.');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style={{ background: 'rgba(79, 70, 229, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Sparkles className="w-8 h-8" style={{ color: '#818cf8' }} />
          </div>
          <h1 className="text-3xl font-bold text-white">MiniSocial</h1>
          <p className="text-slate-400 mt-2">Chào mừng trở lại! 👋</p>
        </div>

        {/* Form card */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl animate-slide-up"
                   style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  id="login-email"
                  {...register('email')}
                  className="input-field pl-12"
                  placeholder="email@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  id="login-password"
                  {...register('password')}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 mt-6">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-medium transition-colors"
            style={{ color: '#818cf8' }}
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
