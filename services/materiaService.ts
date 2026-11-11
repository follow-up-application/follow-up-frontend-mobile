import { apiRequest, apiRequestVoid } from '@/services/httpClient';
import type { CreateMateriaRequest, Materia, UpdateMateriaRequest } from '@/types/materia';

/** GET /materias — solo administrador. */
export function getMaterias(): Promise<Materia[]> {
    return apiRequest<Materia[]>('/materias');
}

/** POST /materias — solo administrador. */
export function crearMateria(request: CreateMateriaRequest): Promise<Materia> {
    return apiRequest<Materia>('/materias', { method: 'POST', body: request });
}

/** GET /materias/{id} — solo administrador. */
export function getMateria(id: number): Promise<Materia> {
    return apiRequest<Materia>(`/materias/${id}`);
}

/** PUT /materias/{id} — actualiza sólo los campos enviados (200). */
export function updateMateria(id: number, request: UpdateMateriaRequest): Promise<Materia> {
    return apiRequest<Materia>(`/materias/${id}`, { method: 'PUT', body: request });
}

/** DELETE /materias/{id} — responde 204. */
export function deleteMateria(id: number): Promise<void> {
    return apiRequestVoid(`/materias/${id}`, { method: 'DELETE' });
}