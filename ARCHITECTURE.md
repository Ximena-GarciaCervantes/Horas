# 🏗️ Arquitectura del Sistema HORAS

## Visión General

```
┌─────────────────────────────────────────────────────┐
│                  HORAS Dashboard                     │
│              (Next.js 14 + React 18)               │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌─────▼────┐    ┌───▼─────┐
    │  Vercel │    │ Supabase │    │ Browser │
    │ (Host)  │    │  (Auth)  │    │ Storage │
    └────┬────┘    └─────┬────┘    └───┬─────┘
         │               │             │
         └───────────────┼─────────────┘
                         │
              ┌──────────▼─────────┐
              │  PostgreSQL DB     │
              │  (Supabase Cloud)  │
              └────────────────────┘
```

---

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 con TypeScript
- **Estilos**: Tailwind CSS
- **Exportación**: jsPDF, html2canvas, docx
- **Iconos**: Lucide React

### Backend
- **Auth**: Supabase Auth (JWT)
- **Database**: PostgreSQL en Supabase
- **API**: Next.js API Routes (si es necesario)
- **ORM**: Queries directas Supabase JS

### Deploy
- **Hosting**: Vercel
- **CI/CD**: Git automático
- **SSL**: Incluido en Vercel

---

## Estructura de Carpetas

```
horas/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Layout raíz
│   │   ├── page.tsx              # Home → /login
│   │   ├── globals.css           # Estilos globales
│   │   ├── error.tsx             # Error page
│   │   ├── login/
│   │   │   └── page.tsx          # Página de login
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard principal
│   │
│   ├── components/               # React Components
│   │   ├── MachineTabs.tsx       # Pestañas RK1-RK4
│   │   ├── HeaderBoard.tsx       # Formulario encabezado
│   │   ├── ProductionTable.tsx   # Tabla por horas
│   │   ├── ProblemsSection.tsx   # Incidencias
│   │   ├── KPISection.tsx        # KPIs visibles
│   │   └── ExportSection.tsx     # PDF/Word export
│   │
│   ├── lib/                      # Funciones auxiliares
│   │   ├── supabase.ts           # Cliente Supabase
│   │   ├── database.ts           # Queries DB
│   │   └── utils.ts              # Helpers
│   │
│   ├── types/                    # TypeScript types
│   │   └── index.ts              # Todas las interfaces
│   │
│   └── middleware.ts             # Protección de rutas
│
├── public/                       # Assets estáticos
├── package.json                  # Dependencias
├── next.config.js                # Config Next.js
├── tailwind.config.ts            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
├── setup.sql                     # Script SQL inicial
├── seed-users.sql                # Datos de prueba
├── SETUP_GUIDE.md                # Guía de setup completa
├── README.md                     # Documentación
└── vercel.json                   # Config Vercel

```

---

## Flujo de Autenticación

```
User Visits App
    │
    ├─→ Middleware checks session
    │       │
    │       ├─→ Session exists? → Go to /dashboard
    │       └─→ No session? → Go to /login
    │
    ├─→ Login Page
    │       │
    │       ├─→ User submits email + password
    │       └─→ Supabase Auth validates
    │
    ├─→ Auth Success
    │       │
    │       ├─→ Get User Profile (from users table)
    │       ├─→ Check assigned_rks
    │       └─→ Redirect to /dashboard
    │
    └─→ Dashboard
            │
            ├─→ Load board for first assigned RK
            ├─→ Show only accessible machines
            └─→ User can switch between RKs
```

---

## Flujo de Datos de Producción

```
1. User enters production data
   ├─→ Edit Plan/Actual for hour
   │
2. Component calculates:
   ├─→ Accumulated Plan = sum(plans) up to hour
   ├─→ Accumulated Actual = sum(actuals) up to hour
   ├─→ Efficiency Hour = (actual / plan) * 100
   └─→ Efficiency Accumulated = (acc_actual / acc_plan) * 100
   │
3. Auto-save triggered (debounce 700ms)
   ├─→ Save to Supabase via upsertHourlyData()
   │
4. Update state in component
   ├─→ Re-render with new values
   │
5. Recalculate KPIs
   ├─→ Total Plan/Actual
   ├─→ Total Efficiency
   ├─→ Goal Achievement
   ├─→ Total Lost Minutes
   └─→ Goal Difference
```

---

## Base de Datos - Esquema

### users
```
id (UUID, PK)
email (string, unique)
name (string)
role (enum: admin, supervisor, leader)
assigned_rks (array of strings: RK1-RK4)
created_at (timestamp)
updated_at (timestamp)
```

### production_boards
```
id (UUID, PK)
machine_code (enum: RK1-RK4)
date (date, unique with machine_code)
leader_id (FK → users)
leader_name (string)
supervisor_name (string)
shift (enum: 1, 2, 3)
model (string)
daily_goal (integer)
created_at (timestamp)
updated_at (timestamp)
created_by (FK → users)
```

### hourly_production
```
id (UUID, PK)
board_id (FK → production_boards)
hour (0-23)
plan (integer)
actual (integer)
accumulated_plan (integer)
accumulated_actual (integer)
efficiency_hour (decimal)
efficiency_accumulated (decimal)
created_at (timestamp)
updated_at (timestamp)
```

### problems
```
id (UUID, PK)
board_id (FK → production_boards)
hour (0-23)
description (text)
minutes_lost (integer)
responsible (string)
corrective_action (text)
created_at (timestamp)
updated_at (timestamp)
```

---

## Row Level Security (RLS)

### Políticas

**users**
- SELECT: Solo el usuario puede ver su perfil
- UPDATE: Solo el usuario puede actualizar su perfil

**production_boards**
- SELECT: Líder solo su tablero, Admin ve todos
- INSERT: Solo el líder asignado
- UPDATE: Líder o Admin

**hourly_production**
- SELECT/INSERT/UPDATE: Solo para tableros accesibles

**problems**
- SELECT/INSERT/DELETE: Solo para tableros accesibles

---

## Cálculos Automáticos

### Eficiencia por Hora
```
efficiency_hour = (actual / plan) * 100
```
- Si plan = 0: efficiency = 0
- Color verde: ≥ 95%
- Color amarillo: 80-94%
- Color rojo: < 80%

### Eficiencia Acumulada
```
efficiency_acum = (sum_actual / sum_plan) * 100
```
Misma lógica que por hora

### Cumplimiento vs Meta
```
goal_achievement = (total_actual / daily_goal) * 100
goal_difference = total_actual - daily_goal
```

### NSR (No Datos de Reanudación)
- Muestra "NSR" si no hay dato en la primera hora
- Indica que todavía no hay producción registrada

---

## Componentes - Responsabilidades

### MachineTabs
- Mostrar pestañas de máquinas disponibles
- Permitir cambio de máquina
- Indicar máquina activa

### HeaderBoard
- Mostrar/editar fecha, líder, supervisor, turno, modelo, meta
- Mostrar estado de guardado (Guardando, Guardado, Error)
- Auto-save con debounce

### ProductionTable
- Tabla de horas (6:00-19:00)
- Inputs editables plan/actual
- Cálculos automáticos acumulados
- Eficiencia con colores

### ProblemsSection
- Formulario para agregar incidencias
- Lista de incidencias existentes
- Botón eliminar con confirmación

### KPISection
- 6 KPIs en cards coloreadas
- Total Plan/Actual
- Cumplimiento, Eficiencia
- Minutos Perdidos, Diferencia Meta

### ExportSection
- Botón exportar PDF
- Botón exportar Word
- Captura contenido del tablero

---

## Guardado Automático

```javascript
// Debounce de 700ms
const autoSave = debounce(async () => {
  setSaveState('saving')
  try {
    const success = await updateBoard(board.id, formState)
    setSaveState(success ? 'saved' : 'error')
    setTimeout(() => setSaveState('idle'), 3000)
  } catch (error) {
    setSaveState('error')
  }
}, 700)

// Se dispara al cambiar cualquier campo
useEffect(() => {
  autoSave()
}, [formState, autoSave])
```

**Flujo:**
1. Usuario edita campo
2. Se espera 700ms sin cambios
3. Se envía a Supabase
4. Muestra "Guardando..."
5. Después de éxito, muestra "Guardado"
6. Se limpia el estado después de 3 segundos

---

## Decisiones de Diseño

### Por qué Next.js 14 (App Router)?
- SSR nativo
- API Routes sin servidor separado
- Middleware para protección
- Mejor performance
- Fácil deployment en Vercel

### Por qué Supabase?
- PostgreSQL confiable
- Auth integrada con JWT
- RLS para seguridad
- Real-time capabilities
- Gratuito hasta ciertos límites
- API REST y GraphQL

### Por qué Tailwind CSS?
- Clases de utilidad
- Responsive por defecto
- Temas personalizables
- Archivo CSS mínimo
- No necesita componentes UI library

### Por qué TypeScript?
- Tipado fuerte
- Menos bugs en producción
- Mejor developer experience
- Documentación implícita
- Refactoring más seguro

---

## Escalabilidad

### Crecimiento Horizontal
- Agregar más RKs: Cambiar constantes, sin código
- Agregar más líderes: Crear usuarios, asignar RKs
- Múltiples plantas: Agregar tabla plants

### Crecimiento Vertical
- Agregar reportes por período
- Conectar con sistemas externos (ERP)
- Real-time dashboards con Supabase Realtime
- Alertas automáticas

---

## Seguridad

### En Frontend
- Validación de entrada
- Sanitización de datos
- No guardar credenciales

### En Supabase
- RLS en todas las tablas
- JWT tokens (automático)
- Encriptación de conexión

### En Vercel
- HTTPS automático
- Environment variables protegidas
- Build previews seguros

---

## Monitoring y Logs

### Dónde mirar si hay errores

**Frontend (Browser Console)**
```javascript
// Abre: F12 → Console
// Verás errores de Supabase, red, etc.
```

**Supabase Logs**
- Dashboard → Logs → Auth
- Dashboard → Logs → Database
- Dashboard → Logs → Edge Functions

**Vercel Logs**
- Deployments → Click en deployment
- Logs tab → Runtime logs

---

## Performance Optimizations

1. **Debounce Auto-save**: No guardar en cada keystroke
2. **Component Memoization**: Evitar re-renders innecesarios
3. **Lazy Loading**: Importar componentes bajo demanda
4. **Image Optimization**: Vercel optimiza automáticamente
5. **Database Indexes**: Creadas en setup.sql

---

## Próximas Mejoras

1. **Notificaciones Real-time**: Supabase Realtime
2. **Dark Mode**: Tailwind CSS built-in
3. **Gráficos**: Chart.js o Recharts
4. **Reportes Avanzados**: PDF con gráficos
5. **Mobile App**: React Native o Flutter
6. **Multi-idioma**: i18n support

---

Este documento sirve como referencia técnica para mantener, escalar y depurar el sistema.
