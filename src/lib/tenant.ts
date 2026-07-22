import { TokenPayload } from './auth';

export interface TenantContext {
  clinicId: string;
  user: TokenPayload;
}

export function enforceTenantAccess(user: TokenPayload, requestedClinicId?: string): string {
  if (user.role === 'SUPER_ADMIN') {
    return requestedClinicId || user.clinicId || '';
  }

  if (!user.clinicId) {
    throw new Error('Unauthorized: No clinic association found for user');
  }

  if (requestedClinicId && requestedClinicId !== user.clinicId) {
    throw new Error('Forbidden: Multi-tenant access violation. Cannot access another clinic data.');
  }

  return user.clinicId;
}
