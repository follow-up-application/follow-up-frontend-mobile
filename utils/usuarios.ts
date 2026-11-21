import { Colors } from '@/constants/Colors';
import type { UserRole } from '@/types/auth';

const COLORES_POR_ROL: Record<UserRole, string> = {
    administrador: Colors.primary,
    docente: '#386A20',
    alumno: '#E65100',
    tutor: '#625B71',
};

const ETIQUETAS_POR_ROL: Record<UserRole, string> = {
    administrador: 'Administrador',
    docente: 'Docente',
    alumno: 'Alumno',
    tutor: 'Tutor',
};

export function colorPorRol(rol: UserRole): string {
    return COLORES_POR_ROL[rol] ?? Colors.secondary;
}

export function etiquetaRol(rol: UserRole): string {
    return ETIQUETAS_POR_ROL[rol] ?? rol;
}
