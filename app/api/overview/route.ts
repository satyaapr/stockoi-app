import { NextResponse } from 'next/server';
import { getDashboardModel } from '@/lib/data';

export async function GET() {
  return NextResponse.json(await getDashboardModel());
}
