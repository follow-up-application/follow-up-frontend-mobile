import type { UserRole } from '@/types/auth';

export type Admin = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    role: UserRole;
};

/** GET /admins/estadisticas */
export type AdminStatistics = {
    total_alumnos: number;
    total_tutores: number;
};