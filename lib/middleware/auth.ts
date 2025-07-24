import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from query parameter (for debugging)
  const tokenFromQuery = request.nextUrl.searchParams.get('token');
  if (tokenFromQuery) {
    return tokenFromQuery;
  }

  return null;
}

export function authenticateToken(request: NextRequest): JWTPayload | null {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function requireAdmin(user: JWTPayload | null): boolean {
  return user?.role === 'admin';
}

// Helper function to create authentication error responses
export function createAuthErrorResponse(message: string, status: number = 401) {
  return Response.json({ error: message }, { status });
}

// Example usage in a protected route:
/*
export async function GET(request: NextRequest) {
  const user = authenticateToken(request);
  
  if (!user) {
    return createAuthErrorResponse('Authentication required');
  }
  
  if (!requireAdmin(user)) {
    return createAuthErrorResponse('Admin access required', 403);
  }
  
  // Your protected route logic here
  return Response.json({ message: 'Protected data', user });
}
*/
