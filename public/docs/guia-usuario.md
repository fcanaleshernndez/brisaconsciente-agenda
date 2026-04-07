# Guía de Usuario - Brisa Consciente Agenda

## 📍 Acceso

**URL:** `https://brisaconsciente-agenda-production.up.railway.app/admin`

1. Ingresa tu email y contraseña
2. Click en "Iniciar Sesión"
3. Si olvidas tu contraseña, contacta al desarrollador

---

## 🏠 Dashboard

Es la **página principal** después de iniciar sesión.

**Qué muestra:**
- Cantidad de reservas del mes
- Ingresos del mes
- Próximas citas
- Estado de los servicios (DB, Flow, Google)

**Botón "Estado del sistema":** Verifica que todo funcione correctamente. Si algo está en rojo, contacta al desarrollador.

---

## 📅 Reservas

Aquí ves **todas las reservas** del sistema.

**Filtros disponibles:**
- Por estado: Pendientes, Confirmadas, Canceladas
- Por profesional
- Por rango de fechas

**Estados de reserva:**
| Estado                | Significado                    |
|-----------------------|--------------------------------|
| pending_payment       | Esperando pago (Flow)          |
| confirmed             | Pagado y confirmado            |
| manually_confirmed    | Creado manualmente por admin   |
| cancelled             | Cancelada                      |

**Acciones:**
- **Ver paciente:** Click en la fila para ver detalles
- **Marcar como pagado:** Si pagaste fuera del sistema
- **Cancelar:** Cancela la reserva y libera los horarios

---

## 🔄 Reagendados

Reservas que necesitan **cambiar de horario**.

**Flujo de reagendado:**
1. Admin marca slot como "Reagendado" (se crea solicitud)
2. El sistema envía emails de notificación
3. Admin crea nueva reserva vinculada
4. Sistema marca como completado

**Importante:** No crear nueva reserva manualmente sin seguir este flujo.

---

## 👥 Pacientes

Lista de **todos los pacientes** que reservaron alguna vez.

**Ver paciente:** Click para ver:
- Sus datos personales
- Historial de reservas
- Opciones de reagendado y cancelación

**Acciones disponibles:**
- Reagendar (con emails automáticos)
- Cancelar reserva

---

## 🏥 Especialidades

**Qué es:** Las áreas de atención (ej: Psicología, Kinesiología, etc.)

**Acciones:**
- Crear nueva especialidad
- Editar nombre
- Desactivar (no elimina, solo oculta)

---

## 👨‍⚕️ Profesionales

Lista de **profesionales** que dan las terapias.

**Acciones:**
- Crear nuevo profesional
- Editar datos (nombre, email, especialidad)
- Activar/desactivar

**Nota:** Cada profesional debe tener precios configurados en la sección de Precios.

---

## ⏰ Horarios

**Zona horaria:** Chile (Santiago)

### Crear horarios para un profesional:

1. Selecciona el profesional
2. Elige la fecha
3. Configura hora inicio y fin
4. Define la duración de cada slot (30, 45, 60 min)
5. Click en "Crear Horarios"

**Tips:**
- Los horarios se crean de forma automática según la duración elegida
- Solo se crean horarios futuros
- Los horarios pasados no se pueden crear

---

## 📦 Paquetes

Los **tipos de sesiones** que se venden.

**Ejemplos:**
- Pack 4 sesiones
- Pack 8 sesiones
- Sesión individual

**Acciones:**
- Crear nuevo paquete
- Editar nombre y cantidad de sesiones
- Desactivar

---

## 💰 Precios

Aquí se configuran los **precios por profesional y paquete**.

**Cómo funciona:**
- Cada profesional puede tener precios diferentes para cada paquete
- Si un precio no existe, no se puede reservar

**Ejemplo:**
| Profesional   | Paquete   | Precio    |
|---------------|-----------|-----------|
| Juan Pérez    | Pack 4    | $80.000   |
| Juan Pérez    | Pack 8    | $150.000  |
| María López   | Pack 4    | $90.000   |

---

## 📊 Logs de Errores (Apartado Oculto)

Registros de **errores técnicos** del sistema.

**Cuándo mirar:**
- Algo no funciona y no sabes por qué
- Un cliente reporta un problema
- Te llega un email de error

**Información que muestra:**
- Endpoint donde ocurrió
- Tipo de error
- Fecha y hora
- Datos relevantes

**Acción:**
- Eliminar logs individuales cuando los revises

---

## 🎥 Videollamadas (Google Meet)

El sistema crea **automáticamente** un link de Google Meet para cada sesión.

**Cómo funciona:**
1. Al confirmar el pago (o crear reserva manual)
2. El sistema crea el evento en Google Calendar
3. Se genera el link de Meet
4. El link aparece en los emails de confirmación

**El paciente y profesional reciben** el link en sus emails.

**Nota:** Necesita que el token OAuth de Google esté vigente. Si falla, la reserva se crea igual pero sin Meet.

---

## 🔒 Seguridad

### Rate Limiting
El sistema protege contra ataques limitando requests:
- Máximo 10 reservas por hora desde la misma IP

### reCAPTCHA
El formulario público tiene verificación anti-bots de Google.

### Logs
Todos los errores se registran para diagnóstico, esta vista esta oculta en ?tab=logs.

---

## ❓ Preguntas Frecuentes

**¿Puedo editar una reserva ya confirmada?**
No directamente. Cancela y crea una nueva.

**¿Qué pasa si falla el pago en Flow?**
La reserva queda en estado "pending_payment" y los horarios se liberan automáticamente.

**¿Cómo saber si algo no funciona?**
Verifica el "Estado del sistema" en el Dashboard o la sección de Logs.

**¿Pueden los pacientes reagendar solos?**
No, solo el admin puede hacerlo desde "Ver paciente" en el menú de horarios.

**¿Qué significa cuando un slot está en amarillo?**
El horario está reservado pero pendiente de pago. Si no se completa el pago en 15 minutos, se libera automáticamente.

**¿Por qué no aparece un profesional en la lista?**
Verifica que esté activo y que tenga al menos un precio configurado en la sección de Precios.

**¿Qué hago si el link de Meet no se creó?**
Revisa el estado de Google en "Estado del sistema". Si está caído, contacta al desarrollador.

**¿Puedo crear una reserva sin que el paciente pague?**
Sí, desde el admin puedes crear una reserva manualmente y marcarla como pagada.

**¿Cómo cancelo una reserva?**
Ve a Reservas → Click en la reserva → Busca la opción de cancelar. Esto liberará los horarios y enviará un email de notificación.

**¿Qué pasa si un paciente no tiene email válido?**
El sistema validará el formato del email, pero no verificará si es real. Es importante collecting un email correcto para recibir confirmaciones.

**¿Cuánto tiempo dura el token de sesión?**
El token expira después de 8 horas. Luego deberás iniciar sesión nuevamente.

**¿Puedo ver el historial de cancelaciones?**
Sí, desde la sección de Pacientes puedes ver el historial completo de cada paciente, incluyendo cancelaciones.

**¿Cómo funcionan los paquetes de sesiones?**
Los paquetes tienen un número de sesiones. Al reservar, el paciente elige cuántos slots quiere (hasta el máximo del paquete). Cada slot es una cita.

**¿Qué es el "Hold" en los horarios?**
Cuando un paciente está en el proceso de reserva, el horario se pone en "hold" por 15 minutos para que no sea tomado por otro. Si no completa el pago, se libera.

**¿Los profesionales reciben notificación de nuevas reservas?**
Sí, cada vez que se confirma una reserva, el profesional recibe un email con los detalles.

---

## 🆘 Necesitas ayuda?

Si algo no funciona:
1. Verifica el estado del sistema
2. Revisa los logs de errores
3. Contacta al desarrollador con el mensaje de error

---

*Versión del sistema: 1.0*
*Última actualización: Abril 2026*
