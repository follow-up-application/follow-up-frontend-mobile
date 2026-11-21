import { apiRequest, apiRequestVoid } from '@/services/httpClient';
import type { ApiUser, UpdateUserRequest } from '@/types/auth';

/** GET /users — solo administrador. */
export function getUsuarios(): Promise<ApiUser[]> {
    return apiRequest<ApiUser[]>('/users');
}

/** GET /users/inhabilitados — solo administrador. */
export function getUsuariosInhabilitados(): Promise<ApiUser[]> {
    return apiRequest<ApiUser[]>('/users/inhabilitados');
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

/** PATCH /users/{id}/inhabilitar — solo administrador. Baja lógica (204). */
export function inhabilitarUsuario(id: string): Promise<void> {
    return apiRequestVoid(`/users/${encodeURIComponent(id)}/inhabilitar`, { method: 'PATCH' });
}

/** PATCH /users/{id}/habilitar — solo administrador. Restaura el usuario (204). */
export function habilitarUsuario(id: string): Promise<void> {
    return apiRequestVoid(`/users/${encodeURIComponent(id)}/habilitar`, { method: 'PATCH' });
}
