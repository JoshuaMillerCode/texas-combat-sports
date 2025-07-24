import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

interface RefreshTokenPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as RefreshTokenPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Find user and validate refresh token
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    // Generate new refresh token (refresh token rotation for security)
    const newRefreshToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Update user with new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Create response with new access token
    const response = NextResponse.json(
      {
        message: 'Token refreshed successfully',
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set new refresh token cookie
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify and decode refresh token
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as RefreshTokenPayload;
    } catch (error) {
      // Even if token is invalid, still clear the cookie
      const response = NextResponse.json(
        { message: 'Logged out successfully' },
        { status: 200 }
      );
      response.cookies.delete('refreshToken');
      return response;
    }

    // Find user and clear refresh token
    const user = await User.findById(decoded.userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    // Clear refresh token cookie
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
