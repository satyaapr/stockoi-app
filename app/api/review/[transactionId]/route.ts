import { NextResponse } from 'next/server';
import { getReviewModel } from '@/lib/data';

export async function GET(_request: Request, context: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await context.params;
  const model = await getReviewModel(transactionId);
  if (!model) {
    return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
  }
  return NextResponse.json(model);
}
