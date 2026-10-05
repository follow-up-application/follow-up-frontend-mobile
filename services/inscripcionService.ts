import { apiRequest, apiRequestVoid } from '@/services/httpClient';
import type {
    CambiarEstadoInscripcionRequest,
    CreateInscripcionRequest,
    EstadoInscripcion,
    Inscripcion,
} from '@/types/inscripcion';

/** POST /inscripciones — administrador y alumno. */
export function crearInscripcion(request: CreateInscripcionRequest): Promise<Inscripcion> {
    return apiRequest<Inscripcion>('/inscripciones', { method: 'POST', body: request });
}

/** GET /inscripciones — administrador y alumno. */
export function getInscripciones(estado?: EstadoInscripcion): Promise<Inscripcion[]> {
    return apiRequest<Inscripcion[]>('/inscripciones', {
        query: { estado },
    });
}

/** GET /inscripciones/{id} — administrador y alumno. */
export function getInscripcion(id: number): Promise<Inscripcion> {
    return apiRequest<Inscripcion>(`/inscripciones/${id}`);
}

/** GET /alumnos/{id}/inscripciones — administrador y alumno. */
export function getInscripcionesByAlumno(
    alumnoId: string,
    estado?: EstadoInscripcion
): Promise<Inscripcion[]> {
    return apiRequest<Inscripcion[]>(`/alumnos/${alumnoId}/inscripciones`, {
        query: { estado },
    });
}

/** GET /materias/{id}/inscripciones — administrador y docente. */
export function getInscripcionesByMateria(
    materiaId: number,
    estado?: EstadoInscripcion
): Promise<Inscripcion[]> {
    return apiRequest<Inscripcion[]>(`/materias/${materiaId}/inscripciones`, {
        query: { estado },
    });
}

/** PUT /inscripciones/{id}/estado — administrador y docente. */
export function cambiarEstadoInscripcion(
    id: number,
    request: CambiarEstadoInscripcionRequest
): Promise<Inscripcion> {
    return apiRequest<Inscripcion>(`/inscripciones/${id}/estado`, {
        method: 'PUT',
        body: request,
    });
}

/** DELETE /inscripciones/{id} — solo administrador. */
export function deleteInscripcion(id: number): Promise<void> {
    return apiRequestVoid(`/inscripciones/${id}`, { method: 'DELETE' });
}