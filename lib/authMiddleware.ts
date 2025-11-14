import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

/**
 * Middleware to authenticate requests
 * Checks for token in Authorization header or cookies
 */
export function authenticateRequest(request: NextRequest): {
  isAuthenticated: boolean;
  user?: JWTPayload;
  error?: string;
} {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // If not in header, try cookie
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }

    if (!token) {
      return {
        isAuthenticated: false,
        error: 'No authentication token provided'
      };
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return {
        isAuthenticated: false,
        error: 'Invalid or expired token'
      };
    }

    return {
      isAuthenticated: true,
      user: decoded
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

