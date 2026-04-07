import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { authenticateToken, requireAdmin, createAuthErrorResponse } from '@/lib/middleware/auth';

export async function POST(req: NextRequest) {
  const authUser = authenticateToken(req);
  if (!authUser || !requireAdmin(authUser)) {
    return createAuthErrorResponse('Admin access required', 403);
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
  }

  const ALLOWED_FOLDERS = ['events', 'fighters', 'uploads'];
  const body = await req.json();
  const folder = ALLOWED_FOLDERS.includes(body.folder) ? body.folder : 'uploads';

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { folder, timestamp };

  const sortedParamString = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(sortedParamString + apiSecret)
    .digest('hex');

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
