import { apiRequest, apiRequestVoid } from '@/services/httpClient';
import type { CreateDocenteRequest, Docente, UpdateDocenteRequest } from '@/types/docente';
import type { Materia } from '@/types/materia';

/** GET /docentes — solo administrador. */
export function getDocentes(): Promise<Docente[]> {
    return apiRequest<Docente[]>('/docentes');
}

/** POST /docentes — solo administrador. */
export function crearDocente(request: CreateDocenteRequest): Promise<Docente> {
    return apiRequest<Docente>('/docentes', { method: 'POST', body: request });
}

/** GET /docentes/{id} — solo administrador. */
export function getDocente(id: string): Promise<Docente> {
    return apiRequest<Docente>(`/docentes/${id}`);
}

/** PUT /docentes/{id} — el controller no implementa update, responde 500. */
export function updateDocente(id: string, request: UpdateDocenteRequest): Promise<Docente> {
    return apiRequest<Docente>(`/docentes/${id}`, { method: 'PUT', body: request });
}

/** DELETE /docentes/{id} — responde 204. */
export function deleteDocente(id: string): Promise<void> {
    return apiRequestVoid(`/docentes/${id}`, { method: 'DELETE' });
}

/** GET /docentes/{id}/materias — administrador y docente. */
export function getMateriasByDocente(id: string): Promise<Materia[]> {
    return apiRequest<Materia[]>(`/docentes/${id}/materias`);
}