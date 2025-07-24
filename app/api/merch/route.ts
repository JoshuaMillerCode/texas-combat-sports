import { NextRequest, NextResponse } from 'next/server';
import { MerchService } from '@/lib/services/merch.service';

export async function GET(req: NextRequest) {
  try {
    const merch = await MerchService.getAllMerch();
    return NextResponse.json(merch);
  } catch (error) {
    return NextResponse.json({ error: 'Merch not found' }, { status: 404 });
  }
}
