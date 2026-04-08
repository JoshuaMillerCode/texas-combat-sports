import { NextRequest, NextResponse } from 'next/server';
import { CustomerAuthService } from '@/lib/services/customerAuth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const result = await CustomerAuthService.requestMagicLink(email);

    if (result.rateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait an hour before trying again.' },
        { status: 429 }
      );
    }

    if (!result.hasOrders) {
      return NextResponse.json(
        { error: 'No orders found for that email address.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Check your email for a link to access your tickets." });
  } catch (error) {
    console.error('Magic link request error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
