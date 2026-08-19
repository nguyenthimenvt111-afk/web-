# MiniSocial App

Mạng xã hội mini với chat realtime, deploy trên Vercel.

## Tech Stack
- **Framework**: Next.js 14 (App Router, Serverless)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (dark mode glassmorphism)
- **Database**: Supabase (PostgreSQL)
- **Realtime Chat**: Supabase Realtime
- **Auth**: NextAuth.js v5 (Credentials provider)
- **Deploy**: Vercel

## Tính năng
- ✅ Đăng ký / Đăng nhập
- ✅ Luồng phê duyệt tài khoản (pending → approved)
- ✅ Thông báo Telegram khi có tài khoản mới
- ✅ Admin duyệt tài khoản
- ✅ Đăng bài viết + Like + Bình luận
- ✅ Chat 1-1 realtime (Supabase Realtime)
- ✅ Phân quyền: guest / pending / approved / admin

## Setup

### 1. Cài dependencies
```bash
npm install
```

### 2. Cấu hình environment
```bash
cp .env.local.example .env.local
```
Điền các giá trị thực vào `.env.local`

### 3. Tạo database Supabase
1. Tạo project tại [supabase.com](https://supabase.com)
2. Vào **SQL Editor** và chạy file `supabase/schema.sql`
3. Copy Project URL và API keys vào `.env.local`

### 4. Tạo Telegram Bot
1. Chat với [@BotFather](https://t.me/BotFather) → `/newbot`
2. Lấy `BOT_TOKEN`
3. Tìm `CHAT_ID`: dùng [@userinfobot](https://t.me/userinfobot) hoặc send tin nhắn cho bot rồi check API

### 5. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### 6. Chạy local
```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000)

### 7. Deploy lên Vercel
1. Push code lên GitHub
2. Import repo vào Vercel
3. Thêm **tất cả** environment variables trong Vercel Dashboard
4. Set `NEXTAUTH_URL` = `https://your-app.vercel.app`
5. Deploy!

## Tạo Admin đầu tiên

Sau khi deploy và tạo tài khoản đầu tiên, chạy SQL sau trong Supabase:
```sql
UPDATE users 
SET role = 'admin', status = 'approved' 
WHERE email = 'your-admin-email@example.com';
```

## Cấu trúc thư mục

```
mini-social-app/
├── app/
│   ├── (auth)/          # Trang đăng nhập/đăng ký
│   ├── (main)/          # Trang chính (protected)
│   │   ├── page.tsx     # Home feed
│   │   ├── chat/        # Chat module
│   │   └── notifications/
│   ├── admin/           # Admin panel
│   └── api/             # API routes (serverless)
├── components/
│   ├── layout/          # Sidebar, Topbar
│   ├── posts/           # PostCard, PostFeed, PostForm, CommentSection
│   ├── chat/            # ChatRoom, MessageBubble, ConversationList
│   └── admin/           # UserApprovalTable
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── telegram.ts      # Telegram notifications
│   ├── supabase/        # Supabase clients
│   └── validations/     # Zod schemas
├── supabase/
│   └── schema.sql       # Database schema
└── types/
    └── index.ts         # TypeScript types
```

## Lưu ý Vercel

- `NEXTAUTH_URL` phải đúng domain production
- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server-side
- `NEXT_PUBLIC_*` variables mới accessible ở client
- Realtime subscription chỉ hoạt động ở Client Components
