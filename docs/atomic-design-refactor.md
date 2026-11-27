# Refactor: Arquitectura Atómica

## ¿Qué se hizo?

Se migró toda la base de código de una arquitectura **monolítica por pantalla** a **Atomic Design**, una metodología que organiza los componentes en niveles de complejidad creciente.

---

## Rama de trabajo

```
refactor/atomic-design
```

Creada desde `feature/register` con:

```bash
git checkout -b refactor/atomic-design
```

---

## Estructura anterior vs nueva

### Antes (Monolítica)

```
components/
├── PrimaryButton.tsx
├── OutlinedButton.tsx
└── CustomInput.tsx

app/
├── index.tsx         ← Login con todo inline
├── register.tsx      ← Register con todo inline
└── (tutor)/
    └── index.tsx     ← Dashboard de 425 líneas (datos + estado + JSX + estilos)
```

### Ahora (Atomic Design)

```
components/
├── atoms/
│   ├── PrimaryButton.tsx
│   ├── OutlinedButton.tsx
│   └── CustomInput.tsx
│
├── molecules/
│   ├── AlumnoPill.tsx
│   ├── InfoCard.tsx
│   └── ActividadItem.tsx
│
└── organisms/
    ├── DashboardHeader.tsx
    ├── AlumnosSelector.tsx
    ├── InfoGrid.tsx
    └── ActividadesList.tsx

app/
├── _layout.tsx        ← SafeAreaProvider + ThemeProvider + rutas
├── index.tsx          ← Login: solo estado + composición de atoms
├── register.tsx       ← Register: solo estado + composición de atoms
└── (tutor)/
    ├── _layout.tsx    ← Stack sin header
    └── index.tsx      ← Dashboard: solo datos + estado + composición de organisms
```

---

## Descripción de cada nivel

### Átomos (`components/atoms/`)

Son los componentes más pequeños e indivisibles. No conocen nada del negocio.

| Archivo | Descripción |
|---|---|
| `PrimaryButton.tsx` | Botón con fondo sólido, soporte para loading state |
| `OutlinedButton.tsx` | Botón con borde, sin fondo |
| `CustomInput.tsx` | Input con ícono izquierdo, label flotante y toggle de contraseña |

### Moléculas (`components/molecules/`)

Combinan 2 o más átomos para cumplir una función visual específica.

| Archivo | Descripción | Átomos que usa |
|---|---|---|
| `AlumnoPill.tsx` | Chip seleccionable de alumno con estado activo/inactivo | `TouchableOpacity`, `Text` |
| `InfoCard.tsx` | Tarjeta de la grilla 2×2 con ícono, valor numérico, título y subtítulo | `MaterialIcons`, `Text` |
| `ActividadItem.tsx` | Fila de actividad con ícono coloreado, materia, tipo, fecha y flecha | `MaterialIcons`, `Text` |

### Organismos (`components/organisms/`)

Secciones completas de la interfaz que combinan moléculas.

| Archivo | Descripción | Moléculas que usa |
|---|---|---|
| `DashboardHeader.tsx` | Encabezado con logo, saludo dinámico, ícono de notificaciones y avatar con inicial | Ninguna (usa RN primitivos) |
| `AlumnosSelector.tsx` | Scroll horizontal con título "Mis Alumnos" y lista de chips | `AlumnoPill` |
| `InfoGrid.tsx` | Grilla de 2 columnas con título "Resumen" y tarjetas | `InfoCard` |
| `ActividadesList.tsx` | Lista vertical con título "Próximas Actividades" y filas | `ActividadItem` |

---

## Cambios en las pantallas (`app/`)

### `app/_layout.tsx`
- Se agregó `SafeAreaProvider` de `react-native-safe-area-context` para que `SafeAreaView` funcione correctamente en todas las pantallas.
- Se registró la ruta `(tutor)` y `register` en el Stack.

### `app/index.tsx` (Login)
- Se actualizaron los imports para apuntar a `@/components/atoms/` en lugar de `@/components/`.
- Se corrigió la navegación: `router.push('/(tutor)')` (sin `/index` al final, que es implícito en Expo Router).

### `app/register.tsx` (Registro)
- Se actualizaron los imports para apuntar a `@/components/atoms/`.
- Limpieza de código: se eliminaron comentarios y se estandarizó el estilo de comillas.

### `app/(tutor)/index.tsx` (Dashboard Tutor)
- Reducido de 425 líneas a ~90 líneas.
- Los datos mock (`alumnos`, `infoCards`, `actividades`) se declaran como constantes fuera del componente.
- El componente solo tiene el estado `alumnoSeleccionado` y compone organismos.
- El FAB y la BottomBar permanecen inline en la pantalla por ser elementos de navegación únicos de esta vista.

---

## Principios aplicados

### 1. Separación de responsabilidades
Cada nivel tiene una única responsabilidad:
- **Átomo** → renderizar un elemento visual primitivo.
- **Molécula** → combinar primitivos para una función visual.
- **Organismo** → componer moléculas en una sección de UI.
- **Página** → orquestar datos, estado y organismos.

### 2. Código limpio (Clean Code)
- Sin comentarios en el código.
- Nombres de variables y funciones descriptivos en español.
- Una responsabilidad por función/componente.
- `StyleSheet.create` siempre fuera del componente (nivel módulo).

### 3. Tipado estricto (TypeScript)
- Cada componente define una `interface` con sus props.
- El literal `as const` se usa en los íconos para que TypeScript valide que el nombre del ícono existe en `MaterialIcons`.
- Props opcionales marcadas con `?`.

### 4. Reutilización
Ahora `InfoCard` puede usarse en cualquier pantalla futura sin copiar código. Lo mismo aplica para `AlumnoPill`, `ActividadItem` y todos los átomos.

---

## Regla para componentes nuevos

Al agregar un componente nuevo, preguntarse:

1. ¿Es un elemento solo? → Va en `atoms/`
2. ¿Combina 2+ elementos con una función clara? → Va en `molecules/`
3. ¿Es una sección completa de la pantalla? → Va en `organisms/`
4. ¿Es una pantalla completa? → Va en `app/`
