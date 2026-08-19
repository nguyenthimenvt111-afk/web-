import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username phải có ít nhất 3 ký tự')
      .max(30, 'Username tối đa 30 ký tự')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ được chứa chữ, số và dấu _'),
    email: z.string().email('Email không hợp lệ'),
    display_name: z
      .string()
      .min(1, 'Tên hiển thị không được để trống')
      .max(50, 'Tên hiển thị tối đa 50 ký tự'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
