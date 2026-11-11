import type { UserRole } from '@/types/auth';

export type Alumno = {
    id: string;
    first_name: string;
    last_name: string;
    dni: number;
    username: string;
    curso_division: string;
    fecha_nacimiento: string;
    role: UserRole;
};

/**
 * El enum del dominio (TutorAlumnoRelation) usa valores en minúscula: enviarlo
 * en mayúsculas pasa la validación pero revienta el use case con un ValueError.
 * Ojo: required_if:relationship,OTRA quedó en mayúsculas y nunca se dispara.
 */
export type TutorAlumnoRelation = 'padre' | 'madre' | 'otra';

export type CreateAlumnoRequest = {
    first_name: string;
    last_name: string;
    dni: number;
    /** Formato dd/mm/yyyy. */
    fecha_nacimiento: string;
    curso_division_turno_id: number;
    relationship: TutorAlumnoRelation;
    otra_relacion?: string | null;
    /** Si se envía, se reutiliza el tutor existente y no se piden sus datos. */
    tutor_id?: string | null;
    tutor_first_name?: string | null;
    tutor_last_name?: string | null;
    tutor_dni: number;
    tutor_telephone?: string | null;
};

export type UpdateAlumnoRequest = Partial<CreateAlumnoRequest>;