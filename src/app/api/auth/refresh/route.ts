import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { User, Clinic, ensureDbSynced } from '@/db/models';
import {
  verifyRefreshToken,
  verifyToken,
  decodeToken,
  signToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  TokenPayload,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function handleRefresh(req: NextRequest) {
  try {
    await ensureDbSynced();

    let providedRefreshToken: string | null = null;
    let providedAccessToken: string | null = null;

    // 1. Try reading from Request body if JSON
    try {
      const body = await req.json();
      if (body) {
        if (body.refreshToken) providedRefreshToken = body.refreshToken;
        if (body.token) providedAccessToken = body.token;
      }
    } catch {
      // Body not provided or not JSON (e.g. GET request or empty body)
    }

    // 2. Try reading from headers
    if (!providedRefreshToken) {
      providedRefreshToken = req.headers.get('x-refresh-token');
    }
    if (!providedAccessToken) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        providedAccessToken = authHeader.substring(7).trim();
      }
    }

    // 3. Try reading from cookies
    try {
      const cookieStore = await cookies();
      if (!providedRefreshToken) {
        providedRefreshToken = cookieStore.get('graftdesk_refresh_token')?.value || null;
      }
      if (!providedAccessToken) {
        providedAccessToken = cookieStore.get('graftdesk_session')?.value || null;
      }
    } catch {}

    let targetUserId: string | null = null;

    // A. First check if we have a valid refresh token
    if (providedRefreshToken) {
      const refreshPayload = verifyRefreshToken(providedRefreshToken);
      if (refreshPayload && refreshPayload.userId) {
        targetUserId = refreshPayload.userId;
      }
    }

    // B. If no valid refresh token, inspect access token
    if (!targetUserId && providedAccessToken) {
      // Check if access token is still valid
      const validPayload = verifyToken(providedAccessToken);
      if (validPayload && validPayload.userId) {
        targetUserId = validPayload.userId;
      } else {
        // Access token might be expired; decode it to obtain userId and verify against DB
        const decoded = decodeToken(providedAccessToken);
        if (decoded && decoded.userId) {
          targetUserId = decoded.userId;
        }
      }
    }

    if (!targetUserId) {
      const res = NextResponse.json(
        { error: 'No valid session or refresh token found. Please log in again.' },
        { status: 401 }
      );
      clearAuthCookies(res);
      return res;
    }

    // Fetch user from database to verify status and fresh info
    const user = await User.findByPk(targetUserId, {
      include: [{ model: Clinic, as: 'clinic' }],
    });

    if (!user) {
      const res = NextResponse.json({ error: 'User account not found' }, { status: 404 });
      clearAuthCookies(res);
      return res;
    }

    if (!user.isActive) {
      const res = NextResponse.json(
        { error: 'Account has been deactivated. Please contact your administrator.' },
        { status: 403 }
      );
      clearAuthCookies(res);
      return res;
    }

    // Generate fresh tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinicId: user.clinicId,
    };

    const newAccessToken = signToken(tokenPayload, '7d');
    const newRefreshToken = signRefreshToken(tokenPayload, '30d');

    const res = NextResponse.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        clinicId: user.clinicId,
        clinic: (user as any).clinic,
      },
    });

    // Set updated cookies on the response
    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleRefresh(req);
}

export async function GET(req: NextRequest) {
  return handleRefresh(req);
}
