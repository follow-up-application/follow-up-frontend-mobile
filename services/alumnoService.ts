import { getSession } from '@/utils/session';
import {
    CursoDivisionTurno,
    Tutor,
    CreateAlumnoRequest,
} from '@/types/alumno';
import { API_BASE_URL } from '@/config/api';

async function getHeaders() {
    const session = await getSession();

    if (!session?.token) {
        throw new Error('No existe una sesión iniciada.');
    }

    return {
        Authorization: `Bearer ${session.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
}

/**
 * Obtiene todos los cursos.
 */
export async function getCursosDivisionTurno(): Promise<CursoDivisionTurno[]> {

    const response = await fetch(
        `${API_BASE_URL}/cursoDivisionTurno`,
        {
            headers: await getHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error('No fue posible obtener los cursos.');
    }

    return response.json();
}

/**
 * Busca un tutor por DNI.
 * Devuelve null si no existe.
 */
export async function buscarTutorPorDni(
    dni: string
): Promise<Tutor | null> {

    const response = await fetch(
        `${API_BASE_URL}/tutores/dni/${dni}`,
        {
            headers: await getHeaders(),
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error('Error buscando tutor.');
    }

    return response.json();
}

/**
 * Crea un alumno.
 */
export async function crearAlumno(
    request: CreateAlumnoRequest
): Promise<void> {

    const response = await fetch(
        `${API_BASE_URL}/alumnos`,
        {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.message ??
            'No fue posible crear el alumno.'
        );
    }
}