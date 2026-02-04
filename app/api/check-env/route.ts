import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseKeySet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  });
}
