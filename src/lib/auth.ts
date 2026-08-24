import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { UserRole } from '@/db/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'graftdesk_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_secret_2026`;

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId?: string | null;
  type?: 'access' | 'refresh';
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Sign standard access token (defaults to 7 days)
 */
export function signToken(payload: TokenPayload, expiresIn: SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      clinicId: payload.clinicId,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Sign long-lived refresh token (defaults to 30 days)
 */
export function signRefreshToken(payload: Partial<TokenPayload> & { userId: string }, expiresIn: SignOptions['expiresIn'] = '30d'): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh',
    },
    JWT_REFRESH_SECRET,
    { expiresIn }
  );
}

/**
 * Verify access token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; email?: string; type?: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as any;
  } catch {
    // Fallback in case old refresh token was signed with base secret
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return null;
    }
  }
}

/**
 * Decode token without throwing on expired status (useful for refreshing)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Retrieve session user from cookies or Authorization header
 */
export async function getSessionUser(): Promise<TokenPayload | null> {
  let token: string | undefined;

  // 1. Try reading cookie
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('graftdesk_session')?.value;
  } catch {}

  // 2. Try reading Authorization header (Bearer token)
  if (!token) {
    try {
      const headerStore = await headers();
      const authHeader = headerStore.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    } catch {}
  }

  if (!token) return null;
  return verifyToken(token);
}

/**
 * Utility to set standard secure authentication cookies on responses
 */
export function setAuthCookies(res: NextResponse, token: string, refreshToken?: string) {
  // Session / Access token cookie (7 days)
  res.cookies.set('graftdesk_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  // Long-lived refresh token cookie (30 days)
  if (refreshToken) {
    res.cookies.set('graftdesk_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }
}

/**
 * Utility to clear authentication cookies on logout or invalid session
 */
export function clearAuthCookies(res: NextResponse) {
  res.cookies.set('graftdesk_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  res.cookies.set('graftdesk_refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
}

export function checkPermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  return allowedRoles.includes(userRole);
}
