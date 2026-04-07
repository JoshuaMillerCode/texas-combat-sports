import { NextRequest, NextResponse } from 'next/server';
import { CustomerAuthService } from '@/lib/services/customerAuth.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rawToken = req.nextUrl.searchParams.get('token');

    if (!rawToken || rawToken.length !== 64) {
      return NextResponse.redirect(new URL('/my-tickets?error=invalid-link', req.url));
    }

    const result = await CustomerAuthService.verifyMagicToken(rawToken);

    if (!result) {
      return NextResponse.redirect(new URL('/my-tickets?error=invalid-link', req.url));
    }

    const sessionJWT = CustomerAuthService.buildSessionJWT(result.email);

    const response = NextResponse.redirect(new URL('/my-tickets/portal', req.url));

    response.cookies.set('customerToken', sessionJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // lax required — redirect arrives from email client (cross-site)
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Magic link verify error:', error);
    return NextResponse.redirect(new URL('/my-tickets?error=invalid-link', req.url));
  }
}
