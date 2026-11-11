export type Tutor = {
    id: string;
    first_name: string;
    last_name: string;
    dni: number;
    telephone: string;
    email: string;
};

/** POST /tutores/register — consume un código institucional. */
export type RegisterTutorRequest = {
    codigo_institucional: string;
    email: string;
    password: string;
};

/** POST /tutores — alta directa del administrador (no funciona en el backend). */
export type CreateTutorRequest = RegisterTutorRequest;

export type UpdateTutorRequest = Partial<CreateTutorRequest>;