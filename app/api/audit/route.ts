import { NextResponse } from 'next/server';
import { getAuditTrailModel } from '@/lib/data';

export async function GET() {
  return NextResponse.json(await getAuditTrailModel());
}
