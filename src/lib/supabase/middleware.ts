import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from './config';

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith('/admin');
  const isLogin = pathname.startsWith('/admin/login');

  if (!isAdminPath) {
    return NextResponse.next({ request });
  }

  // Allow access to login page
  if (isLogin) {
    return NextResponse.next({ request });
  }

  if (!isSupabaseConfigured()) {
    // If not configured, allow access in demo mode
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If Supabase credentials are placeholder / dummy or fetch fails, allow access to admin preview
    if (error && (error.message.includes('Invalid API key') || error.message.includes('fetch'))) {
      return NextResponse.next({ request });
    }

    if (!user && !isLogin) {
      // If genuine Supabase project is connected and user not logged in, redirect to login
      // but if demo cookie is present, allow through
      const hasDemoCookie = request.cookies.get('zepnex_demo_admin_active');
      if (hasDemoCookie) {
        return NextResponse.next({ request });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    if (user && isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  } catch {
    // Graceful fallback
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
