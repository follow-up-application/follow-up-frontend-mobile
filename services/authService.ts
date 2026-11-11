import { apiRequest } from '@/services/httpClient';
import type {
    ChangePasswordRequest,
    CreateAdminRequest,
    CreateUserRequest,
    LoginRequest,
    LoginResponse,
} from '@/types/auth';

/** POST /login (público) */
export function login(request: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/login', {
        method: 'POST',
        auth: false,
        body: request,
    });
}

/**
 * POST /logout — revoca el token de Sanctum.
 * El backend todavía no implementa el método, responde 500.
 */
export function logout(): Promise<null> {
    return apiRequest<null>('/logout', { method: 'POST' });
}

/** PUT /password — cualquier rol autenticado. */
export function changePassword(request: ChangePasswordRequest): Promise<null> {
    return apiRequest<null>('/password', { method: 'PUT', body: request });
}

/** POST /users (público). El backend responde 500, ver docs/api-endpoints.md. */
export function createUser(request: CreateUserRequest): Promise<null> {
    return apiRequest<null>('/users', { method: 'POST', auth: false, body: request });
}

/** POST /admins/register (público). */
export function registerAdmin(request: CreateAdminRequest): Promise<null> {
    return apiRequest<null>('/admins/register', {
        method: 'POST',
        auth: false,
        body: request,
    });
}