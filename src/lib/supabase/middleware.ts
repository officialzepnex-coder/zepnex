import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from './config';

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith('/admin');
  const isLogin = pathname.startsWith('/admin/login');
  const isSetup = pathname.startsWith('/admin/setup');

  if (!isAdminPath) {
    return NextResponse.next({ request });
  }

  // The setup page explains how to configure the auth provider and is public.
  if (isSetup) {
    return NextResponse.next({ request });
  }

  // Login must always be renderable so configuration and auth errors can be shown.
  if (isLogin) {
    return NextResponse.next({ request });
  }

  // If Supabase is not configured, block access until auth credentials are added.
  if (!isSupabaseConfigured()) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/setup';
    return NextResponse.redirect(url);
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

    if (error) throw error;

    if (!user) {
      // Not authenticated — redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // Verify the user has an admin or manager role in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || !['admin', 'manager'].includes(profile.role)) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(url);
    }

    // For admin role, enforce MFA (aal2)
    if (profile.role === 'admin') {
      const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance?.currentLevel !== 'aal2') {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('error', 'mfa_required');
        return NextResponse.redirect(url);
      }
    }

    // Already authenticated user visiting login → redirect to dashboard
    if (isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
