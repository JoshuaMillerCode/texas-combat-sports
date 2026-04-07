import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export interface CustomerJWTPayload {
  email: string;
  type: 'customer';
  iat?: number;
  exp?: number;
}

export function authenticateCustomer(request: NextRequest): CustomerJWTPayload | null {
  try {
    const token = request.cookies.get('customerToken')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Must have type: 'customer' — prevents admin JWTs from being used here
    if (decoded.type !== 'customer' || !decoded.email) return null;

    return decoded as CustomerJWTPayload;
  } catch {
    return null;
  }
}
