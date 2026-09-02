import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: actor } = await (supabase.from('profiles') as any).select('role').eq('id', user.user.id).maybeSingle() as { data: { role: string } | null };
  if (!actor || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: actor } = await (supabase.from('profiles') as any).select('role').eq('id', user.user.id).maybeSingle() as { data: { role: string } | null };
  if (!actor || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json() as { id?: string; role?: 'customer' | 'manager' | 'admin'; disabled?: boolean; display_name?: string };
  if (!body.id || (body.role && !['customer', 'manager', 'admin'].includes(body.role))) return NextResponse.json({ error: 'Invalid user update' }, { status: 400 });
  const updates = { ...(body.role ? { role: body.role } : {}), ...(typeof body.disabled === 'boolean' ? { disabled: body.disabled } : {}), ...(body.display_name !== undefined ? { display_name: body.display_name } : {}), updated_at: new Date().toISOString() };
  const { data, error } = await (supabase.from('profiles') as any).update(updates).eq('id', body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await (supabase.from('audit_logs') as any).insert({ actor_id: user.user.id, action: 'user.update', entity_type: 'profile', entity_id: body.id, after_data: updates });
  return NextResponse.json(data);
}
