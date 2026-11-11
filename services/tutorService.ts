import { apiRequest, apiRequestVoid } from '@/services/httpClient';
import type { Alumno } from '@/types/alumno';
import type {
    CreateTutorRequest,
    RegisterTutorRequest,
    Tutor,
    UpdateTutorRequest,
} from '@/types/tutor';

/**
 * GET /tutores/validarCodigo/{codigo} (público).
 * Devuelve el alumno asociado al código pendiente.
 */
export function validarCodigoTutor(codigo: string): Promise<Alumno> {
    return apiRequest<Alumno>(`/tutores/validarCodigo/${encodeURIComponent(codigo)}`, {
        auth: false,
    });
}

/**
 * POST /tutores/validarCodigo/... no existe: el alta de tutor se hace con
 * POST /tutores/register, que consume el código institucional.
 */
export function registerTutor(request: RegisterTutorRequest): Promise<Tutor> {
    return apiRequest<Tutor>('/tutores/register', {
        method: 'POST',
        auth: false,
        body: request,
    });
}

/** GET /tutores — solo administrador. */
export function getTutores(): Promise<Tutor[]> {
    return apiRequest<Tutor[]>('/tutores');
}

/** POST /tutores — el controller no implementa store, responde 500. */
export function crearTutor(request: CreateTutorRequest): Promise<Tutor> {
    return apiRequest<Tutor>('/tutores', { method: 'POST', body: request });
}

/** GET /tutores/{id} — administrador y tutor. */
export function getTutor(id: string): Promise<Tutor> {
    return apiRequest<Tutor>(`/tutores/${id}`);
}

/** PUT /tutores/{id} — el controller no implementa update, responde 500. */
export function updateTutor(id: string, request: UpdateTutorRequest): Promise<Tutor> {
    return apiRequest<Tutor>(`/tutores/${id}`, { method: 'PUT', body: request });
}

/** DELETE /tutores/{id} — responde 204. */
export function deleteTutor(id: string): Promise<void> {
    return apiRequestVoid(`/tutores/${id}`, { method: 'DELETE' });
}

/** GET /tutores/dni/{dni} — administrador y tutor. Devuelve null si no existe. */
export async function buscarTutorPorDni(dni: string): Promise<Tutor | null> {
    try {
        return await apiRequest<Tutor>(`/tutores/dni/${encodeURIComponent(dni)}`);
    } catch (error) {
        if (error instanceof Error && (error as { status?: number }).status === 404) {
            return null;
        }

        throw error;
    }
}

/** GET /tutores/{id}/alumnos — el controller no implementa alumnos, responde 500. */
export function getAlumnosByTutor(id: string): Promise<Alumno[]> {
    return apiRequest<Alumno[]>(`/tutores/${id}/alumnos`);
}