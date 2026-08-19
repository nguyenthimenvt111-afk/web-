'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { Loader2, Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Đăng ký thất bại');
        return;
      }

      router.push('/pending');
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style={{ background: 'rgba(79, 70, 229, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Sparkles className="w-8 h-8" style={{ color: '#818cf8' }} />
          </div>
          <h1 className="text-3xl font-bold text-white">Tạo tài khoản</h1>
          <p className="text-slate-400 mt-2">Đăng ký để tham gia cộng đồng</p>
        </div>

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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tên hiển thị
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  id="register-displayname"
                  {...register('display_name')}
                  className="input-field pl-12"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.display_name && (
                <p className="text-red-400 text-sm mt-1.5">{errors.display_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium pointer-events-none">
                  @
                </span>
                <input
                  id="register-username"
                  {...register('username')}
                  className="input-field pl-9"
                  placeholder="username"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1.5">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  id="register-email"
                  type="email"
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
                  id="register-password"
                  type="password"
                  {...register('password')}
                  className="input-field pl-12"
                  placeholder="ít nhất 8 ký tự, 1 hoa, 1 số"
                  autoComplete="new-password"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  id="register-confirm-password"
                  type="password"
                  {...register('confirmPassword')}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              id="register-submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                'Đăng ký'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 mt-6">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium transition-colors" style={{ color: '#818cf8' }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
