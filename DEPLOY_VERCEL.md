# 🚀 Desplegar en Vercel

## Opción 1: GitHub + Vercel (Recomendado)

### Paso 1: Preparar GitHub

```bash
# Si no tienes repo aún
git init
git add .
git commit -m "Initial HORAS dashboard"
git branch -M main

# Crear repo en GitHub y agregar remote
git remote add origin https://github.com/tu-usuario/horas.git
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com
2. Haz login con GitHub
3. Haz click en "Add New..." → "Project"
4. Busca y selecciona el repo `horas`
5. Vercel detectará Next.js automáticamente
6. Haz click en "Deploy"

**Esperarás ~2-3 minutos para el deploy**

### Paso 3: Configurar Variables de Entorno

Cuando Vercel te pregunte por variables de entorno (o después en Settings):

1. En Vercel Dashboard, ve a tu proyecto
2. Settings → Environment Variables
3. Añade EXACTAMENTE estas 4 variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_anon_ABC123xyz...
SUPABASE_SERVICE_ROLE_KEY = sb_secret_DEF456abc...
DATABASE_URL = postgresql://postgres.tu-proyecto:hora-x-jabil@...
```

⚠️ **IMPORTANTE:**
- `NEXT_PUBLIC_*` son públicas (van en cliente)
- Las otras son secretas (solo backend)
- Cópialas EXACTAMENTE de Supabase
- No añadas espacios extras

### Paso 4: Redeploy

Después de configurar las variables:

```bash
# Opción A: Nuevo push a GitHub
git commit --allow-empty -m "Trigger Vercel redeploy"
git push

# Opción B: Manual en Vercel
# En Deployments, haz click en el botón "..." y selecciona "Redeploy"
```

---

## Opción 2: CLI de Vercel

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login

```bash
vercel login
```

Sigue los prompts.

### Paso 3: Deploy

```bash
vercel
```

Sigue los prompts:
- Link to existing project? → No (first time)
- Project name? → `horas`
- Which directory? → `./`
- Override settings? → No

### Paso 4: Configurar Variables

Después del deploy inicial:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
```

Ingresa los valores cuando se te pida.

### Paso 5: Redeploy

```bash
vercel --prod
```

---

## Variables de Entorno Explicadas

### NEXT_PUBLIC_SUPABASE_URL
- **De dónde**: Supabase Dashboard → Settings → API → Project URL
- **Ejemplo**: `https://sykpghgovosqyvzlnlne.supabase.co`
- **Pública**: ✅ Sí (visible en cliente)

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **De dónde**: Supabase Dashboard → Settings → API → anon public
- **Ejemplo**: `sb_publishable_CsXa4i5CH2lb7q6B2eMBJQ_RAsooSHV`
- **Pública**: ✅ Sí
- **Uso**: Autenticación desde el navegador

### SUPABASE_SERVICE_ROLE_KEY
- **De dónde**: Supabase Dashboard → Settings → API → service_role secret
- **Ejemplo**: `sb_secret_KOODaL9DIo3LRtgmRVUz1A_DjViLnvl`
- **Pública**: ❌ No (secreto)
- **Uso**: Operaciones administrativas

### DATABASE_URL
- **De dónde**: Supabase Dashboard → Settings → Database
- **Selecciona**: "Transaction Pooler" (recomendado)
- **Ejemplo**: `postgresql://postgres.tu-proyecto:password@aws-...`
- **Pública**: ❌ No (secreto)
- **Uso**: Pool de conexiones

---

## Verificación Post-Deploy

### Checklist

- [ ] URL accesible: `https://horas.vercel.app` (o tu dominio)
- [ ] Login página carga
- [ ] Puedo iniciar sesión con `alberto@jabil.com`
- [ ] Veo RK1 y RK2 en pestañas
- [ ] Tablero carga datos
- [ ] Puedo editar y guardar
- [ ] Estado "Guardado" aparece
- [ ] Exportación PDF/Word funciona

### Prueba de Producción

```bash
# Simular el build de producción
npm run build

# Servir localmente como producción
npm start
```

---

## Dominios Personalizados

### Agregar Dominio

1. En Vercel, ve a Settings → Domains
2. Haz click en "Add"
3. Ingresa tu dominio (ej: `horas.tuempresa.com`)
4. Vercel te dará instrucciones DNS
5. Configura en tu registrador (GoDaddy, Namecheap, etc.)

**El certificado SSL es automático**

---

## CI/CD Pipeline

### Automático con GitHub

Vercel automáticamente:
1. Detecta push a main
2. Ejecuta `npm run build`
3. Ejecuta checks de seguridad
4. Deploy a producción si todo OK
5. URL actualizada automáticamente

### Desactivar Auto-Deploy

Si quieres control manual:
1. Settings → Git → Auto-deploys → Desactivar
2. Deploy manualmente desde Vercel Dashboard

---

## Monitoreo

### Ver Logs

1. Deployments → Último deployment
2. Logs tab → Live logs o Stored logs

### Alertas

1. Settings → Notifications
2. Configura alertas por:
   - Deploy fallido
   - Build error
   - Performance issues

---

## Rollback

Si algo sale mal:

1. Deployments → Anterior deployment
2. Haz click en los 3 puntos
3. Selecciona "Promote to Production"

---

## Límites y Cuotas

### Vercel Free
- ✅ Unlimited deployments
- ✅ Serverless Functions 100GB/month
- ✅ HTTPS automático
- ✅ 50GB de bandwidth
- ✅ Performance Monitoring básico

### Supabase Free
- ✅ 500MB DB storage
- ✅ 2GB bandwidth
- ✅ 50,000 filas de usuarios auth
- ✅ 2 millones de consultas/mes

**Para producción real, considera planes de pago**

---

## Troubleshooting

### Build falla con "Cannot find module"

```
Error: Cannot find module '@/components/...'
```

**Causa**: Alias de importación mal configurado
- Verifica `tsconfig.json` alias
- Verifica que el archivo existe
- Redeploy

### Variables de entorno no funcionan

```
Error: undefined is not a string
```

**Causa**: Variable no encontrada
- Verifica nombre EXACTO
- Redeploy después de añadirla
- Espera 30 segundos entre cambios

### Timeout de conexión a Supabase

```
Error: connection timeout
```

**Causa**: Firewall o credenciales incorrectas
- Verifica `DATABASE_URL` es correcta
- Verifica proyecto Supabase está activo
- Revisa status de Supabase

### 403 Error al desplegar

**Causa**: GitHub token expirado
- Reconecta GitHub en Vercel Settings
- Revoca y crea nuevo token en GitHub

---

## Optimizaciones Post-Deploy

### 1. Configurar Sitemap (SEO)

```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://horas.vercel.app',
      lastModified: new Date(),
    },
  ]
}
```

### 2. Analytics

```typescript
// lib/analytics.ts
export function trackEvent(name: string, data?: Record<string, any>) {
  window.gtag?.event(name, data)
}
```

### 3. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

### 4. Performance Monitoring

Ve a Vercel Dashboard → Analytics para ver:
- Tiempos de carga
- Core Web Vitals
- Errores

---

## Documentación Útil

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables en Vercel](https://vercel.com/docs/environment-variables)

---

## Contacto de Soporte

Si tienes problemas:
1. Vercel Status: https://status.vercel.com
2. Supabase Status: https://status.supabase.com
3. GitHub Status: https://www.githubstatus.com

¡Tu app está lista para producción! 🚀
