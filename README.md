# LlamaEats

Plataforma web de reservas de mesa en restaurantes de Puno, Perú. LlamaEats actúa
como intermediario: el cliente reserva gratis la mesa y paga únicamente una
tarifa de servicio de S/ 3.00–5.00 por reserva confirmada (no la cuenta del
restaurante).

> ¿Cansado de hacer fila para comer en Puno? LlamaEats te asegura tu mesa en minutos.

## Stack

- **Next.js 15** (App Router, Server Actions, TypeScript)
- **Neon** (Postgres serverless) + **Drizzle ORM** — driver `neon-serverless`
  (Pool) para tener `db.transaction()` real, no `neon-http` (que no soporta
  transacciones)
- **Auth.js v5** con Google OAuth + magic link por email (proveedor
  `Nodemailer` sobre SMTP), sesión en base de datos vía `DrizzleAdapter`
- **Vercel Blob** para fotos de restaurantes
- **TailwindCSS v4 + shadcn/ui + lucide-react**
- **Framer Motion + GSAP (ScrollTrigger, SplitText)** para animaciones
- **Zod + React Hook Form + next-safe-action** para formularios y server actions
- **Recharts** para los dashboards
- **Nodemailer** (SMTP, ej. Gmail) para email transaccional, **`qrcode`** para
  el QR de reserva

## Requisitos previos

- Node.js 20+
- Una base de datos [Neon](https://neon.tech) (plan gratuito sirve)
- Credenciales de **Google OAuth** (Google Cloud Console)
- Una cuenta de correo con SMTP habilitado (ej. Gmail con contraseña de
  aplicación) para magic link + emails
- (Opcional para fotos) Un store de **Vercel Blob**

## 1. Instalación

```bash
npm install
cp .env.example .env.local
```

Completa `.env.local` con tus credenciales (ver siguiente sección).

## 2. Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de Neon (con pooling). Se usa tanto para el driver `neon-serverless` (escrituras transaccionales) como para `neon-http` (adapter de Auth.js en el middleware, edge-safe). |
| `AUTH_SECRET` | Secreto para Auth.js. Genera uno con `npx auth secret`. |
| `AUTH_URL` | URL pública de la app (`http://localhost:3000` en local). |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Credenciales OAuth de Google (ver abajo). |
| `SMTP_HOST` / `SMTP_PORT` | Servidor SMTP. Con Gmail: `smtp.gmail.com` / `587`. |
| `SMTP_USER` / `SMTP_PASSWORD` | Credenciales SMTP. Con Gmail, `SMTP_PASSWORD` debe ser una **contraseña de aplicación** (no la contraseña normal de la cuenta) — se genera en [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) con verificación en 2 pasos activada. |
| `EMAIL_FROM` | Remitente de los emails, ej. `"LlamaEats <tu-correo@gmail.com>"`. |
| `BLOB_READ_WRITE_TOKEN` | Token de un store de Vercel Blob (fotos de restaurantes). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp Business para el botón flotante de soporte, formato E.164 sin `+` (ej. `51987654321`). Vacío = botón oculto. |
| `CRON_SECRET` | Secreto compartido para autorizar el endpoint de expiración de reservas. |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (cliente). |
| `PAYMENT_PROVIDER` | `fake` en desarrollo (driver `FakeProvider`, simulado). |
| `SEED_ADMIN_EMAIL` / `SEED_OWNER_EMAIL` / `SEED_CLIENT_EMAIL` | Correos con los que el script de seed pre-crea las cuentas demo de cada rol. |

### Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → crea un
   proyecto (o usa uno existente).
2. **APIs & Services → OAuth consent screen**: configúralo en modo "External"
   y agrega tu correo como usuario de prueba si el app no está publicada.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**,
   tipo "Web application".
4. **Authorized redirect URIs**, agrega:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tu-dominio.vercel.app/api/auth/callback/google` (producción)
5. Copia el **Client ID** y **Client Secret** a `AUTH_GOOGLE_ID` /
   `AUTH_GOOGLE_SECRET`.

## 3. Base de datos

Crea un proyecto en [Neon](https://neon.tech) y copia la cadena de conexión
(la que incluye pooling) a `DATABASE_URL`.

Aplica el esquema:

```bash
npm run db:push       # aplica el esquema directo (rápido, para desarrollo)
# o, si prefieres generar y versionar migraciones SQL:
npm run db:generate
npm run db:push
```

El repo ya incluye la migración inicial generada en `drizzle/0000_*.sql` con
las 9 tablas, los enums, los índices únicos parciales (evitan doble reserva
sin bloquear un horario ya cancelado) y el check de rating 1–5.

### Seed (4 restaurantes ficticios de Puno + usuarios demo)

```bash
npm run db:seed
```

Esto crea:

- **Uros Lounge** (vista al lago, Chulluni) — aprobado
- **Peña Kantuta** (peña con show, Puno) — aprobado
- **La Chacra Puneña** (comida típica, Salcedo) — aprobado
- **Sabores del Altiplano** (comida típica, Puno) — **pendiente** (para probar
  la aprobación desde `/admin/restaurantes`)

Cada uno con mesas repartidas en 2 zonas, y algunas reservas de ejemplo
(completada con reseña, confirmada futura, pendiente hoy, cancelada) para que
los 3 dashboards no arranquen vacíos.

> **Usuarios demo**: como el login es solo Google o magic link (sin
> contraseña), el seed no puede "crear" cuentas usables directamente. En vez
> de eso, pre-crea las filas de `users` con el rol correcto para los correos
> definidos en `SEED_ADMIN_EMAIL` / `SEED_OWNER_EMAIL` / `SEED_CLIENT_EMAIL`.
> **Inicia sesión con exactamente esos correos** (por Google o magic link)
> para entrar como admin, dueño de restaurante o cliente.

## 4. Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 5. Cron de expiración de reservas (15 minutos)

Una reserva `pendiente` sin pagar expira a los 15 minutos. El endpoint
`GET /api/cron/expire-reservations` (protegido con
`Authorization: Bearer $CRON_SECRET`) recalcula y cancela todas las que ya
vencieron — es correcto sin importar cada cuánto se le llame.

`vercel.json` programa este cron a `"0 3 * * *"` (una vez al día), porque el
plan **Hobby de Vercel solo permite cron jobs con granularidad diaria**. Para
una expiración cercana a los 15 minutos reales:

- Usa **Vercel Pro** (permite cron cada 1 minuto), o
- Apunta un pinger externo (ej. [cron-job.org](https://cron-job.org)) cada
  5–15 min a `https://tu-dominio/api/cron/expire-reservations` con el header
  `Authorization: Bearer <CRON_SECRET>`.

## 6. Pagos

`src/lib/payments/provider.ts` define la interfaz `PaymentProvider`
(`charge`/`refund`). En desarrollo se usa `FakeProvider` (siempre aprueba, sin
credenciales reales). Para producción, implementa un nuevo driver (Culqi,
Mercado Pago) que cumpla la misma interfaz y regístralo en
`src/lib/payments/index.ts`; se selecciona con la variable `PAYMENT_PROVIDER`.

## 7. Deploy en Vercel

1. Importa el repo en Vercel.
2. Configura todas las variables de `.env.example` en el proyecto de Vercel
   (Production y Preview).
3. Actualiza el redirect URI de Google OAuth con tu dominio de producción.
4. El `vercel.json` ya configura el cron de expiración.
5. Corre `npm run db:push` (o `db:generate` + migración) y `npm run db:seed`
   apuntando a la `DATABASE_URL` de producción antes del primer deploy, o
   ejecútalos localmente contra la misma base de Neon.

## Estructura del proyecto

```
src/
  app/            # rutas (App Router): público, (auth), dashboard, restaurante, admin, api
  db/             # esquema Drizzle + clientes (neon-serverless y neon-http)
  actions/        # server actions (next-safe-action)
  lib/            # queries, validaciones, reservas, pagos, email, qr, blob
  components/     # ui (shadcn), animaciones, landing, dashboards por rol
scripts/seed.ts   # seed de datos demo
drizzle/          # migraciones SQL generadas
```

## Notas / limitaciones conocidas

- Sin `AUTH_GOOGLE_ID`/`SECRET`, el botón de Google no funciona (pero el
  magic link por correo sí, si configuraste SMTP). Sin `SMTP_USER`/
  `SMTP_PASSWORD`, los emails se loguean en consola en vez de enviarse.
- El "plano de mesas" es un grid agrupado por zona (el esquema de `tables` no
  trae coordenadas x/y para un editor de planos libre).
- La tarifa de servicio se calcula por categoría del restaurante dentro del
  rango pedido (S/ 3–5): `comida_tipica` S/3, `vista_al_lago` S/4,
  `peña_con_show` S/5 — ajustable en `src/lib/constants.ts`.
- **Promo de lanzamiento** ("Tu Mesa Te Espera"): mientras la fecha actual sea
  anterior a `LAUNCH_PROMO_END_DATE` (en `src/lib/constants.ts`, por defecto
  un mes desde el lanzamiento), la tarifa de servicio se cobra con S/1 menos.
  Se aplica automáticamente al crear la reserva y se muestra en la ficha del
  restaurante y en el paso de pago. Pasada esa fecha, vuelve al precio normal
  sin tocar código.
