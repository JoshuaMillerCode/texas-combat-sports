import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { CustomerMagicToken, Transaction } from '@/lib/models';
import { CustomerEmailService } from './customerEmail.service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const TOKEN_EXPIRY_MINUTES = 15;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour rolling window

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export class CustomerAuthService {
  static async requestMagicLink(email: string): Promise<{ success: boolean; rateLimited?: boolean }> {
    await dbConnect();

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit check — rolling 1-hour window
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recentCount = await CustomerMagicToken.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: windowStart },
    });

    if (recentCount >= RATE_LIMIT_MAX) {
      return { success: false, rateLimited: true };
    }

    // Check if email has any confirmed orders (don't reveal result to caller)
    const hasOrders = await Transaction.exists({
      'customerDetails.email': normalizedEmail,
      status: 'confirmed',
    });

    // Generate and store token regardless — prevents timing-based enumeration
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await CustomerMagicToken.create({ email: normalizedEmail, tokenHash, expiresAt });

    // Only send the email if they have orders
    if (hasOrders) {
      const domain = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
      const magicLinkUrl = `${domain}/api/customer/auth/verify?token=${rawToken}`;
      await CustomerEmailService.sendMagicLink(normalizedEmail, magicLinkUrl);
    }

    // Always return success — never reveal whether the email has orders
    return { success: true };
  }

  static async verifyMagicToken(rawToken: string): Promise<{ email: string } | null> {
    await dbConnect();

    const tokenHash = hashToken(rawToken);

    // Atomic find + mark used in one operation to prevent race conditions
    const token = await CustomerMagicToken.findOneAndUpdate(
      {
        tokenHash,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      },
      { isUsed: true },
      { new: true }
    );

    if (!token) return null;

    return { email: token.email };
  }

  static buildSessionJWT(email: string): string {
    return jwt.sign(
      { email, type: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}
