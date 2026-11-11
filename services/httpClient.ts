import { API_BASE_URL } from '@/config/api';
import type { ApiErrorResponse, ValidationErrors } from '@/types/api';
import { getSession } from '@/utils/session';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type RequestConfig = {
    method?: HttpMethod;
    body?: unknown;
    query?: QueryParams;
    /** Por defecto true. Los endpoints públicos deben enviar false. */
    auth?: boolean;
    /** Token explícito. Si se define, tiene prioridad sobre la sesión guardada. */
    token?: string | null;
    timeoutMs?: number;
};

export type ApiResponse<T> = {
    status: number;
    data: T | null;
};

/** Error normalizado de cualquier llamada a la API. */
export class ApiRequestError extends Error {
    readonly status: number;
    readonly errors?: ValidationErrors;

    constructor(status: number, message: string, errors?: ValidationErrors) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.errors = errors;
    }
}

const DEFAULT_TIMEOUT_MS = 20000;

function buildQuery(query: QueryParams): string {
    const params = Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join('&');

    return params ? `?${params}` : '';
}

function buildUrl(path: string, query?: QueryParams): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;

    return `${API_BASE_URL}${normalized}${buildQuery(query ?? {})}`;
}

async function resolveToken(explicitToken?: string | null): Promise<string | null> {
    if (explicitToken !== undefined) {
        return explicitToken;
    }

    const session = await getSession();

    return session?.token ?? null;
}

async function parseBody<T>(response: Response): Promise<T | null> {
    if (response.status === 204) {
        return null;
    }

    const raw = await response.text();

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as T;
    } catch {
        return raw as unknown as T;
    }
}

/**
 * Ejecuta la petición y devuelve estado + cuerpo sin lanzar errores por status.
 * La usa la pantalla de verificación de endpoints.
 */
export async function apiRequestRaw<T = unknown>(
    path: string,
    config: RequestConfig = {}
): Promise<ApiResponse<T>> {
    const { method = 'GET', body, query, auth = true, timeoutMs = DEFAULT_TIMEOUT_MS } = config;

    let token: string | null = null;

    if (auth) {
        token = await resolveToken(config.token);

        if (!token) {
            throw new ApiRequestError(401, 'No existe una sesión iniciada.');
        }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(buildUrl(path, query), {
            method,
            headers: {
                Accept: 'application/json',
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        return { status: response.status, data: await parseBody<T>(response) };
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiRequestError(0, 'La solicitud fue cancelada por timeout.');
        }

        throw new ApiRequestError(
            0,
            `No se pudo conectar con la API en ${API_BASE_URL}.`,
        );
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Igual que apiRequestRaw pero lanza ApiRequestError cuando el status no es 2xx.
 */
export async function apiRequest<T = unknown>(
    path: string,
    config: RequestConfig = {}
): Promise<T> {
    const { status, data } = await apiRequestRaw<T>(path, config);

    if (status < 200 || status >= 300) {
        const payload = (data ?? {}) as ApiErrorResponse;

        throw new ApiRequestError(
            status,
            payload.message ?? `La petición falló con status ${status}.`,
            payload.errors
        );
    }

    return data as T;
}

/** Igual que apiRequest pero descarta el cuerpo (endpoints 204). */
export async function apiRequestVoid(path: string, config: RequestConfig = {}): Promise<void> {
    await apiRequest<null>(path, config);
}

/** Extrae un mensaje legible de cualquier error lanzado por los servicios. */
export function mensajeDeError(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
    if (error instanceof ApiRequestError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}