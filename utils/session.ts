import * as SecureStore from 'expo-secure-store';

export type UserRole = 'administrador' | 'docente' | 'alumno' | 'tutor';

export type Session = {
  token: string;
  rol: UserRole;
  first_name: string;
  last_name: string;
  username: string;
};

const SESSION_KEY = 'session';

export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    // Sesión corrupta (no debería pasar, pero por las dudas la limpiamos)
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function nombreCompleto(session: Session): string {
  return `${session.first_name} ${session.last_name}`.trim();
}

export function iniciales(session: Session): string {
  const inicialNombre = session.first_name?.[0] ?? '';
  const inicialApellido = session.last_name?.[0] ?? '';
  return `${inicialNombre}${inicialApellido}`.toUpperCase();
}