import { apiRequest, apiRequestVoid } from '@/services/httpClient';
import type { Admin, AdminStatistics } from '@/types/admin';
import type { CreateAdminRequest } from '@/types/auth';

/** GET /admins/estadisticas — solo administrador. */
export function getAdminStatistics(): Promise<AdminStatistics> {
    return apiRequest<AdminStatistics>('/admins/estadisticas');
}

/** GET /admins — solo administrador. */
export function getAdmins(): Promise<Admin[]> {
    return apiRequest<Admin[]>('/admins');
}

/** GET /admins/{id} — solo administrador. */
export function getAdmin(id: string): Promise<Admin> {
    return apiRequest<Admin>(`/admins/${id}`);
}

/** POST /admins — solo administrador. */
export function crearAdmin(request: CreateAdminRequest): Promise<Admin> {
    return apiRequest<Admin>('/admins', { method: 'POST', body: request });
}

/** PUT /admins/{id} — el controller no implementa update, responde 500. */
export function updateAdmin(id: string, request: Partial<CreateAdminRequest>): Promise<Admin> {
    return apiRequest<Admin>(`/admins/${id}`, { method: 'PUT', body: request });
}

/** DELETE /admins/{id} — el controller no implementa destroy, responde 500. */
export function deleteAdmin(id: string): Promise<void> {
    return apiRequestVoid(`/admins/${id}`, { method: 'DELETE' });
}