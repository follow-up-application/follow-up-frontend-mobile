export type Docente = {
    id: string;
    first_name: string;
    last_name: string;
    dni: number;
    telephone: string;
    username: string;
    fecha_ingreso: string;
};

/** POST /docentes */
export type CreateDocenteRequest = {
    first_name: string;
    last_name: string;
    dni: number;
    telephone: string;
    /** Formato dd/mm/yyyy. */
    fecha_ingreso: string;
    curso_division_turno_id: number;
};

export type UpdateDocenteRequest = Partial<CreateDocenteRequest>;

/**
 * Fallback para cuando la API no trae username. El backend lo arma como
 * {PREFIJO}-{DNI}-{AÑO}; se usa sólo si el listado viniera sin ese campo.
 */
export function docenteUsername(docente: Pick<Docente, 'dni' | 'fecha_ingreso'>): string {
    const anio = docente.fecha_ingreso.split('/')[2] ?? '';
    return `DOC-${docente.dni}-${anio}`;
}