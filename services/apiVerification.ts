import { API_BASE_URL } from '@/config/api';
import { apiRequestRaw, ApiRequestError, HttpMethod } from '@/services/httpClient';
import type { Alumno } from '@/types/alumno';
import type { UserRole } from '@/types/auth';
import type { CursoDivisionTurno } from '@/types/cursoDivisionTurno';
import { docenteUsername, type Docente } from '@/types/docente';
import type { Admin } from '@/types/admin';
import type { EstadoInscripcion, Inscripcion } from '@/types/inscripcion';
import type { Materia } from '@/types/materia';
import type { Tutor } from '@/types/tutor';

export type CheckEstado = 'ok' | 'fallo' | 'omitido';

export type ResultadoCrudo = {
    status: number;
    detalle?: string;
};

export type EndpointCheck = {
    id: string;
    metodo: HttpMethod;
    ruta: string;
    descripcion: string;
    roles: string;
    /** Estado HTTP con el que el endpoint se considera correcto. */
    esperado: number;
    /** Crea o borra datos: sólo corre con el modo escritura activado. */
    escritura?: boolean;
    /** Defecto conocido del backend que explica el fallo. */
    nota?: string;
    run: (ctx: ContextoVerificacion) => ResultadoCrudo | Promise<ResultadoCrudo>;
};

export type CheckResult = {
    id: string;
    metodo: HttpMethod;
    ruta: string;
    descripcion: string;
    roles: string;
    nota?: string;
    esperado: number;
    estado: CheckEstado;
    status: number | null;
    detalle?: string;
    duracionMs: number;
};

/** Registros del seeder que se usan como fixtures de las lecturas. */
export type Arbol = {
    alumno: Alumno;
    cdt: CursoDivisionTurno;
    docente: Docente;
    materia: Materia;
    inscripcion: Inscripcion;
    tutor: Tutor;
    admin: Admin;
};

/** Cuenta desechable para probar /password y /logout sin tocar la sesión real. */
export type CuentaSesion = {
    id: string;
    token: string;
};

/** IDs creados por la corrida, para borrarlos al final. */
export type Temporales = {
    alumno?: string;
    docente?: string;
    materia?: number;
    cdt?: number;
    inscripcion?: number;
    /** Varios tutores: el registrado, el creado por POST /alumnos y el directo. */
    tutores: string[];
    admins: string[];
    sesion?: CuentaSesion;
};

export type ContextoVerificacion = {
    tokenAdmin: string;
    tokenDocente: string | null;
    tokenAlumno: string | null;
    tokenTutor: string | null;
    arbol: Arbol;
    temporales: Temporales;
    escribir: boolean;
};

export type ResultadoCorrida = {
    checks: CheckResult[];
    totales: { total: number; ok: number; fallos: number; omitidos: number };
    startedAt: number;
    finishedAt: number;
};

const CREDENCIALES_ADMIN = { username: 'admin', password: 'Admin123!' };

const OMITIDO = -1;

function omitido(motivo: string): ResultadoCrudo {
    return { status: OMITIDO, detalle: motivo };
}

function resumen(data: unknown): string | undefined {
    if (data === null || data === undefined) {
        return undefined;
    }

    if (Array.isArray(data)) {
        return `${data.length} resultado(s)`;
    }

    if (typeof data === 'object') {
        const claves = Object.keys(data as object);

        return claves.length ? claves.slice(0, 4).join(', ') : undefined;
    }

    return undefined;
}

async function pedir<T = unknown>(
    ctx: ContextoVerificacion,
    metodo: HttpMethod,
    ruta: string,
    opciones: {
        token?: string | null;
        body?: unknown;
        query?: Record<string, string>;
        /** Permite obtener el body aunque el status no sea 2xx. */
        tolerante?: boolean;
    } = {}
): Promise<ResultadoCrudo & { data?: T }> {
    const token = opciones.token === undefined ? ctx.tokenAdmin : opciones.token;

    try {
        const { status, data } = await apiRequestRaw<T>(ruta, {
            method: metodo,
            body: opciones.body,
            query: opciones.query,
            token,
            // token null significa "petición sin credenciales": hay que desactivar
            // auth o el cliente cortaría antes de llegar a la API.
            auth: token !== null,
        });

        return { status, detalle: resumen(data), data: data ?? undefined };
    } catch (error) {
        return {
            status: error instanceof ApiRequestError ? error.status : 0,
            detalle: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

function dniAleatorio(base: number): number {
    return base + (Date.now() % 900_000);
}

/**
 * Ejecuta un PUT parcial con un valor de prueba y después restaura el valor
 * original del seeder. Los checks de update apuntan a registros semilla, así
 * que sin este paso la corrida dejaría datos modificados en la base.
 * El resultado que se reporta es el del primer PUT.
 */
async function updateYRestaurar<T>(
    ctx: ContextoVerificacion,
    ruta: string,
    cambio: Record<string, unknown>,
    original: Record<string, unknown>
): Promise<ResultadoCrudo & { data?: T }> {
    const res = await pedir<T>(ctx, 'PUT', ruta, { body: cambio });

    if (res.status >= 200 && res.status < 300) {
        const restauracion = await pedir(ctx, 'PUT', ruta, { body: original });

        if (restauracion.status < 200 || restauracion.status >= 300) {
            return {
                status: res.status,
                detalle: `actualizó ok, pero no se pudo restaurar el valor original (${restauracion.status})`,
                data: res.data,
            };
        }
    }

    return res;
}

/**
 * Arma el contexto de la corrida: inicia sesión con los roles disponibles y
 * resuelve los IDs reales de los fixtures usando los endpoints de listado.
 */
export async function prepararContexto(escribir: boolean): Promise<ContextoVerificacion> {
    const fallos: string[] = [];

    const loginAdmin = await apiRequestRaw<{ token: string }>('/login', {
        method: 'POST',
        auth: false,
        body: CREDENCIALES_ADMIN,
    });

    if (!loginAdmin.data?.token) {
        throw new Error(
            `No se pudo iniciar sesión como administrador en ${API_BASE_URL}. ` +
                'Revisá la URL de EXPO_PUBLIC_API_URL y que el backend esté corriendo.'
        );
    }

    const tokenAdmin = loginAdmin.data.token;

    const ctxBase: ContextoVerificacion = {
        tokenAdmin,
        tokenDocente: null,
        tokenAlumno: null,
        tokenTutor: null,
        arbol: {} as Arbol,
        temporales: { tutores: [], admins: [] },
        escribir,
    };

    const alumnos = (await pedir<Alumno[]>(ctxBase, 'GET', '/alumnos')).data ?? [];
    const cdts = (await pedir<CursoDivisionTurno[]>(ctxBase, 'GET', '/cursoDivisionTurno')).data ?? [];
    const docentes = (await pedir<Docente[]>(ctxBase, 'GET', '/docentes')).data ?? [];
    const materias = (await pedir<Materia[]>(ctxBase, 'GET', '/materias')).data ?? [];
    const tutores = (await pedir<Tutor[]>(ctxBase, 'GET', '/tutores')).data ?? [];
    const admins = (await pedir<Admin[]>(ctxBase, 'GET', '/admins')).data ?? [];
    const inscripciones = (await pedir<Inscripcion[]>(ctxBase, 'GET', '/inscripciones')).data ?? [];

    if (!alumnos.length) fallos.push('no hay alumnos');
    if (!cdts.length) fallos.push('no hay cursos');
    if (!docentes.length) fallos.push('no hay docentes');
    if (!materias.length) fallos.push('no hay materias');
    if (!tutores.length) fallos.push('no hay tutores');
    if (!admins.length) fallos.push('no hay administradores');
    if (!inscripciones.length) fallos.push('no hay inscripciones');

    if (fallos.length) {
        throw new Error(
            `La base no tiene datos para verificar (${fallos.join(', ')}). ` +
                'Ejecutá php artisan migrate:fresh --seed en el backend.'
        );
    }

    const alumno = alumnos[0];
    const cdt = cdts[0];
    const docente = docentes[0];

    // El alumno no debe estar inscripto en la materia que se usa para el alta,
    // porque el par alumno/materia es único.
    const InscriptasEn = (await pedir<Inscripcion[]>(
        ctxBase,
        'GET',
        `/alumnos/${alumno.id}/inscripciones`
    )).data ?? [];

    const materiaYaUsada = new Set(InscriptasEn.map((i) => i.materia_id));
    const materia = materias.find((m) => !materiaYaUsada.has(m.id)) ?? materias[0];

    const ctx: ContextoVerificacion = {
        ...ctxBase,
        arbol: {
            alumno,
            cdt,
            docente,
            materia,
            inscripcion: inscripciones[0],
            tutor: tutores[0],
            admin: admins[0],
        },
    };

    // Tokens de los otros roles. El password del seeder es el DNI del usuario.
    ctx.tokenAlumno = await obtenerToken(alumno.username, String(alumno.dni), fallos, 'alumno');
    ctx.tokenTutor = await obtenerToken(tutores[0].email, String(tutores[0].dni), fallos, 'tutor');
    ctx.tokenDocente = await obtenerToken(
        docente.username || docenteUsername(docente),
        String(docente.dni),
        fallos,
        'docente'
    );

    return ctx;
}

async function obtenerToken(
    username: string,
    password: string,
    fallos: string[],
    rol: UserRole
): Promise<string | null> {
    if (!username) {
        fallos.push(`no se pudo armar el username de ${rol}`);
        return null;
    }

    const res = await apiRequestRaw<{ token: string }>('/login', {
        method: 'POST',
        auth: false,
        body: { username, password },
    });

    if (!res.data?.token) {
        fallos.push(`login de ${rol} rechazado (${res.status})`);
        return null;
    }

    return res.data.token;
}

/**
 * Matriz de verificación: una entrada por cada ruta habilitada en
 * follow-up-backend/routes/api.php (incluidos los controles de permisos).
 */
export function construirChecks(codigoTutor: string): EndpointCheck[] {
    const marca = Date.now().toString(36).slice(-6).toUpperCase();
    const dniAlumno = dniAleatorio(30_000_000);
    const dniDocente = dniAleatorio(40_000_000);
    const dniTutor = dniAleatorio(50_000_000);
    const pass = 'Password123!';

    const requiereEscritura = (motivo = 'requiere activar el modo escritura') => omitido(motivo);

    return [
        // ── Públicas ──
        {
            id: 'login-ok',
            metodo: 'POST',
            ruta: '/login',
            descripcion: 'Inicio de sesión con credenciales válidas',
            roles: 'público',
            esperado: 200,
            nota: 'El login borra los tokens previos del usuario: la corrida adopta el token nuevo y la app queda con la sesión renovada al terminar.',
            run: async (ctx) => {
                const res = await pedir<{ token: string }>(ctx, 'POST', '/login', {
                    token: null,
                    body: CREDENCIALES_ADMIN,
                });

                // Sin esto, el resto de la corrida y la limpieza quedan con un token
                // revocado por este mismo login.
                if (res.status === 200 && res.data?.token) {
                    ctx.tokenAdmin = res.data.token;
                }

                return res;
            },
        },
        {
            id: 'login-mal',
            metodo: 'POST',
            ruta: '/login',
            descripcion: 'Rechazo de credenciales inválidas',
            roles: 'público',
            esperado: 422,
            run: (ctx) =>
                pedir(ctx, 'POST', '/login', {
                    token: null,
                    body: { username: 'usuario-inexistente', password: 'incorrecta' },
                }),
        },
        {
            id: 'users-store',
            metodo: 'POST',
            ruta: '/users',
            descripcion: 'Alta de usuario genérico',
            roles: 'público',
            esperado: 201,
            escritura: true,
            nota: 'La API no expone un endpoint de borrado para usuarios: el registro queda en la base.',
            run: (ctx) =>
                ctx.escribir
                    ? pedir(ctx, 'POST', '/users', {
                          token: null,
                          body: {
                              first_name: 'Verificacion',
                              last_name: marca,
                              username: `verif_user_${marca.toLowerCase()}`,
                              password: pass,
                              role: 'alumno',
                          },
                      })
                    : requiereEscritura(),
        },
        {
            id: 'validar-codigo-inexistente',
            metodo: 'GET',
            ruta: '/tutores/validarCodigo/{codigo}',
            descripcion: 'Código institucional inexistente devuelve 404',
            roles: 'público',
            esperado: 404,
            run: (ctx) =>
                pedir(ctx, 'GET', `/tutores/validarCodigo/${codigoTutor || 'CODIGO-INEJISTENTE'}`, {
                    token: null,
                }),
        },
        {
            id: 'validar-codigo',
            metodo: 'GET',
            ruta: '/tutores/validarCodigo/{codigo}',
            descripcion: 'Resuelve un código pendiente y devuelve el alumno',
            roles: 'público',
            esperado: 200,
            run: (ctx) =>
                codigoTutor
                    ? pedir(ctx, 'GET', `/tutores/validarCodigo/${codigoTutor}`, { token: null })
                    : omitido('falta cargar un código institucional'),
        },
        {
            id: 'tutores-register',
            metodo: 'POST',
            ruta: '/tutores/register',
            descripcion: 'Registro del tutor de un código pendiente',
            roles: 'público',
            esperado: 201,
            escritura: true,
            nota: 'Consume el código: después no se puede volver a usar.',
            run: async (ctx) => {
                if (!codigoTutor) {
                    return omitido('falta cargar un código institucional');
                }

                const res = await pedir<Tutor>(ctx, 'POST', '/tutores/register', {
                    token: null,
                    body: {
                        codigo_institucional: codigoTutor,
                        email: `verificacion.${marca.toLowerCase()}@test.com`,
                        password: pass,
                    },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.tutores.push(res.data.id);
                }

                return res;
            },
        },
        {
            id: 'admins-register',
            metodo: 'POST',
            ruta: '/admins/register',
            descripcion: 'Registro público de administrador',
            roles: 'público',
            esperado: 201,
            escritura: true,
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                const res = await pedir<{ id: string }>(ctx, 'POST', '/admins/register', {
                    token: null,
                    body: {
                        first_name: 'Verificacion',
                        last_name: marca,
                        username: `verif_${marca.toLowerCase()}_reg`,
                        password: pass,
                    },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.admins.push(res.data.id);
                }

                return res;
            },
        },

        // ── Sesión ──
        {
            id: 'sesion-cuenta-temporal',
            metodo: 'POST',
            ruta: '/admins',
            descripcion: 'Alta de la cuenta desechable para /password y /logout',
            roles: 'administrador',
            esperado: 201,
            escritura: true,
            nota: 'No se puede probar /password ni /logout sobre la cuenta real: /logout revocaría la sesión y /password cambiaría la clave del administrador.',
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura('necesita una cuenta desechable');
                }

                const username = `verif_${marca.toLowerCase()}_sesion`;
                const res = await pedir<{ id: string }>(ctx, 'POST', '/admins', {
                    body: {
                        first_name: 'Sesion',
                        last_name: marca,
                        username,
                        password: pass,
                    },
                });

                if (res.status !== 201 || !res.data?.id) {
                    return res;
                }

                ctx.temporales.admins.push(res.data.id);

                const login = await pedir<{ token: string }>(ctx, 'POST', '/login', {
                    token: null,
                    body: { username, password: pass },
                });

                if (login.status !== 200 || !login.data?.token) {
                    return {
                        status: login.status,
                        detalle: `alta ok, pero no se pudo iniciar sesión (${login.status})`,
                    };
                }

                ctx.temporales.sesion = { id: res.data.id, token: login.data.token };

                return res;
            },
        },
        {
            id: 'password',
            metodo: 'PUT',
            ruta: '/password',
            descripcion: 'Cambio de contraseña del usuario autenticado',
            roles: 'autenticado',
            esperado: 200,
            escritura: true,
            nota: 'Cambia la contraseña de la cuenta desechable y deja must_change_password en false.',
            run: (ctx) =>
                ctx.temporales.sesion
                    ? pedir(ctx, 'PUT', '/password', {
                          token: ctx.temporales.sesion.token,
                          body: { password: `${pass}2` },
                      })
                    : requiereEscritura('necesita la cuenta desechable de sesión'),
        },
        {
            id: 'logout',
            metodo: 'POST',
            ruta: '/logout',
            descripcion: 'Revocación del token de Sanctum',
            roles: 'autenticado',
            esperado: 200,
            escritura: true,
            nota: 'Revoca el token de Sanctum de la cuenta desechable.',
            run: (ctx) =>
                ctx.temporales.sesion
                    ? pedir(ctx, 'POST', '/logout', { token: ctx.temporales.sesion.token })
                    : requiereEscritura('necesita la cuenta desechable de sesión'),
        },

        // ── Alumnos ──
        {
            id: 'alumnos-index',
            metodo: 'GET',
            ruta: '/alumnos',
            descripcion: 'Listado de alumnos',
            roles: 'administrador, docente',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', '/alumnos'),
        },
        {
            id: 'alumnos-store',
            metodo: 'POST',
            ruta: '/alumnos',
            descripcion: 'Alta de alumno con su tutor',
            roles: 'administrador, docente',
            esperado: 201,
            escritura: true,
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                const res = await pedir<Alumno>(ctx, 'POST', '/alumnos', {
                    body: {
                        first_name: 'Verificacion',
                        last_name: marca,
                        dni: dniAlumno,
                        fecha_nacimiento: '01/01/2012',
                        curso_division_turno_id: ctx.arbol.cdt.id,
                        // El enum del dominio es minúsculo: en mayúsculas el
                        // use case revienta con ValueError.
                        relationship: 'madre',
                        otra_relacion: null,
                        tutor_dni: dniTutor,
                        tutor_first_name: 'Tutor',
                        tutor_last_name: marca,
                        tutor_telephone: '3513333333',
                    },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.alumno = res.data.id;

                    // El alta del alumno reutiliza o crea el tutor: hay que
                    // localizarlo para poder borrarlo en la limpieza.
                    const tutor = await pedir<Tutor>(
                        ctx,
                        'GET',
                        `/tutores/dni/${dniTutor}`
                    );

                    if (tutor.data?.id) {
                        ctx.temporales.tutores.push(tutor.data.id);
                    }
                }

                return res;
            },
        },
        {
            id: 'alumnos-show',
            metodo: 'GET',
            ruta: '/alumnos/{id}',
            descripcion: 'Detalle de un alumno',
            roles: 'cualquier autenticado',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/alumnos/${ctx.arbol.alumno.id}`),
        },
        {
            id: 'alumnos-show-como-alumno',
            metodo: 'GET',
            ruta: '/alumnos/{id}',
            descripcion: 'Un alumno puede ver su propio detalle',
            roles: 'alumno',
            esperado: 200,
            nota: 'Rutas api.php:32 y 43 registran las dos GET alumnos/{id}. Gana la primera (sólo admin y docente), así que el alumno recibe 403. Mismo defecto en tutores/{id} (líneas 90 y 94).',
            run: (ctx) =>
                ctx.tokenAlumno
                    ? pedir(ctx, 'GET', `/alumnos/${ctx.arbol.alumno.id}`, { token: ctx.tokenAlumno })
                    : omitido('sin sesión de alumno'),
        },
        {
            id: 'alumnos-update',
            metodo: 'PUT',
            ruta: '/alumnos/{id}',
            descripcion: 'Actualización de alumno',
            roles: 'administrador, docente',
            esperado: 200,
            nota: 'Envía un cambio y después restaura el nombre del seeder.',
            run: (ctx) =>
                updateYRestaurar<Alumno>(
                    ctx,
                    `/alumnos/${ctx.arbol.alumno.id}`,
                    { first_name: 'Verificacion' },
                    { first_name: ctx.arbol.alumno.first_name }
                ),
        },
        {
            id: 'alumnos-destroy',
            metodo: 'DELETE',
            ruta: '/alumnos/{id}',
            descripcion: 'Baja del alumno creado por la verificación',
            roles: 'administrador, docente',
            esperado: 204,
            escritura: true,
            run: (ctx) =>
                ctx.temporales.alumno
                    ? pedir(ctx, 'DELETE', `/alumnos/${ctx.temporales.alumno}`)
                    : omitido('no se creó el alumno temporal'),
        },

        // ── Curso / División / Turno ──
        {
            id: 'cdt-index',
            metodo: 'GET',
            ruta: '/cursoDivisionTurno',
            descripcion: 'Listado de cursos',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', '/cursoDivisionTurno'),
        },
        {
            id: 'cdt-store',
            metodo: 'POST',
            ruta: '/cursoDivisionTurno',
            descripcion: 'Alta de curso',
            roles: 'administrador',
            esperado: 201,
            escritura: true,
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                // El dominio exige año 1-7, división de una letra mayúscula y el enum
                // TurnoEscolar ('Mañana' / 'Tarde'). La request sólo valida
                // string|max, así que un valor inválido termina en 500 y no en 422.
                const res = await pedir<CursoDivisionTurno>(ctx, 'POST', '/cursoDivisionTurno', {
                    body: { curso: '4', division: 'C', turno: 'Tarde' },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.cdt = res.data.id;
                }

                return res;
            },
        },
        {
            id: 'cdt-show',
            metodo: 'GET',
            ruta: '/cursoDivisionTurno/{id}',
            descripcion: 'Detalle de un curso',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/cursoDivisionTurno/${ctx.arbol.cdt.id}`),
        },
        {
            id: 'cdt-update',
            metodo: 'PUT',
            ruta: '/cursoDivisionTurno/{id}',
            descripcion: 'Actualización de curso',
            roles: 'administrador',
            esperado: 200,
            nota: 'Envía un cambio y después restaura el curso del seeder.',
            run: (ctx) =>
                updateYRestaurar<CursoDivisionTurno>(
                    ctx,
                    `/cursoDivisionTurno/${ctx.arbol.cdt.id}`,
                    { division: 'V' },
                    {
                        curso: ctx.arbol.cdt.curso,
                        division: ctx.arbol.cdt.division,
                        turno: ctx.arbol.cdt.turno,
                    }
                ),
        },
        {
            id: 'cdt-destroy',
            metodo: 'DELETE',
            ruta: '/cursoDivisionTurno/{id}',
            descripcion: 'Baja del curso creado por la verificación',
            roles: 'administrador',
            esperado: 204,
            escritura: true,
            run: (ctx) =>
                ctx.temporales.cdt
                    ? pedir(ctx, 'DELETE', `/cursoDivisionTurno/${ctx.temporales.cdt}`)
                    : omitido('no se creó el curso temporal'),
        },
        {
            id: 'cdt-materias',
            metodo: 'GET',
            ruta: '/cursoDivisionTurno/{id}/materias',
            descripcion: 'Materias del curso',
            roles: 'administrador, docente',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/cursoDivisionTurno/${ctx.arbol.cdt.id}/materias`),
        },

        // ── Docentes ──
        {
            id: 'docentes-index',
            metodo: 'GET',
            ruta: '/docentes',
            descripcion: 'Listado de docentes',
            roles: 'administrador',
            esperado: 200,
            nota: 'El resource invierte username/telephone y expone el hash de contraseña.',
            run: (ctx) => pedir(ctx, 'GET', '/docentes'),
        },
        {
            id: 'docentes-store',
            metodo: 'POST',
            ruta: '/docentes',
            descripcion: 'Alta de docente',
            roles: 'administrador',
            esperado: 201,
            escritura: true,
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                const res = await pedir<Docente>(ctx, 'POST', '/docentes', {
                    body: {
                        first_name: 'Verificacion',
                        last_name: marca,
                        dni: dniDocente,
                        telephone: '3510000000',
                        fecha_ingreso: '01/03/2024',
                        curso_division_turno_id: ctx.arbol.cdt.id,
                    },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.docente = res.data.id;
                }

                return res;
            },
        },
        {
            id: 'docentes-show',
            metodo: 'GET',
            ruta: '/docentes/{id}',
            descripcion: 'Detalle de un docente',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/docentes/${ctx.arbol.docente.id}`),
        },
        {
            id: 'docentes-update',
            metodo: 'PUT',
            ruta: '/docentes/{id}',
            descripcion: 'Actualización de docente',
            roles: 'administrador',
            esperado: 200,
            nota: 'Envía un cambio y después restaura el teléfono del seeder.',
            run: (ctx) =>
                updateYRestaurar<Docente>(
                    ctx,
                    `/docentes/${ctx.arbol.docente.id}`,
                    { telephone: '3511111111' },
                    { telephone: ctx.arbol.docente.telephone }
                ),
        },
        {
            id: 'docentes-destroy',
            metodo: 'DELETE',
            ruta: '/docentes/{id}',
            descripcion: 'Baja del docente creado por la verificación',
            roles: 'administrador',
            esperado: 204,
            escritura: true,
            run: (ctx) =>
                ctx.temporales.docente
                    ? pedir(ctx, 'DELETE', `/docentes/${ctx.temporales.docente}`)
                    : omitido('no se creó el docente temporal'),
        },
        {
            id: 'docentes-materias',
            metodo: 'GET',
            ruta: '/docentes/{id}/materias',
            descripcion: 'Materias a cargo del docente',
            roles: 'administrador, docente',
            esperado: 200,
            run: (ctx) =>
                ctx.tokenDocente
                    ? pedir(ctx, 'GET', `/docentes/${ctx.arbol.docente.id}/materias`, {
                          token: ctx.tokenDocente,
                      })
                    : pedir(ctx, 'GET', `/docentes/${ctx.arbol.docente.id}/materias`),
        },

        // ── Materias ──
        {
            id: 'materias-index',
            metodo: 'GET',
            ruta: '/materias',
            descripcion: 'Listado de materias',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', '/materias'),
        },
        {
            id: 'materias-store',
            metodo: 'POST',
            ruta: '/materias',
            descripcion: 'Alta de materia con curso y docente',
            roles: 'administrador',
            esperado: 201,
            escritura: true,
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                const res = await pedir<Materia>(ctx, 'POST', '/materias', {
                    body: {
                        nombre: `Verificacion ${marca}`,
                        descripcion: 'Materia temporal de la verificación.',
                        curso_division_turno_id: ctx.arbol.cdt.id,
                        docente_id: ctx.arbol.docente.id,
                    },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.materia = res.data.id;
                }

                return res;
            },
        },
        {
            id: 'materias-show',
            metodo: 'GET',
            ruta: '/materias/{id}',
            descripcion: 'Detalle de una materia',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/materias/${ctx.arbol.materia.id}`),
        },
        {
            id: 'materias-update',
            metodo: 'PUT',
            ruta: '/materias/{id}',
            descripcion: 'Actualización de materia',
            roles: 'administrador',
            esperado: 200,
            nota: 'Envía un cambio y después restaura la descripción del seeder.',
            run: (ctx) =>
                updateYRestaurar<Materia>(
                    ctx,
                    `/materias/${ctx.arbol.materia.id}`,
                    { descripcion: 'Actualizada' },
                    { descripcion: ctx.arbol.materia.descripcion }
                ),
        },
        {
            id: 'materias-destroy',
            metodo: 'DELETE',
            ruta: '/materias/{id}',
            descripcion: 'Baja de la materia creada por la verificación',
            roles: 'administrador',
            esperado: 204,
            escritura: true,
            run: (ctx) =>
                ctx.temporales.materia
                    ? pedir(ctx, 'DELETE', `/materias/${ctx.temporales.materia}`)
                    : omitido('no se creó la materia temporal'),
        },

        // ── Inscripciones ──
        {
            id: 'inscripciones-index',
            metodo: 'GET',
            ruta: '/inscripciones',
            descripcion: 'Listado de inscripciones',
            roles: 'administrador, alumno',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', '/inscripciones'),
        },
        {
            id: 'inscripciones-index-filtro',
            metodo: 'GET',
            ruta: '/inscripciones?estado=aprobado',
            descripcion: 'Listado de inscripciones filtrado por estado',
            roles: 'administrador, alumno',
            esperado: 200,
            run: (ctx) =>
                pedir(ctx, 'GET', '/inscripciones', { query: { estado: 'aprobado' } }),
        },
        {
            id: 'inscripciones-store',
            metodo: 'POST',
            ruta: '/inscripciones',
            descripcion: 'Inscripción de un alumno en una materia',
            roles: 'administrador, alumno',
            esperado: 201,
            escritura: true,
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                const res = await pedir<Inscripcion>(ctx, 'POST', '/inscripciones', {
                    body: {
                        alumno_id: ctx.arbol.alumno.id,
                        materia_id: ctx.arbol.materia.id,
                    },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.inscripcion = res.data.id;
                }

                return res;
            },
        },
        {
            id: 'inscripciones-show',
            metodo: 'GET',
            ruta: '/inscripciones/{id}',
            descripcion: 'Detalle de una inscripción',
            roles: 'administrador, alumno',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/inscripciones/${ctx.arbol.inscripcion.id}`),
        },
        {
            id: 'inscripciones-by-alumno',
            metodo: 'GET',
            ruta: '/alumnos/{id}/inscripciones',
            descripcion: 'Inscripciones de un alumno',
            roles: 'administrador, alumno',
            esperado: 200,
            run: (ctx) =>
                pedir(ctx, 'GET', `/alumnos/${ctx.arbol.alumno.id}/inscripciones`),
        },
        {
            id: 'inscripciones-by-alumno-filtro',
            metodo: 'GET',
            ruta: '/alumnos/{id}/inscripciones?estado=',
            descripcion: 'Inscripciones de un alumno filtradas por estado',
            roles: 'administrador, alumno',
            esperado: 200,
            run: (ctx) =>
                pedir(ctx, 'GET', `/alumnos/${ctx.arbol.alumno.id}/inscripciones`, {
                    query: { estado: 'aprobado' },
                }),
        },
        {
            id: 'inscripciones-by-materia',
            metodo: 'GET',
            ruta: '/materias/{id}/inscripciones',
            descripcion: 'Inscripciones de una materia',
            roles: 'administrador, docente',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/materias/${ctx.arbol.materia.id}/inscripciones`),
        },
        {
            id: 'inscripciones-estado',
            metodo: 'PUT',
            ruta: '/inscripciones/{id}/estado',
            descripcion: 'Cambio de estado de una inscripción',
            roles: 'administrador, docente',
            esperado: 200,
            escritura: true,
            nota: 'Sólo se prueba sobre la inscripción que crea la corrida, para no cambiar el estado de los datos del seeder.',
            run: (ctx) =>
                ctx.temporales.inscripcion
                    ? pedir(ctx, 'PUT', `/inscripciones/${ctx.temporales.inscripcion}/estado`, {
                          body: { estado: 'pendiente' satisfies EstadoInscripcion },
                      })
                    : omitido('no se creó la inscripción temporal'),
        },
        {
            id: 'inscripciones-destroy',
            metodo: 'DELETE',
            ruta: '/inscripciones/{id}',
            descripcion: 'Baja de la inscripción creada por la verificación',
            roles: 'administrador',
            esperado: 204,
            escritura: true,
            run: (ctx) =>
                ctx.temporales.inscripcion
                    ? pedir(ctx, 'DELETE', `/inscripciones/${ctx.temporales.inscripcion}`)
                    : omitido('no se creó la inscripción temporal'),
        },

        // ── Tutores ──
        {
            id: 'tutores-index',
            metodo: 'GET',
            ruta: '/tutores',
            descripcion: 'Listado de tutores',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', '/tutores'),
        },
        {
            id: 'tutores-store',
            metodo: 'POST',
            ruta: '/tutores',
            descripcion: 'Alta directa de tutor por el administrador',
            roles: 'administrador',
            esperado: 201,
            escritura: true,
            nota: 'Alta directa del admin: no consume código institucional, el email queda como username.',
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                const res = await pedir<Tutor>(ctx, 'POST', '/tutores', {
                    body: {
                        first_name: 'Verificacion',
                        last_name: 'TutorDirecto',
                        dni: dniTutor,
                        telephone: '3514444444',
                        email: `verif_${marca.toLowerCase()}_directo@test.com`,
                        password: pass,
                    },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.tutores.push(res.data.id);
                }

                return res;
            },
        },
        {
            id: 'tutores-show',
            metodo: 'GET',
            ruta: '/tutores/{id}',
            descripcion: 'Detalle de un tutor',
            roles: 'administrador, tutor',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/tutores/${ctx.arbol.tutor.id}`),
        },
        {
            id: 'tutores-show-como-tutor',
            metodo: 'GET',
            ruta: '/tutores/{id}',
            descripcion: 'Un tutor puede ver su propio detalle',
            roles: 'tutor',
            esperado: 200,
            nota: 'Verifica que el apiResource de tutores no tape la ruta de detalle por roles.',
        run: (ctx) =>
                ctx.tokenTutor
                    ? pedir(ctx, 'GET', `/tutores/${ctx.arbol.tutor.id}`, { token: ctx.tokenTutor })
                    : omitido('sin sesión de tutor'),
        },
        {
            id: 'tutores-update',
            metodo: 'PUT',
            ruta: '/tutores/{id}',
            descripcion: 'Actualización de tutor',
            roles: 'administrador',
            esperado: 200,
            nota: 'Envía un cambio y después restaura el teléfono del seeder.',
            run: (ctx) =>
                updateYRestaurar<Tutor>(
                    ctx,
                    `/tutores/${ctx.arbol.tutor.id}`,
                    { telephone: '3512222222' },
                    { telephone: ctx.arbol.tutor.telephone }
                ),
        },
        {
            id: 'tutores-destroy',
            metodo: 'DELETE',
            ruta: '/tutores/{id}',
            descripcion: 'Baja del tutor registrado por la verificación',
            roles: 'administrador',
            esperado: 204,
            escritura: true,
            run: (ctx) =>
                ctx.temporales.tutores.length
                    ? pedir(ctx, 'DELETE', `/tutores/${ctx.temporales.tutores[0]}`)
                    : omitido('no se registró ningún tutor temporal'),
        },
        {
            id: 'tutores-dni',
            metodo: 'GET',
            ruta: '/tutores/dni/{dni}',
            descripcion: 'Búsqueda de tutor por DNI',
            roles: 'administrador, tutor',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/tutores/dni/${ctx.arbol.tutor.dni}`),
        },
        {
            id: 'tutores-alumnos',
            metodo: 'GET',
            ruta: '/tutores/{id}/alumnos',
            descripcion: 'Alumnos a cargo del tutor',
            roles: 'administrador, tutor',
            esperado: 200,
            nota: 'Arma la respuesta recorriendo los vínculos tutor_alumno del tutor.',
            run: (ctx) => pedir(ctx, 'GET', `/tutores/${ctx.arbol.tutor.id}/alumnos`),
        },

        // ── Administradores ──
        {
            id: 'admins-estadisticas',
            metodo: 'GET',
            ruta: '/admins/estadisticas',
            descripcion: 'Totales de alumnos y tutores',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', '/admins/estadisticas'),
        },
        {
            id: 'admins-index',
            metodo: 'GET',
            ruta: '/admins',
            descripcion: 'Listado de administradores',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', '/admins'),
        },
        {
            id: 'admins-show',
            metodo: 'GET',
            ruta: '/admins/{id}',
            descripcion: 'Detalle de un administrador',
            roles: 'administrador',
            esperado: 200,
            run: (ctx) => pedir(ctx, 'GET', `/admins/${ctx.arbol.admin.id}`),
        },
        {
            id: 'admins-store',
            metodo: 'POST',
            ruta: '/admins',
            descripcion: 'Alta de administrador',
            roles: 'administrador',
            esperado: 201,
            escritura: true,
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                const res = await pedir<{ id: string }>(ctx, 'POST', '/admins', {
                    body: {
                        first_name: 'Verificacion',
                        last_name: marca,
                        username: `verif_${marca.toLowerCase()}_adm`,
                        password: pass,
                    },
                });

                if (res.status === 201 && res.data?.id) {
                    ctx.temporales.admins.push(res.data.id);
                }

                return res;
            },
        },
        {
            id: 'admins-update',
            metodo: 'PUT',
            ruta: '/admins/{id}',
            descripcion: 'Actualización de administrador',
            roles: 'administrador',
            esperado: 200,
            nota: 'Envía un cambio y después restaura el nombre del seeder.',
            run: (ctx) =>
                updateYRestaurar<Admin>(
                    ctx,
                    `/admins/${ctx.arbol.admin.id}`,
                    { first_name: 'Verificacion' },
                    { first_name: ctx.arbol.admin.first_name }
                ),
        },
        {
            id: 'admins-destroy',
            metodo: 'DELETE',
            ruta: '/admins/{id}',
            descripcion: 'Baja de un administrador creado por la verificación',
            roles: 'administrador',
            esperado: 204,
            escritura: true,
            nota: 'Baja la cuenta temporal creada en admins-store, sin tocar el admin del seeder.',
            run: async (ctx) => {
                if (!ctx.escribir) {
                    return requiereEscritura();
                }

                const res = await pedir<{ id: string }>(ctx, 'POST', '/admins', {
                    body: {
                        first_name: 'Baja',
                        last_name: marca,
                        username: `verif_${marca.toLowerCase()}_baja`,
                        password: pass,
                    },
                });

                if (res.status !== 201 || !res.data?.id) {
                    return res;
                }

                ctx.temporales.admins.push(res.data.id);

                return pedir(ctx, 'DELETE', `/admins/${res.data.id}`);
            },
        },

        // ── Control de permisos ──
        {
            id: 'permiso-sin-token',
            metodo: 'GET',
            ruta: '/alumnos',
            descripcion: 'Sin token la API responde 401',
            roles: 'público',
            esperado: 401,
            run: (ctx) => pedir(ctx, 'GET', '/alumnos', { token: null }),
        },
        {
            id: 'permiso-docente-materias',
            metodo: 'POST',
            ruta: '/materias',
            descripcion: 'Un docente no puede crear materias',
            roles: 'docente',
            esperado: 403,
            run: (ctx) =>
                ctx.tokenDocente
                    ? pedir(ctx, 'POST', '/materias', {
                          token: ctx.tokenDocente,
                          body: {
                              nombre: 'No deberia crearse',
                              descripcion: 'Control de permisos',
                              curso_division_turno_id: ctx.arbol.cdt.id,
                              docente_id: ctx.arbol.docente.id,
                          },
                      })
                    : omitido('no se pudo iniciar sesión como docente'),
        },
        {
            id: 'permiso-alumno-docentes',
            metodo: 'GET',
            ruta: '/docentes',
            descripcion: 'Un alumno no puede listar docentes',
            roles: 'alumno',
            esperado: 403,
            run: (ctx) =>
                ctx.tokenAlumno
                    ? pedir(ctx, 'GET', '/docentes', { token: ctx.tokenAlumno })
                    : omitido('no se pudo iniciar sesión como alumno'),
        },
        {
            id: 'permiso-tutor-admins',
            metodo: 'GET',
            ruta: '/admins',
            descripcion: 'Un tutor no puede listar administradores',
            roles: 'tutor',
            esperado: 403,
            run: (ctx) =>
                ctx.tokenTutor
                    ? pedir(ctx, 'GET', '/admins', { token: ctx.tokenTutor })
                    : omitido('no se pudo iniciar sesión como tutor'),
        },
    ];
}

/** Ejecuta la matriz en orden y devuelve un resultado por check. */
export async function ejecutarVerificacion(
    ctx: ContextoVerificacion,
    checks: EndpointCheck[],
    onProgress?: (resultado: CheckResult, index: number, total: number) => void
): Promise<ResultadoCorrida> {
    const startedAt = Date.now();
    const results: CheckResult[] = [];

    for (const [index, check] of checks.entries()) {
        const inicio = Date.now();

        let status: number;
        let detalle: string | undefined;

        try {
            const res = await check.run(ctx);
            status = res.status;
            detalle = res.detalle;
        } catch (error) {
            status = 0;
            detalle = error instanceof Error ? error.message : 'Error inesperado';
        }

        const estado: CheckEstado =
            status === OMITIDO ? 'omitido' : status === check.esperado ? 'ok' : 'fallo';

        const resultado: CheckResult = {
            id: check.id,
            metodo: check.metodo,
            ruta: check.ruta,
            descripcion: check.descripcion,
            roles: check.roles,
            nota: check.nota,
            esperado: check.esperado,
            estado,
            status: status === OMITIDO ? null : status,
            detalle,
            duracionMs: Date.now() - inicio,
        };

        results.push(resultado);
        onProgress?.(resultado, index, checks.length);
    }

    const ok = results.filter((r) => r.estado === 'ok').length;
    const omitidos = results.filter((r) => r.estado === 'omitido').length;

    return {
        checks: results,
        totales: {
            total: results.length,
            ok,
            fallos: results.length - ok - omitidos,
            omitidos,
        },
        startedAt,
        finishedAt: Date.now(),
    };
}

/**
 * Borra lo que quedó de la corrida. Sólo intenta lo que la propia corrida creó.
 */
export async function limpiarTemporales(ctx: ContextoVerificacion): Promise<string[]> {
    const borrados: string[] = [];

    const intentar = async (ruta: string, etiqueta: string) => {
        const res = await pedir(ctx, 'DELETE', ruta);

        if (res.status === 204 || res.status === 200) {
            borrados.push(etiqueta);
        }
    };

    if (ctx.temporales.inscripcion) {
        await intentar(`/inscripciones/${ctx.temporales.inscripcion}`, 'inscripción');
    }

    if (ctx.temporales.materia) {
        await intentar(`/materias/${ctx.temporales.materia}`, 'materia');
    }

    if (ctx.temporales.alumno) {
        await intentar(`/alumnos/${ctx.temporales.alumno}`, 'alumno');
    }

    if (ctx.temporales.docente) {
        await intentar(`/docentes/${ctx.temporales.docente}`, 'docente');
    }

    if (ctx.temporales.cdt) {
        await intentar(`/cursoDivisionTurno/${ctx.temporales.cdt}`, 'curso');
    }

    for (const tutor of ctx.temporales.tutores) {
        await intentar(`/tutores/${tutor}`, `tutor ${tutor.slice(0, 8)}`);
    }

    for (const admin of ctx.temporales.admins) {
        await intentar(`/admins/${admin}`, `administrador ${admin.slice(0, 8)}`);
    }

    return borrados;
}
