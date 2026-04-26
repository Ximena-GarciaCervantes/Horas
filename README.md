# HORAS - Sistema de Producción RK

Dashboard de producción para máquinas RK (RK1, RK2, RK3, RK4) con autenticación Supabase, control de acceso basado en roles y seguimiento de producción por hora.

## 🚀 Características

- **Multi-máquina**: Soporte para RK1, RK2, RK3, RK4
- **Autenticación Supabase**: Login seguro con roles (Admin, Supervisor, Líder)
- **Control de acceso**: Cada líder ve solo sus RKs asignadas
- **Tablero de producción**: 
  - Entrada de datos por hora (6:00-19:00)
  - Cálculos automáticos de acumulados y eficiencia
  - Validación de datos numéricos
  - Guardado automático con debounce
- **Seguimiento de problemas/incidencias**:
  - Descripción del problema
  - Minutos perdidos
  - Responsable y acción correctiva
- **KPIs visibles**:
  - Total plan y real del día
  - Cumplimiento y eficiencia
  - Diferencia contra meta
  - Minutos perdidos totales
- **Exportación**: PDF y Word del tablero
- **Estilos industriales**: Interfaz limpia estilo pizarrón
- **Responsiva**: Desktop, tablet y móvil

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta Supabase (gratuita)

## ⚙️ Setup

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En el SQL Editor, ejecuta el contenido de `setup.sql` para crear las tablas
3. Copia tus credenciales:
   - URL: `https://your-project.supabase.co`
   - Anon Key: `sb_anon_...`
   - Service Role Key: `sb_secret_...`

### 2. Crear Usuarios de Autenticación

En el Supabase Dashboard:
1. Ve a **Authentication → Users**
2. Crea nuevos usuarios (ej: alberto@jabil.com)
3. Nota los UUIDs generados

### 3. Inserttar Usuarios en Base de Datos

1. En el SQL Editor de Supabase, ejecuta `seed-users.sql`
2. **IMPORTANTE**: Reemplaza los UUIDs en `seed-users.sql` con los IDs reales de los usuarios auth

Ejemplo:
```sql
-- Reemplazar 'alberto-user-id' con el UUID real
INSERT INTO users (id, email, name, role, assigned_rks) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'alberto@jabil.com', 'Alberto', 'leader', ARRAY['RK1', 'RK2']::text[]);
```

### 4. Variables de Entorno

Crea `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_anon_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
DATABASE_URL=postgresql://...
```

### 5. Instalar Dependencias

```bash
npm install
```

### 6. Ejecutar Localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📦 Desplegar en Vercel

### Opción 1: CLI de Vercel

```bash
npm install -g vercel
vercel
```

### Opción 2: GitHub

1. Push a GitHub
2. En [vercel.com](https://vercel.com): Importa el repo
3. Añade variables de entorno en Settings
4. Deploy automático

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- Los líderes solo ven sus propias RKs
- Los supervisores ven todas
- Los datos se guardan automáticamente
- Sesiones de Supabase manejadas seguramente

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Home redirect
│   ├── globals.css         # Estilos globales
│   ├── login/
│   │   └── page.tsx        # Página de login
│   └── dashboard/
│       └── page.tsx        # Dashboard principal
├── components/
│   ├── MachineTabs.tsx     # Pestañas de máquinas
│   ├── HeaderBoard.tsx     # Encabezado editable
│   ├── ProductionTable.tsx # Tabla de producción
│   ├── ProblemsSection.tsx # Sección de problemas
│   ├── KPISection.tsx      # KPIs visibles
│   └── ExportSection.tsx   # Botones de exportación
├── lib/
│   ├── supabase.ts         # Cliente de Supabase
│   ├── database.ts         # Funciones de base de datos
│   └── utils.ts            # Funciones auxiliares
└── types/
    └── index.ts            # Tipos TypeScript
```

## 🔄 Flujo de Datos

1. **Login**: Usuario se autentica en Supabase
2. **Dashboard**: Se cargan datos del día de la máquina asignada
3. **Edición**: Usuario ingresa datos por hora
4. **Auto-save**: Guardado automático con debounce de 700ms
5. **Cálculos**: Acumulados y eficiencia se recalculan automáticamente
6. **Incidencias**: Se pueden agregar problemas con minutos perdidos
7. **Exportación**: PDF/Word para reportes

## 📱 Responsividad

- Desktop: Tabla completa con todas las columnas
- Tablet: Scroll horizontal si es necesario
- Móvil: Stack vertical adaptado

## 🎨 Colores

- Verde (#10b981): Cumplimiento ≥ 95%
- Rojo (#ef4444): Cumplimiento < 95%
- Amarillo: Cumplimiento 80-94%
- Gris (#6b7280): Sin datos
- Oscuro (#1f2937): Encabezados

## 📝 Notas Importantes

- Los acumulados se calculan automáticamente al editar cualquier celda
- Si plan o real están vacíos, muestra "NSR"
- El guardado es automático con debounce de 700ms
- Al recargar, se restaura el último estado guardado
- Cada RK tiene su propio tablero independiente

## 🐛 Troubleshooting

### "Not authenticated"
- Verifica que estés logueado en Supabase
- Limpia cookies y vuelve a intentar

### Variables de entorno no funcionan
- Asegúrate de tener `.env.local` en la raíz
- Reinicia el servidor `npm run dev`

### RLS bloqueando operaciones
- Verifica que el usuario está en la tabla `users`
- Comprueba que `assigned_rks` contiene la máquina correcta

### No aparecen datos guardados
- Revisa la consola del navegador para errores
- Verifica la conexión a Supabase
- Consulta los logs de Vercel si está deployado

## 📞 Soporte

Para problemas o sugerencias, contacta al equipo de desarrollo.

## 📄 Licencia

Privado - Jabil
