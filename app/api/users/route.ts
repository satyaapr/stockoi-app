import { NextResponse } from 'next/server';
import { getBundle } from '@/lib/data';

export async function GET() {
  const bundle = await getBundle();
  return NextResponse.json(bundle.users);
}
