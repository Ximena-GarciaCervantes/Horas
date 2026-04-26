# 📋 Guía Completa de Setup - HORAS

## 🎯 Objetivo
Configurar el dashboard de producción HORAS con autenticación Supabase, control de acceso por líder y deployment en Vercel.

---

## PASO 1: Preparar Supabase

### 1.1 Crear Proyecto Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz click en "Start your project" o "New project"
3. **Project name**: `Horas Production` (o similar)
4. **Database Password**: `hora-x-jabil` (usa la que ya tienes)
5. **Region**: Selecciona la más cercana a ti (ej: us-west-2 para Americas)
6. Espera a que se cree (puede tomar 2-3 minutos)

### 1.2 Obtener Credenciales

Una vez creado el proyecto:

1. **URL y Keys**: Ve a Settings → API
   - Copia `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copia `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copia `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

2. **Database URL**: Ve a Settings → Database
   - Copia la URL de "Transaction Pooler" → `DATABASE_URL`

---

## PASO 2: Crear Estructura de Base de Datos

### 2.1 Ejecutar Script SQL

1. En Supabase Dashboard, ve a **SQL Editor**
2. Haz click en "New query"
3. Abre el archivo `setup.sql` de tu proyecto
4. Copia TODO el contenido
5. Pégalo en el editor SQL de Supabase
6. Haz click en "Run" ▶️

**Debería mostrar "Success"** en verde si todo está bien.

---

## PASO 3: Crear Usuarios de Autenticación

### 3.1 Crear usuario Alberto (Líder con RK1 y RK2)

1. En Supabase Dashboard, ve a **Authentication → Users**
2. Haz click en "Add user"
3. Llena el formulario:
   - **Email**: `alberto@jabil.com`
   - **Password**: `password` (o la que quieras)
   - Haz click en "Create user"
4. **Anota el UUID** que aparece (ejemplo: `550e8400-e29b-41d4-a716-446655440000`)

### 3.2 Crear más usuarios (Opcional)

Repite el proceso para:
- `carlos@jabil.com` (Líder RK3)
- `maria@jabil.com` (Líder RK4)
- `supervisor@jabil.com` (Supervisor todas)
- `admin@jabil.com` (Admin todas)

**Anota TODOS los UUIDs**

---

## PASO 4: Insertar Usuarios en Base de Datos

### 4.1 Preparar Script

1. Abre el archivo `seed-users.sql`
2. Reemplaza los UUIDs ficticios con los UUIDs reales:

**ANTES:**
```sql
('admin-user-id', 'admin@jabil.com', 'Admin', 'admin', ...
('alberto-user-id', 'alberto@jabil.com', 'Alberto', 'leader', ...
```

**DESPUÉS (ejemplo real):**
```sql
('550e8400-e29b-41d4-a716-446655440000', 'admin@jabil.com', 'Admin', 'admin', ...
('550e8400-e29b-41d4-a716-446655440001', 'alberto@jabil.com', 'Alberto', 'leader', ...
```

### 4.2 Ejecutar Script

1. Ve a **SQL Editor** en Supabase
2. Copia el contenido de `seed-users.sql` (YA MODIFICADO)
3. Pégalo y haz click en "Run"

**Deberías ver "Rows inserted: 5"** (o el número de usuarios que creaste)

---

## PASO 5: Configurar Variables Locales

### 5.1 Crear `.env.local`

En la raíz del proyecto, crea un archivo llamado `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_anon_ABC123...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_DEF456...
DATABASE_URL=postgresql://postgres.tu-proyecto:hora-x-jabil@aws-1-us-west-2.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANTE:**
- Este archivo NO debe commitirse a Git (está en `.gitignore`)
- Cada ambiente (local, Vercel) debe tener sus propias credenciales
- NUNCA compartas estas keys públicamente

---

## PASO 6: Ejecutar Localmente

### 6.1 Instalar Dependencias

```bash
npm install
```

### 6.2 Ejecutar Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 6.3 Probar Login

**Datos de prueba:**
- Email: `alberto@jabil.com`
- Password: `password`

**Debería:**
1. Ir a la página de login
2. Mostrar formulario
3. Al entrar, ver RK1 y RK2 (las que le asignamos)
4. Poder acceder al tablero

---

## PASO 7: Desplegar en Vercel

### Opción A: Con GitHub (Recomendado)

#### 1. Subir a GitHub

```bash
git add .
git commit -m "Initial HORAS dashboard setup"
git branch -M main
git remote add origin https://github.com/tu-usuario/horas.git
git push -u origin main
```

#### 2. Conectar con Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz login con GitHub
3. Haz click en "Add New..." → "Project"
4. Selecciona el repositorio `horas`
5. Vercel debería detectar Next.js automáticamente
6. Haz click en "Deploy"

#### 3. Añadir Variables de Entorno

1. Una vez deployado, ve a Settings → Environment Variables
2. Añade las siguientes variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`

**⚠️ IMPORTANTE:** Asegúrate de que estas variables son las MISMAS que en tu `.env.local`

#### 4. Redeploy

Después de añadir las variables, haz un nuevo push a GitHub:

```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

---

### Opción B: Con CLI de Vercel

```bash
npm install -g vercel
vercel
```

Sigue los prompts interactivos.

---

## ✅ Checklist de Verificación

Una vez deployado:

- [ ] Login funciona con credenciales Supabase
- [ ] Se ven solo las RKs asignadas al usuario
- [ ] Puedo entrar datos en la tabla de producción
- [ ] Los acumulados se calculan automáticamente
- [ ] El guardado muestra "Guardado" después de 700ms
- [ ] Puedo agregar incidencias
- [ ] Los KPIs se actualizan correctamente
- [ ] Puedo exportar a PDF y Word
- [ ] Al recargar, persisten los datos

---

## 🔐 Seguridad en Producción

### Variables de Entorno en Vercel

1. **Nunca** hardcodear keys en el código
2. **Siempre** usar variables de entorno
3. **Revisar** que `.env.local` esté en `.gitignore`
4. **Rotar** keys periódicamente en Supabase
5. **Auditar** acceso en Supabase → Logs → Auth

### Usuarios en Producción

Para agregar nuevos usuarios en producción:

1. **NO** uses datos de prueba
2. Crea usuarios en Supabase Dashboard
3. Ejecuta script SQL para asignar RKs
4. Prueba acceso antes de dar credenciales

---

## 🐛 Troubleshooting

### "Connection refused" o "Network error"

**Causa**: Supabase no está accesible
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea correcto
- Revisa status en [https://status.supabase.com](https://status.supabase.com)

### "Invalid API Key"

**Causa**: Las keys no son correctas
- Verifica que copiaste exactamente las keys de Settings → API
- Revisa que no haya espacios extras

### "RLS denied access"

**Causa**: El usuario no está en la tabla `users` o falta asignación de RKs
- En Supabase SQL, verifica: `SELECT * FROM users WHERE email = 'tu-email@example.com';`
- Asegúrate de que `assigned_rks` contiene las máquinas correctas

### "Cannot find module" en Vercel

**Causa**: Falta `npm install` o dependencias incompletas
- Ve a Settings → Build → verifica que el build command es: `npm run build`
- Revisa los logs del build en Deployments

---

## 📞 Pasos Siguientes

Después de verificar que todo funciona:

1. **Personalizar**: Cambiar colores, logos, textos
2. **Crear más máquinas**: Agregar RK5, RK6, etc. (requiere cambios mínimos)
3. **Reportes**: Agregar vistas de reportes por semana/mes
4. **Integraciones**: Conectar con ERP o sistemas existentes
5. **Capacitación**: Entrenar a líderes en uso del sistema

---

## 📚 Recursos Útiles

- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Supabase](https://supabase.com/docs)
- [Documentación Vercel](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

¡Éxito con tu implementación! 🚀
