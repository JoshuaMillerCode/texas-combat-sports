import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin';
  isActive?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // // Authenticate the request (only admins can create users)
    const authUser = authenticateToken(request);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    await dbConnect();

    const body: CreateUserRequest = await request.json();
    const { username, email, password, role = 'admin', isActive = true } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      isActive,
    });

    await newUser.save();

    // Return user data (excluding password and refresh token)
    const { password: _, refreshToken: __, ...userData } = newUser.toObject();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create user error:', error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        {
          error: `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } already exists`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
