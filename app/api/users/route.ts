import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyNewUserRegistration } from '@/lib/telegram';

// POST /api/users — Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, email, display_name, password } = parsed.data;
    const supabase = createAdminClient();

    // Check duplicate email
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 409 });
    }

    // Check duplicate username
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json({ error: 'Username này đã được sử dụng' }, { status: 409 });
    }

    // Check auto_approve setting
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'auto_approve')
      .single();

    const autoApprove = setting?.value === 'true';

    // Hash password with dynamic import
    const bcrypt = (await import('bcryptjs')).default;
    const password_hash = await bcrypt.hash(password, 12);

    // Create user — auto-approve if setting is on
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        display_name,
        password_hash,
        role: autoApprove ? 'approved' : 'pending',
        status: autoApprove ? 'approved' : 'pending',
        ...(autoApprove && { approved_at: new Date().toISOString() }),
      })
      .select('id, username, email, display_name, status')
      .single();

    if (error) {
      console.error('[Register] DB error:', error);
      return NextResponse.json(
        { error: 'Không thể tạo tài khoản. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    if (autoApprove) {
      // Notify admin: auto-approved
      notifyNewUserRegistration({
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        autoApproved: true,
      }).catch(console.error);

      return NextResponse.json(
        {
          data: {
            id: user.id,
            status: 'approved',
            message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.',
          },
        },
        { status: 201 }
      );
    } else {
      // Notify admin: needs approval (with Duyệt/Từ chối buttons)
      notifyNewUserRegistration({
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        autoApproved: false,
      }).catch(console.error);

      return NextResponse.json(
        {
          data: {
            id: user.id,
            status: 'pending',
            message: 'Đăng ký thành công! Vui lòng chờ admin duyệt tài khoản.',
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('[Register] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Lỗi server. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

// GET /api/users — List users (admin only)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || 'pending';
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  const { data, error, count } = await supabase
    .from('users')
    .select(
      'id, email, username, display_name, avatar_url, role, status, created_at',
      { count: 'exact' }
    )
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  });
}
