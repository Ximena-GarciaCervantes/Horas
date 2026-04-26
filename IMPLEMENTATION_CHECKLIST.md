# ✅ Checklist de Implementación - HORAS

Usa este checklist para asegurar que todo está correctamente configurado antes de usar el sistema en producción.

---

## 📋 FASE 1: Preparación de Supabase

### Proyecto Supabase
- [ ] Crear cuenta en supabase.com
- [ ] Crear nuevo proyecto
- [ ] Esperar 2-3 minutos a que se inicialice
- [ ] Copiar URL en Settings → API
- [ ] Copiar Anon Key en Settings → API
- [ ] Copiar Service Role Key en Settings → API

### Base de Datos
- [ ] Ejecutar `setup.sql` en SQL Editor
- [ ] Verificar que todas las tablas se crearon
- [ ] Verificar que los índices se crearon
- [ ] Verificar que RLS está habilitado
  ```sql
  SELECT * FROM information_schema.tables 
  WHERE table_schema = 'public'
  ```

### Autenticación
- [ ] Crear usuario `alberto@jabil.com` en Auth → Users
- [ ] Copiar UUID de Alberto
- [ ] Crear otros usuarios (opcional)
- [ ] Copiar todos los UUIDs
- [ ] Modificar `seed-users.sql` con UUIDs reales
- [ ] Ejecutar `seed-users.sql` en SQL Editor
- [ ] Verificar en tabla `users` que los datos existen

### Verificación
```sql
-- Ejecutar en SQL Editor
SELECT * FROM users;
SELECT * FROM production_boards;
SELECT * FROM hourly_production LIMIT 1;
SELECT * FROM problems LIMIT 1;
```

---

## 📦 FASE 2: Configuración Local

### Proyecto Node.js
- [ ] Crear carpeta del proyecto
- [ ] Ejecutar `npm init` o copiar archivos
- [ ] Crear `.env.local` con variables de Supabase
- [ ] Verificar que `.env.local` está en `.gitignore`
- [ ] No commitir `.env.local` a Git

### Variables de Entorno
- [ ] `NEXT_PUBLIC_SUPABASE_URL` copiado correctamente
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` copiado correctamente
- [ ] `SUPABASE_SERVICE_ROLE_KEY` copiado correctamente
- [ ] `DATABASE_URL` copiado correctamente
- [ ] Sin espacios extras en las variables

### Dependencias
- [ ] `npm install` ejecutado sin errores
- [ ] `node_modules/` descargado correctamente
- [ ] `package-lock.json` generado
- [ ] Sin warnings de vulnerabilidades críticas

### Build Local
- [ ] `npm run build` ejecutado sin errores
- [ ] `.next/` carpeta generada
- [ ] No hay warnings de tipos TypeScript

---

## 🧪 FASE 3: Testing Local

### Desarrollo
- [ ] `npm run dev` inicia sin errores
- [ ] Abre http://localhost:3000 en navegador
- [ ] Redirecciona automáticamente a `/login`
- [ ] Página de login carga correctamente

### Login
- [ ] Ingresa `alberto@jabil.com` y `password`
- [ ] Click en "Iniciar Sesión"
- [ ] Redirige a `/dashboard`
- [ ] Muestra "Alberto" en header
- [ ] Muestra rol "leader"

### Dashboard
- [ ] Tablero carga sin errores
- [ ] Muestra RK1 y RK2 en pestañas
- [ ] RK1 está activo por defecto
- [ ] Encabezado con 6 campos editables
- [ ] Tabla de horas carga

### Funcionalidad
- [ ] Edita "Líder": se guarda automáticamente
- [ ] Edita "Meta del Día": 500
- [ ] Observa "Guardando..." luego "Guardado"
- [ ] Ingresa Plan=50, Real=48 en hora 6 AM
- [ ] Acumulados se calculan automáticamente
- [ ] Eficiencia muestra 96%
- [ ] Agregar problema funciona
- [ ] Eliminar problema funciona
- [ ] KPIs se actualizan correctamente

### Exportación
- [ ] Botón "Exportar PDF" descarga archivo
- [ ] Botón "Exportar Word" descarga archivo
- [ ] PDF contiene datos correctos
- [ ] Word contiene tabla formateada

### Persistencia
- [ ] Recarga F5 página
- [ ] Datos siguen presentes
- [ ] Cierra sesión y abre de nuevo
- [ ] Datos siguen guardados

---

## 🚀 FASE 4: Deployment en Vercel

### GitHub
- [ ] Crear repositorio en GitHub
- [ ] `git init` en proyecto local
- [ ] `git add .` todos los archivos
- [ ] `git commit` con mensaje inicial
- [ ] `git remote add origin` URL de GitHub
- [ ] `git push -u origin main`
- [ ] Verificar archivos en GitHub

### Vercel
- [ ] Crear cuenta en vercel.com
- [ ] Conectar GitHub con Vercel
- [ ] Autorizar Vercel para leer repos
- [ ] Importar proyecto HORAS
- [ ] Vercel detecta Next.js automáticamente

### Variables de Entorno en Vercel
- [ ] Settings → Environment Variables
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Agregar `DATABASE_URL`
- [ ] EXACTAMENTE igual a `.env.local`

### Primer Deploy
- [ ] Hacer click "Deploy"
- [ ] Vercel comienza el build (2-3 min)
- [ ] Build completa exitosamente
- [ ] URL automática asignada (ej: horas-123.vercel.app)
- [ ] Haz click en URL para abrir

### Testing en Producción
- [ ] Página carga sin errores
- [ ] Login funciona con `alberto@jabil.com`
- [ ] Dashboard funciona
- [ ] Puedes editar y guardar
- [ ] Exportación funciona
- [ ] Verifica en console (F12) sin errores

---

## 🔒 FASE 5: Seguridad

### Supabase
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas de RLS creadas en `setup.sql`
- [ ] Testear que usuario no ve datos de otros
- [ ] Cambiar contraseña por defecto de DB
- [ ] No compartir keys públicamente

### Vercel
- [ ] No commitir `.env.local` a Git
- [ ] `.env.local` está en `.gitignore`
- [ ] Variables secretas en Vercel, no en GitHub
- [ ] HTTPS habilitado automáticamente
- [ ] Dominio personalizado configurado (opcional)

### Usuarios
- [ ] Cambiar contraseña de prueba
- [ ] No usar contraseña = "password"
- [ ] Crear contraseña fuerte con números/símbolos
- [ ] 2FA habilitado si es posible
- [ ] Solo compartir URL de producción, no keys

---

## 📚 FASE 6: Documentación

### Generada
- [ ] `README.md` describe el proyecto
- [ ] `SETUP_GUIDE.md` con instrucciones paso a paso
- [ ] `DEPLOY_VERCEL.md` con proceso de deployment
- [ ] `USER_GUIDE.md` para líderes y supervisores
- [ ] `ARCHITECTURE.md` para desarrolladores
- [ ] Este `IMPLEMENTATION_CHECKLIST.md`

### Acceso
- [ ] Todos los documentos en el repositorio
- [ ] Compartidos con stakeholders
- [ ] Versión impresa disponible si necesario

---

## 👥 FASE 7: Usuarios y Roles

### Crear Usuarios Finales
- [ ] Crear usuario de prueba para cada rol
  - [ ] Admin: `admin@company.com`
  - [ ] Supervisor: `supervisor@company.com`
  - [ ] Líder 1: `leader1@company.com` → RK1, RK2
  - [ ] Líder 2: `leader2@company.com` → RK3
  - [ ] Líder 3: `leader3@company.com` → RK4
- [ ] Anotar UUIDs de cada usuario
- [ ] Ejecutar `seed-users.sql` con UUIDs reales
- [ ] Verificar en tabla `users`

### Asignar Máquinas
- [ ] Alberto → `assigned_rks = ['RK1', 'RK2']`
- [ ] Carlos → `assigned_rks = ['RK3']`
- [ ] María → `assigned_rks = ['RK4']`
- [ ] Supervisor → `assigned_rks = ['RK1', 'RK2', 'RK3', 'RK4']`
- [ ] Admin → `assigned_rks = ['RK1', 'RK2', 'RK3', 'RK4']`

### Testear Acceso
- [ ] Login con Alberto ve RK1 y RK2
- [ ] Login con Carlos ve solo RK3
- [ ] Login con Supervisor ve todas
- [ ] Login con Admin ve todas
- [ ] Usuario no ve datos de otros

---

## 🧬 FASE 8: Integraciones (Opcional)

### Email
- [ ] [ ] Configurar SMTP para recuperación de contraseña
- [ ] [ ] Testear email de recuperación

### Analytics
- [ ] [ ] Configurar Google Analytics (si lo necesita)
- [ ] [ ] Ver datos en Vercel Analytics

### Backup
- [ ] [ ] Configurar backup automático en Supabase
- [ ] [ ] Prueba de restauración de backup

### Dominio Personalizado
- [ ] [ ] Si tienes dominio propio: `horas.tucompania.com`
- [ ] [ ] Configurar en Vercel → Settings → Domains
- [ ] [ ] Configurar DNS en registrador
- [ ] [ ] Esperar propagación (5-24 horas)

---

## 🎓 FASE 9: Capacitación

### Líderes
- [ ] [ ] Capacitación sobre uso del dashboard
- [ ] [ ] Demostración en vivo
- [ ] [ ] Práctica guiada
- [ ] [ ] Preguntas y respuestas
- [ ] [ ] Compartir `USER_GUIDE.md`

### Supervisores
- [ ] [ ] Explicación de control de acceso
- [ ] [ ] Cómo crear nuevos usuarios
- [ ] [ ] Cómo asignar máquinas
- [ ] [ ] Revisión de reportes
- [ ] [ ] Compartir `ARCHITECTURE.md`

### Administradores
- [ ] [ ] Acceso a Supabase Dashboard
- [ ] [ ] Cómo ver logs
- [ ] [ ] Monitoreo del sistema
- [ ] [ ] Troubleshooting básico

---

## 🚨 FASE 10: Monitoreo y Mantenimiento

### Primeras 2 Semanas
- [ ] Revisar logs diariamente
- [ ] Verificar que no hay errores en Vercel
- [ ] Recopilar feedback de usuarios
- [ ] Corregir bugs encontrados

### Mensual
- [ ] [ ] Revisar performance de la app
- [ ] [ ] Verificar uso de cuota en Supabase
- [ ] [ ] Revisar proyecciones de costos
- [ ] [ ] Actualizar dependencias si es necesario

### Trimestral
- [ ] [ ] Backup de base de datos
- [ ] [ ] Auditoría de seguridad
- [ ] [ ] Revisión de acceso de usuarios
- [ ] [ ] Renovación de certificados SSL (automático)

---

## 📊 FASE 11: Validación de Datos

### Integridad
- [ ] Los acumulados siempre crecen (nunca disminuyen)
- [ ] Eficiencia nunca es > 100%
- [ ] Diferencia meta es acotada
- [ ] Sin valores negativos en cantidad

### Pruebas Extremas
- [ ] [ ] Ingresa 9999 en plan
- [ ] [ ] Ingresa 0 en plan (verifica división por cero)
- [ ] [ ] Deja hora en blanco
- [ ] [ ] Ingresa letras en campo numérico
- [ ] [ ] El sistema debe manejar todos sin crash

### Concurrencia
- [ ] [ ] Abre dashboard en 2 navegadores
- [ ] [ ] Edita en ambos simultáneamente
- [ ] [ ] Verifica que no se pierde data
- [ ] [ ] Observa comportamiento

---

## 🎉 FASE 12: Go Live

### Antes de Producción
- [ ] ✅ Todas las fases completadas
- [ ] ✅ Todos los checkboxes marcados
- [ ] ✅ Testing exitoso
- [ ] ✅ Usuarios capacitados
- [ ] ✅ Plan de soporte en lugar

### Día de Lanzamiento
- [ ] Verificar que Vercel está healthy
- [ ] Verificar que Supabase está healthy
- [ ] Soporte disponible durante el turno
- [ ] Recopilar feedback en tiempo real
- [ ] Estar listo para rollback si es necesario

### Post-Lanzamiento
- [ ] Monitoreo durante primer turno
- [ ] Resolver issues inmediatos
- [ ] Documentar lecciones aprendidas
- [ ] Celebrar éxito del equipo

---

## 📞 Soporte y Contactos

| Rol | Responsable | Teléfono | Email |
|-----|-------------|----------|-------|
| Admin Supabase | [Nombre] | [Tel] | [Email] |
| Admin Vercel | [Nombre] | [Tel] | [Email] |
| Desarrollador | [Nombre] | [Tel] | [Email] |
| Soporte TI | [Nombre] | [Tel] | [Email] |

---

## 📝 Notas Finales

- Este checklist es iterativo. Revísalo después de cada fase.
- Si algo falla, regresa a la fase anterior.
- Documenta cualquier desviación.
- Actualiza este documento con lo que aprendas.
- ¡Éxito en la implementación! 🚀

---

**Completado el checklist**: ___/___/_______ (Fecha)
**Por**: _________________________ (Nombre)
**Aprobado por**: ________________ (Supervisor/Admin)

