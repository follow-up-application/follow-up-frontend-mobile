import { apiRequest, apiRequestVoid } from '@/services/httpClient';
import type {
    Alumno,
    CreateAlumnoRequest,
    UpdateAlumnoRequest,
} from '@/types/alumno';

/** GET /alumnos — roles administrador y docente. */
export function getAlumnos(): Promise<Alumno[]> {
    return apiRequest<Alumno[]>('/alumnos');
}

/** POST /alumnos — roles administrador y docente. */
export function crearAlumno(request: CreateAlumnoRequest): Promise<Alumno> {
    return apiRequest<Alumno>('/alumnos', { method: 'POST', body: request });
}

/** GET /alumnos/{id} — cualquier rol autenticado. */
export function getAlumno(id: string): Promise<Alumno> {
    return apiRequest<Alumno>(`/alumnos/${id}`);
}

/** PUT /alumnos/{id} — el controller no implementa update, responde 500. */
export function updateAlumno(id: string, request: UpdateAlumnoRequest): Promise<Alumno> {
    return apiRequest<Alumno>(`/alumnos/${id}`, { method: 'PUT', body: request });
}

/** DELETE /alumnos/{id} — responde 204. */
export function deleteAlumno(id: string): Promise<void> {
    return apiRequestVoid(`/alumnos/${id}`, { method: 'DELETE' });
}