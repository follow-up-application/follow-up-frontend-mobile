/**
 * URL base de la API.
 *
 * Se puede sobreescribir con la variable de entorno EXPO_PUBLIC_API_URL (ver .env).
 * Si no está definida se usa la URL de la red local en la que se estaba trabajando.
 *
 * En emulador Android usar 'http://10.0.2.2:8000/api/v1'.
 * En un dispositivo físico usar la IP de la PC en la red local.
 */
const FALLBACK_API_BASE_URL = 'http://10.13.27.30:8000/api/v1';

export const API_BASE_URL = (
    process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_BASE_URL
).replace(/\/+$/, '');