# AGENTS.md - BrisaConsciente Agenda

## Proyecto

Agenda de turnos para "Brisa Consciente" - servicio de bienestar/terapias.

## Stack

- **Framework**: Nuxt 4.x con Vue 3 (Composition API)
- **Estilos**: Tailwind CSS
- **Base de datos**: PostgreSQL (driver `pg`)
- **Validación**: Zod
- **Servidor**: Nitro (API routes en `server/api/`)

## Comandos

```bash
npm run dev      # Desarrollo (puerto por defecto Nuxt)
npm run build    # Producción
npm run preview # Preview build
npm run generate # Static generation
npm start        # Iniciar servidor producción
```

## Estructura

```
app/
  pages/         # Páginas Vue
  components/    # Componentes Vue
  app.vue        # Entry principal
server/
  api/           # Endpoints REST
  utils/         # Utilidades (db.ts, flow.ts)
  repos/         # Repositorios de datos
```

## Convenciones

- **Componentes**: PascalCase, ej: `StepHorarios.vue`
- **API routes**: snake_case, ej: `bookings.post.ts`
- **Types/Validação**: Usar Zod para validación de inputs
- **Estilos**: Tailwind CSS con clases utilitarias
- **Scripts SQL**: en `model.sql`

## Base de datos

- PostgreSQL con tabla `bookings`
- Conexión via `server/utils/db.ts`
- Credentials en variables de entorno (ver `.env`)

## API Flow (Pagos)

Integración con Flow (Chile) para pagos:
- `server/api/flow/return.post.ts` - Return URL
- `server/api/flow/confirm.post.ts` - Confirmación
- `server/utils/flow.ts` - Utilidades Flow
