import { z } from 'zod';

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Nội dung không được để trống')
    .max(2000, 'Nội dung tối đa 2000 ký tự'),
  image_url: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Bình luận không được để trống')
    .max(500, 'Bình luận tối đa 500 ký tự'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
