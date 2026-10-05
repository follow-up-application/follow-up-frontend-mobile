export type Materia = {
    id: number;
    nombre: string;
    descripcion: string;
    curso_division_turno_id: number;
    /** Heredado del curso/división/turno al que pertenece la materia. */
    turno: string;
    docente_id: string;
};

/** POST /materias */
export type CreateMateriaRequest = {
    nombre: string;
    descripcion: string;
    curso_division_turno_id: number;
    docente_id: string;
};

export type UpdateMateriaRequest = Partial<CreateMateriaRequest>;