import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from './validations/auth';
import { createAdminClient } from './supabase/server';
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const supabase = createAdminClient();

        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, username, display_name, avatar_url, role, status, password_hash')
          .eq('email', email)
          .single();

        if (error || !user) return null;

        const bcrypt = (await import('bcryptjs')).default;
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) return null;

        // Block non-approved users with a status error
        if (user.status !== 'approved') {
          // Throw error with status code so client can redirect appropriately
          throw new Error(`STATUS:${user.status}`);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.display_name,
          image: user.avatar_url,
          username: user.username,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  // Trust the NEXTAUTH_URL env on Vercel
  trustHost: true,
});
