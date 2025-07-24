import { NextRequest, NextResponse } from 'next/server';
import { MerchService } from '@/lib/services/merch.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const merch = await MerchService.getMerchById(params.id);
    return NextResponse.json(merch);
  } catch (error) {
    return NextResponse.json({ error: 'Merch not found' }, { status: 404 });
  }
}
