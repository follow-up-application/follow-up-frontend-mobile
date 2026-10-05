export type CursoDivisionTurno = {
    id: number;
    curso: string;
    division: string;
    turno: string;
    capacidad_maxima: number;
};

/** POST /cursoDivisionTurno */
export type CreateCursoDivisionTurnoRequest = {
    curso: string;
    division: string;
    turno: string;
};

export type UpdateCursoDivisionTurnoRequest = Partial<CreateCursoDivisionTurnoRequest>;