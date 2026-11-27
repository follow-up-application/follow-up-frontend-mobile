export interface ApiError {
    message: string;
}

export interface ValidationError {
    message: string;
    errors: Record<string, string[]>;
}