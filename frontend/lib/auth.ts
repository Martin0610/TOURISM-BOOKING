import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';

export interface AuthUser {
  id: string;
  role: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    return { id: decoded.id, role: decoded.role };
  } catch {
    return null;
  }
}

export function requireAuth(user: AuthUser | null): AuthUser {
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export function requireAdmin(user: AuthUser | null): AuthUser {
  const authUser = requireAuth(user);
  if (authUser.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return authUser;
}
