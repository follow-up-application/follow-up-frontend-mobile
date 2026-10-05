import { apiRequest, apiRequestVoid } from '@/services/httpClient';
import type {
    CreateCursoDivisionTurnoRequest,
    CursoDivisionTurno,
    UpdateCursoDivisionTurnoRequest,
} from '@/types/cursoDivisionTurno';
import type { Materia } from '@/types/materia';

/** GET /cursoDivisionTurno — solo administrador. */
export function getCursosDivisionTurno(): Promise<CursoDivisionTurno[]> {
    return apiRequest<CursoDivisionTurno[]>('/cursoDivisionTurno');
}

/** POST /cursoDivisionTurno — solo administrador. */
export function crearCursoDivisionTurno(
    request: CreateCursoDivisionTurnoRequest
): Promise<CursoDivisionTurno> {
    return apiRequest<CursoDivisionTurno>('/cursoDivisionTurno', {
        method: 'POST',
        body: request,
    });
}

/** GET /cursoDivisionTurno/{id} — solo administrador. */
export function getCursoDivisionTurno(id: number): Promise<CursoDivisionTurno> {
    return apiRequest<CursoDivisionTurno>(`/cursoDivisionTurno/${id}`);
}

/** PUT /cursoDivisionTurno/{id} — el controller no implementa update, responde 500. */
export function updateCursoDivisionTurno(
    id: number,
    request: UpdateCursoDivisionTurnoRequest
): Promise<CursoDivisionTurno> {
    return apiRequest<CursoDivisionTurno>(`/cursoDivisionTurno/${id}`, {
        method: 'PUT',
        body: request,
    });
}

/** DELETE /cursoDivisionTurno/{id} — responde 204. */
export function deleteCursoDivisionTurno(id: number): Promise<void> {
    return apiRequestVoid(`/cursoDivisionTurno/${id}`, { method: 'DELETE' });
}

/** GET /cursoDivisionTurno/{id}/materias — administrador y docente. */
export function getMateriasByCursoDivisionTurno(id: number): Promise<Materia[]> {
    return apiRequest<Materia[]>(`/cursoDivisionTurno/${id}/materias`);
}