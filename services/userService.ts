import { apiRequest } from '@/services/httpClient';
import type { ApiUser } from '@/types/auth';

/** GET /users — solo administrador. */
export function getUsuarios(): Promise<ApiUser[]> {
    return apiRequest<ApiUser[]>('/users');
}

/** GET /users/{id} — solo administrador. */
export function getUsuario(id: string): Promise<ApiUser> {
    return apiRequest<ApiUser>(`/users/${encodeURIComponent(id)}`);
}
