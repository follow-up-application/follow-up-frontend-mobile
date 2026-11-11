# Inventario de endpoints y estado de la API

Fuente: `follow-up-backend/routes/api.php` y `follow-up-backend/app/Interfaces/Http/User/Controllers/`.
Verificado contra la API local (`http://127.0.0.1:8000/api/v1`) con credenciales demo.
La pantalla **Verificar API** del panel admin ejecuta esta misma matriz en vivo.

Convenciones de la API:

- `POST /login` devuelve `{ token }`. Sanctum, header `Authorization: Bearer <token>`.
- `JsonResource::withoutWrapping()` está activo: las respuestas no llevan envelope `data`.
- Los roles se mandan como `administrador`, `docente`, `alumno`, `tutor`.
- Estados de inscripción: `pendiente`, `aprobado`, `rechazado`.
- Todos los `PUT` de recurso son **parciales**: se manda sólo lo que se quiere cambiar y el
  use case conserva el resto. Un body vacío responde 422.

## Matriz de verificación

Los checks marcados "escritura" sólo corren con el modo escritura activado.

| Check | Método | Ruta | Roles | Esperado | Resultado |
| --- | --- | --- | --- | --- | --- |
| login-ok | POST | /login | público | 200 | OK |
| login-mal | POST | /login | público | 422 | OK |
| users-store | POST | /users | público | 201 | OK (deja el usuario, ver notas) |
| validar-codigo | GET | /tutores/validarCodigo/{codigo} | público | 200 | OK |
| validar-codigo-inexistente | GET | /tutores/validarCodigo/{codigo} | público | 404 | OK |
| tutores-register | POST | /tutores/register | público | 201 | OK (consume el código) |
| admins-register | POST | /admins/register | público | 201 | OK |
| sesion-cuenta-temporal | POST | /admins | administrador | 201 | OK |
| password | PUT | /password | autenticado | 200 | OK |
| logout | POST | /logout | autenticado | 200 | OK |
| logout-token-revocado | POST | /logout | token revocado | 401 | OK |
| alumnos-index | GET | /alumnos | administrador, docente | 200 | OK |
| alumnos-store | POST | /alumnos | administrador, docente | 201 | OK |
| alumnos-show | GET | /alumnos/{id} | administrador, docente | 200 | OK |
| alumnos-show-como-alumno | GET | /alumnos/{id} | alumno | 200 | OK |
| alumnos-show-como-tutor | GET | /alumnos/{id} | tutor | 200 | OK |
| alumnos-update | PUT/PATCH | /alumnos/{id} | administrador, docente | 200 | OK |
| alumnos-destroy | DELETE | /alumnos/{id} | administrador, docente | 204 | OK |
| cdt-index | GET | /cursoDivisionTurno | administrador | 200 | OK |
| cdt-store | POST | /cursoDivisionTurno | administrador | 201 | OK |
| cdt-show | GET | /cursoDivisionTurno/{id} | administrador | 200 | OK |
| cdt-update | PUT/PATCH | /cursoDivisionTurno/{id} | administrador | 200 | OK |
| cdt-destroy | DELETE | /cursoDivisionTurno/{id} | administrador | 204 | OK |
| cdt-materias | GET | /cursoDivisionTurno/{id}/materias | administrador, docente | 200 | OK |
| docentes-index | GET | /docentes | administrador | 200 | OK |
| docentes-store | POST | /docentes | administrador | 201 | OK |
| docentes-show | GET | /docentes/{id} | administrador | 200 | OK |
| docentes-update | PUT/PATCH | /docentes/{id} | administrador | 200 | OK |
| docentes-destroy | DELETE | /docentes/{id} | administrador | 204 | OK |
| docentes-materias | GET | /docentes/{id}/materias | administrador, docente | 200 | OK |
| materias-index | GET | /materias | administrador | 200 | OK |
| materias-store | POST | /materias | administrador | 201 | OK |
| materias-show | GET | /materias/{id} | administrador | 200 | OK |
| materias-update | PUT/PATCH | /materias/{id} | administrador | 200 | OK |
| materias-destroy | DELETE | /materias/{id} | administrador | 204 | OK |
| inscripciones-index | GET | /inscripciones | administrador, alumno | 200 | OK |
| inscripciones-index-filtro | GET | /inscripciones?estado=aprobado | administrador, alumno | 200 | OK |
| inscripciones-store | POST | /inscripciones | administrador, alumno | 201 | OK |
| inscripciones-show | GET | /inscripciones/{id} | administrador, alumno | 200 | OK |
| inscripciones-by-alumno | GET | /alumnos/{id}/inscripciones | administrador, alumno | 200 | OK |
| inscripciones-by-alumno-filtro | GET | /alumnos/{id}/inscripciones?estado= | administrador, alumno | 200 | OK |
| inscripciones-by-materia | GET | /materias/{id}/inscripciones | administrador, docente | 200 | OK |
| inscripciones-estado | PUT | /inscripciones/{id}/estado | administrador, docente | 200 | OK |
| inscripciones-destroy | DELETE | /inscripciones/{id} | administrador | 204 | OK |
| tutores-index | GET | /tutores | administrador | 200 | OK |
| tutores-store | POST | /tutores | administrador | 201 | OK |
| tutores-store-login | POST | /login | tutor recién creado | 200 | OK |
| tutores-show | GET | /tutores/{id} | administrador | 200 | OK |
| tutores-show-como-tutor | GET | /tutores/{id} | tutor | 200 | OK |
| tutores-update | PUT/PATCH | /tutores/{id} | administrador | 200 | OK |
| tutores-destroy | DELETE | /tutores/{id} | administrador | 204 | OK |
| tutores-dni | GET | /tutores/dni/{dni} | administrador, tutor | 200 | OK |
| tutores-alumnos | GET | /tutores/{id}/alumnos | administrador, tutor | 200 | OK |
| admins-estadisticas | GET | /admins/estadisticas | administrador | 200 | OK |
| admins-index | GET | /admins | administrador | 200 | OK |
| admins-show | GET | /admins/{id} | administrador | 200 | OK |
| admins-store | POST | /admins | administrador | 201 | OK |
| admins-update | PUT/PATCH | /admins/{id} | administrador | 200 | OK |
| admins-destroy | DELETE | /admins/{id} | administrador | 204 | OK |
| permiso-sin-token | GET | /alumnos | público | 401 | OK |
| permiso-docente-materias | POST | /materias | docente | 403 | OK |
| permiso-alumno-docentes | GET | /docentes | alumno | 403 | OK |
| permiso-tutor-admins | GET | /admins | tutor | 403 | OK |

## Correcciones aplicadas en el backend

Todo lo que sigue estaba roto y se corrigió en `follow-up-backend`.

### 1. Métodos de controller que faltaban (500)

`apiResource` registraba `update` y `destroy`, pero los controllers no los implementaban, así
que Laravel exponía la ruta y fallaba al dispatchear. Se agregaron, cada uno con su
`Update…Request`, `Update…DTO` y `Update…UseCase`:

| Ruta | Método agregado |
| --- | --- |
| PUT/PATCH alumnos/{id} | `AlumnoController::update()` |
| PUT/PATCH docentes/{id} | `DocenteController::update()` |
| PUT/PATCH materias/{id} | `MateriaController::update()` |
| PUT/PATCH cursoDivisionTurno/{id} | `CursoDivisionTurnoController::update()` |
| PUT/PATCH tutores/{id} | `TutorController::update()` |
| PUT/PATCH admins/{id} | `AdminController::update()` |
| DELETE admins/{id} | `AdminController::destroy()` |
| POST tutores | `TutorController::store()` |
| GET tutores/{id}/alumnos | `TutorController::alumnos()` |
| POST logout | `AuthController::logout()` (estaba comentado) |
| PUT password | `AuthController::changePassword()` |

`CursoDivisionTurno` tiene todos sus campos `readonly`, así que `UpdateCDTUseCase` reconstruye
la entidad conservando el id y avisa el duplicado con `findByAttributes()`.

### 2. POST /users fallaba siempre

`CreateUserUseCase` pasaba `telephone` y `address` a un constructor de `User` que no los tiene
(`Unknown named parameter $telephone`). `CreateUserDTO` y `CreateUserRequest` se alinearon con
la tabla `users` y se agregó la validación de unicidad de `username` y `dni`.

### 3. Rutas sombreadas: el usuario no podía ver su propio detalle

Laravel matchea la primera ruta registrada, así que el `show` del `apiResource` tapaba a la ruta
generalizada por roles y el alumno o el tutor recibían 403 en su propio detalle. Fix:
`->except(['show'])` en los `apiResource` de `alumnos` y `tutores`.

### 4. DELETE /tutores dejaba el usuario huérfano

`EloquentTutorRepository::delete()` borraba la fila de `tutores`. El `cascadeOnDelete` de la
migración (`tutores.id` → `users.id`) sólo dispara borrando el padre, así que quedaba un
`users` con rol `tutor`, DNI, username y hash. Ahora borra el `users`, que cascadea a `tutores`.

### 5. GET /docentes mapeaba mal los campos y findByUsername consultaba una columna inexistente

`EloquentDocenteRepository::toDomain()` pasaba el hash de contraseña como `username` y el
username real como `telephone`, así que el listado de docentes exponía el hash. Además
`findByUsername()` consultaba `docentes.username`, columna que no existe, y por lo tanto el
login de un docente nunca encontraba al usuario. Corregidos ambos, y el mismo
`findByUsername()` de tutores.

`docenteUsername()` quedó en `types/docente.ts` como fallback, pero el listado ya devuelve el
username correcto.

### 6. El alta de tutor no guardaba el username

`EloquentTutorRepository::save()` no escribía la columna `username`, así que un tutor creado
por el administrador quedaba sin poder iniciar sesión. Ahora escribe `username`, que en el
caso del tutor es su email.

### 7. Cualquier guardado de un tutor le borraba la contraseña

`EloquentTutorRepository::toDomain()` reconstruía la entidad sin el hash: el constructor de
`Tutor` no lo recibe y deja `password` en `null`. Como `save()` escribe
`'password' => $tutor->password()`, un simple `PUT /tutores/{id}` terminaba guardando
`password = NULL` y el tutor se quedaba sin poder iniciar sesión. Se restauró el hash (y
`must_change_password`) en `toDomain()`.

### 8. Validaciones que no reflejaban el dominio (500 en vez de 422)

| Request | Antes | Ahora |
| --- | --- | --- |
| `CreateCDTRequest` | `curso`: `string`, `max:5` | `integer`, `min:1`, `max:7` |
| `CreateCDTRequest` | `division`: `string`, `max:5` | `regex:/^[A-Z]$/` |
| `CreateCDTRequest` | `turno`: `string`, `max:20` | `Rule::enum(TurnoEscolar::class)` |
| `CreateAlumnoRequest` | `relationship`: `string` | `Rule::enum(TutorAlumnoRelation::class)` |
| `CreateAlumnoRequest` | `required_if:relationship,OTRA` | `required_if:relationship,otra` |
| `CreateUserRequest` | sin reglas de `username`/`dni` | required, unique, min:8 |

`division` se normaliza a mayúscula en `prepareForValidation()`.

## Contratos que conviene conocer

- `POST /tutores` (administrador) es el alta directa: pide `first_name`, `last_name`, `dni`,
  `telephone`, `email` y opcionalmente `password`. No consume código institucional, que es lo
  que hace `POST /tutores/register`. Sin password usa el DNI, como el resto de la app.
- El email del tutor es su `username`.
- `curso` es el **año** (1..7), no el número de curso.
- `division` es una sola letra mayúscula.
- `turno` es `Mañana` o `Tarde` con acento.
- `relationship` va en minúscula: `padre`, `madre`, `otra`.
- Username de docente: `DOC-{dni}-{año de fecha_ingreso}`.
- Username de alumno: `EST-{dni}-{año de fecha_ingreso}`.
- Contraseña de los roles del seeder: el DNI.

## Sesión y efectos secundarios

- `LoginUserUseCase` borra todos los tokens del usuario antes de crear el nuevo, así que
  cada login deja sin sesión a los demás dispositivos. La corrida de verificación renueva
  el token del admin y la pantalla lo vuelve a guardar en SecureStore.
- `PUT /password` hashea la contraseña y deja `must_change_password` en `false`. Acepta
  `password_confirmation` si viene, y la exige coincidente.
- `POST /users` no tiene contraparte de borrado: ese check deja un usuario en la base. Para
  volver al estado inicial hay que correr `php artisan migrate:fresh --seed`.
- La corrida borra todo lo que crea: alumnos, docentes, materias, cursos, inscripciones,
  tutores (incluido el que genera `POST /alumnos`) y administradores temporales.
- Los checks de `PUT` apuntan a registros del seeder, pero mandan el valor original después
  de la prueba, así que la base queda como estaba.