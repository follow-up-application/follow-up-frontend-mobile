import { apiRequest } from '@/services/httpClient';
import type { ApiUser } from '@/types/auth';

/** GET /users — solo administrador. */
export function getUsuarios(): Promise<ApiUser[]> {
    return apiRequest<ApiUser[]>('/users');
}
