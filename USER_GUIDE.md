# 📖 Guía de Uso - HORAS Dashboard

Para líderes y supervisores del área de producción RK

---

## 🔐 Acceso al Sistema

### Primer Acceso

1. Abre en tu navegador: `https://horas.vercel.app` (o URL de tu empresa)
2. Verás la página de login
3. Ingresa tu correo y contraseña
4. Haz click en "Iniciar Sesión"

### Credenciales

- **Email**: Tu correo corporativo (ej: `alberto@jabil.com`)
- **Contraseña**: La que te proporcione tu supervisor
- **2FA**: Si está habilitado, recibirás código por email

### Recuperar Contraseña

1. En login, haz click en "¿Olvidaste tu contraseña?"
2. Ingresa tu correo
3. Sigue las instrucciones enviadas a tu email

---

## 🎯 Interfaz Principal

### Encabezado Superior

```
┌─────────────────────────────────────────────┐
│ HORAS          [Tu Nombre] [Rol]   [Salir]  │
│ Sistema de Producción RK                    │
└─────────────────────────────────────────────┘
```

- **Logo**: Vuelve al dashboard
- **Tu Nombre**: Datos de la sesión
- **Rol**: Admin, Supervisor o Líder
- **Salir**: Cierra tu sesión

---

## 🏭 Seleccionar Máquina

Verás pestañas en la parte superior:

```
┌────────────────────────────────────────┐
│  RK1 (activo)   RK2   RK3   RK4       │
└────────────────────────────────────────┘
```

- Haz click en la máquina que quieres ver/editar
- Solo ves las máquinas asignadas a tu líder
- Los datos son independientes por máquina

### Ejemplo (Alberto)
- ✅ Puede ver RK1 y RK2
- ❌ No puede ver RK3 ni RK4

---

## 📋 Encabezado del Tablero

### Campos Editables

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Fecha** | Auto llena con hoy | 2024-04-26 |
| **Líder** | Nombre del líder | Alberto |
| **Supervisor** | Nombre del supervisor | Juan |
| **Turno** | Selecciona el turno | Turno 1, 2 o 3 |
| **Modelo** | Modelo que se produce | XYZ-100 |
| **Meta del Día** | Objetivo de producción | 500 (piezas) |

### Estado de Guardado

En la esquina superior derecha verás:

```
⟳ Guardando...     (Mientras editas)
✓ Guardado         (Se guardó correctamente)
✗ Error al guardar (Problema de conexión)
```

**Los cambios se guardan automáticamente** cada 0.7 segundos después de que dejes de editar.

---

## 📊 Tabla de Producción por Hora

### Estructura

```
┌──────┬─────────┬──────────┬──────────┬──────────┬──────────┬────────────┐
│ Hora │ Plan/H  │ Real/H   │ Acum.Plan│ Acum.Real│ Efic. H% │ Efic.Ac%  │
├──────┼─────────┼──────────┼──────────┼──────────┼──────────┼────────────┤
│ 6 AM │ [ 50 ]  │ [ 48 ]   │   50     │   48     │  96%     │  96%       │
│ 7 AM │ [ 50 ]  │ [ 50 ]   │  100     │   98     │ 100%     │  98%       │
└──────┴─────────┴──────────┴──────────┴──────────┴──────────┴────────────┘
```

### Columnas

| Columna | Editable | Descripción |
|---------|----------|-------------|
| **Hora** | ❌ No | Hora del turno (6:00-19:00) |
| **Plan/Hora** | ✏️ Sí | Producción planeada para esa hora |
| **Real/Hora** | ✏️ Sí | Producción real alcanzada |
| **Acum. Plan** | 🔄 Auto | Suma de plans hasta esa hora |
| **Acum. Real** | 🔄 Auto | Suma de reales hasta esa hora |
| **Efic. H%** | 🔄 Auto | (Real/Plan) × 100 por hora |
| **Efic. Ac%** | 🔄 Auto | (Acum Real/Acum Plan) × 100 |

### Colores - Interpretación

```
🟢 Verde (≥ 95%)     → Cumples o superas meta
🟡 Amarillo (80-94%) → Bajo rendimiento
🔴 Rojo (< 80%)      → No cumples
⚪ Gris              → Sin datos (NSR)
```

### Cómo Usar

1. **Editar Plan**: Haz click en la celda "Plan/Hora"
   - Ingresa el número de piezas planeadas
   - Presiona ENTER o haz click fuera

2. **Editar Real**: Haz click en la celda "Real/Hora"
   - Ingresa el número de piezas reales producidas
   - Presiona ENTER

3. **Auto-cálculos**: Los acumulados y eficiencias se calculan automáticamente
   - No necesitas hacer nada
   - Se actualizan al segundo

### Ejemplo de Llenado

```
Hora 6 AM:
- Plan: 50 piezas (planeado)
- Real: 48 piezas (producidas)

Sistema calcula:
- Acum Plan: 50 (primer dato)
- Acum Real: 48 (primer dato)
- Efic Hora: 48/50 × 100 = 96%
- Efic Acum: 48/50 × 100 = 96%
```

---

## 🚨 Sección de Problemas/Incidencias

### Para Agregar un Problema

1. Desplázate hacia abajo en la página
2. Encontrarás la sección "Problemas / Incidencias"
3. Rellena los campos:

| Campo | Ejemplo |
|-------|---------|
| **Hora** | 10 AM |
| **Descripción** | Paro de máquina por falla eléctrica |
| **Minutos Perdidos** | 15 |
| **Responsable** | Carlos (Técnico) |
| **Acción Correctiva** | Reiniciar fuente de poder |

4. Haz click en "➕ Añadir Incidencia"

### Ver Problemas

Aparecerán listados debajo con:
- Hora y descripción
- Minutos perdidos
- Responsable y acción

### Eliminar Problema

Si necesitas eliminar un problema registrado por error:
1. Encuentra el problema en la lista
2. Haz click en el icono de 🗑️ basura
3. Se eliminará inmediatamente

---

## 📊 KPIs - Indicadores de Desempeño

En la mitad de la página verás 6 tarjetas grandes:

### 1. Total Plan
- Suma de todos los planes del día
- **Color**: Azul

### 2. Total Real
- Suma de toda la producción real del día
- **Color**: Verde/Rojo según cumplimiento

### 3. Cumplimiento Total %
- (Total Real / Meta del Día) × 100
- **Verde** ≥ 95% | **Rojo** < 95%
- **IMPORTANTE**: Este es el KPI principal

### 4. Eficiencia %
- (Total Real / Total Plan) × 100
- Indica qué tan bien se aprovechó el tiempo

### 5. Minutos Perdidos
- Suma de minutos en problemas
- Bajo es mejor
- **Color**: Gris

### 6. Diferencia Meta
- Total Real - Meta del Día
- Verde si es positivo (superas meta)
- Rojo si es negativo (no llegas a meta)

### Ejemplo de KPIs

```
Total Plan: 500 piezas
Total Real: 485 piezas
Cumplimiento: 97% ✅ (verde)
Eficiencia: 97%
Minutos Perdidos: 30 min
Diferencia Meta: -15 piezas ❌ (faltó llegar)
```

---

## 💾 Exportar Tablero

Al final de la página hay dos botones:

### Exportar PDF
- Descarga el tablero en PDF
- Útil para reportes impresos
- Incluye todo: encabezado, tabla, KPIs, problemas
- Haz click → Se descarga automáticamente

### Exportar Word
- Descarga en formato .doc
- Editable en Microsoft Word
- Útil para modificar antes de enviar
- Haz click → Se descarga automáticamente

---

## ⚙️ Recargar y Persistencia

### ¿Se guardan mis datos?

✅ **SÍ**, automáticamente:
- Cada 0.7 segundos después de editar
- Se guarda en Supabase (nube)
- Persiste si cierras sesión o apaga la PC

### Si recargo la página

- Los datos de hoy permanecen
- Se restaura exactamente lo que editaste
- Sin pérdida de información

### Si cambio de máquina

- Los datos de RK1 se guardan
- Los datos de RK2 se cargan
- Sin perder nada

---

## 📱 Usar en Móvil o Tablet

El tablero es responsive:

### Desktop
- Todas las columnas visibles
- Mejor para edición

### Tablet
- Algunas columnas pueden scrollear
- Toca y desliza horizontalmente

### Móvil
- Tabla se adapta
- Zoom si es necesario
- No recomendado para edición extensa

---

## 🔒 Seguridad y Privacidad

### Lo que puedes ver

- **Tú** (Líder): Solo tus máquinas asignadas
- **Supervisor**: Todas las máquinas
- **Admin**: Todo el sistema

### Lo que está protegido

- Tu contraseña nunca se transmite
- Los datos se envían por HTTPS (cifrado)
- Solo tú ves tus datos
- No hay backups locales

### Cierre de Sesión

- Haz click en "Salir" en la esquina superior
- Se cierra inmediatamente
- Desde otra PC, alguien no podrá ver tus datos

---

## 🆘 Solución de Problemas

### No puedo entrar

**Problema**: "Email o contraseña incorrectos"

**Solución**:
- Verifica que el email sea correcto
- Verifica que no haya espacios
- ¿Olvidaste la contraseña? → Usa "Recuperar contraseña"
- Contacta al admin si persiste

### No veo mis máquinas

**Problema**: Solo veo RK1, pero debería ver RK1 y RK2

**Solución**:
- Contacta al supervisor
- Es posible que no estén asignadas aún
- Se asignan en la base de datos

### Dice "Guardando..." pero nunca termina

**Problema**: El icono no cambia a "Guardado"

**Solución**:
- Verifica tu conexión a Internet
- Recarga la página (F5)
- Si persiste, contacta al admin
- Revisa https://status.supabase.com

### La tabla se ve extraña en móvil

**Problema**: Columnas desalineadas

**Solución**:
- Gira el dispositivo horizontalmente
- Usa zoom si es necesario (pinch)
- En desktop verás mejor

### No aparece mi problema después de guardarlo

**Problema**: Agregué una incidencia pero no aparece

**Solución**:
- Recarga la página (F5)
- Verifica que ingresaste descripción
- Si no aparece, hay error de conexión

---

## 📞 Contacto y Soporte

| Problema | Contactar |
|----------|-----------|
| Acceso, contraseña | TI / Admin del sistema |
| Asignación de máquinas | Supervisor |
| Uso del tablero | Capacitador o supervisor |
| Error técnico | Admin / Desarrollador |

---

## 💡 Tips y Trucos

### Edición Rápida

- Usa TAB para navegar entre celdas
- Presiona ENTER para guardar
- ALT+TAB para cambiar pestañas

### Aumentar Productividad

1. Abre dos navegadores (uno por máquina) - NO, solo 1 usuario por login
2. Usa exportación PDF para reportes rápidos
3. Revisa KPIs cada hora para ajustar

### Evitar Errores

- Revisa dos veces los números antes de guardar
- Los datos no se pueden recuperar si los eliminas
- Avisa al supervisor si hay problema

### Usar en Reuniones

- Exporta a PDF antes de la junta
- Muestra en la pantalla el dashboard en vivo
- Usa los KPIs para presentar avances

---

## 📊 Interpretación de Datos

### Eficiencia < 80%

⚠️ Hay un problema importante:
1. Revisa la tabla: ¿en qué hora bajó?
2. ¿Hay problema registrado?
3. Reporta al supervisor
4. Toma acción correctiva

### Cumplimiento < 95%

Vas atrás de meta:
1. Revisa tiempo perdido (minutos)
2. Aumenta velocidad si es posible
3. Elimina obstáculos
4. Comunica con supervisor si no es posible

### Diferencia Meta Negativa

No llegarás a la meta del día:
- Acelera si hay capacidad
- Si no hay opción, avisa temprano
- Determina causas con supervisor

---

## 🎓 Capacitación

### Primeros Pasos

1. Abre el tablero
2. Llena encabezado (Líder, Supervisor, Modelo)
3. Ingresa primeros datos (6 AM)
4. Verifica que se guardó
5. Observa cálculos automáticos

### Practiquemos

1. Ingresa: Plan=50, Real=48
2. Observa: Acumulados y eficiencias
3. Añade problema: "Prueba de sistema", 5 min, "Juan"
4. Verifica KPI de minutos
5. Exporta a PDF

### Después

Practica durante un turno real con supervisión

---

## Más Ayuda

- Lee este documento completo
- Practica en sandbox si hay disponible
- Pregunta al supervisor en caso de duda
- El sistema es intuitivo, te adaptas rápido

¡Bienvenido a HORAS! 🚀
