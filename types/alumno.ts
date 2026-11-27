export type CursoDivisionTurno = {
  id: number;
  curso: number;
  division: string;
  turno: string;
  capacidad_maxima: number;
};

export type Tutor = {
  id: string;
  first_name: string;
  last_name: string;
  dni: number;
  telephone: string;
  email: string;
};

export type TutorAlumnoRelation = 'padre' | 'madre' | 'otra';

export type CreateAlumnoRequest = {
  first_name: string;
  last_name: string;
  dni: number;
  fecha_nacimiento: string; // 'YYYY-MM-DD'
  curso_division_turno_id: number;
  relationship: TutorAlumnoRelation;
  otra_relacion?: string | null;
  tutor_first_name?: string | null;
  tutor_last_name?: string | null;
  tutor_dni: number;
  tutor_telephone?: string | null;
};