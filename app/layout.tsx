import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MiniSocial — Kết nối mọi người',
  description: 'Mạng xã hội mini và trò chuyện thời gian thực',
  keywords: 'social network, chat, community, Vietnam',
  openGraph: {
    title: 'MiniSocial',
    description: 'Mạng xã hội mini và trò chuyện thời gian thực',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
