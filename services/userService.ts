import { apiRequest } from '@/services/httpClient';
import type { ApiUser, UpdateUserRequest } from '@/types/auth';

/** GET /users — solo administrador. */
export function getUsuarios(): Promise<ApiUser[]> {
    return apiRequest<ApiUser[]>('/users');
}

/** GET /users/{id} — solo administrador. */
export function getUsuario(id: string): Promise<ApiUser> {
    return apiRequest<ApiUser>(`/users/${encodeURIComponent(id)}`);
}

/** PUT /users/{id} — solo administrador. Actualización parcial. */
export function updateUsuario(id: string, request: UpdateUserRequest): Promise<ApiUser> {
    return apiRequest<ApiUser>(`/users/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: request,
    });
}
