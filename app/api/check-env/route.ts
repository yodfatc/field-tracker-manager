import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseKeySet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  return NextResponse.json({ supabaseUrlSet, supabaseKeySet })
}
