export type UserRole = 'administrador' | 'docente' | 'alumno' | 'tutor';

export type LoginRequest = {
    username: string;
    password: string;
};

export type LoginResponse = {
    token: string;
    rol: UserRole;
    first_name: string;
    last_name: string;
    username: string;
};

export type ChangePasswordRequest = {
    password: string;
};

/** POST /users (público) */
export type CreateUserRequest = {
    first_name: string;
    last_name: string;
    password: string;
    role?: UserRole;
};

export type CreateAdminRequest = {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
};

export type ApiUser = {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
};