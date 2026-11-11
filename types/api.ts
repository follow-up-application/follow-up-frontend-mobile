export type ApiError = {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
};

export type ValidationErrors = Record<string, string[]>;

export interface ApiErrorResponse {
    message?: string;
    errors?: ValidationErrors;
}