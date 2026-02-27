# Brivé Conmigo 2026 – Generador de Diplomas

Sistema completo para que los asistentes a eventos de Brivé generen, descarguen y compartan su diploma de participación a través de un enlace único.

---

## 🚀 Deploy en Vercel (recomendado)

### 1. Crear base de datos en Neon
1. Ve a [neon.tech](https://neon.tech) → crea un proyecto gratuito
2. Copia el **Connection string** (PostgreSQL)

### 2. Configurar Vercel Blob
1. En tu proyecto de Vercel → **Storage** → **Create Blob Store**
2. Vercel genera automáticamente `BLOB_READ_WRITE_TOKEN`

### 3. Deploy desde GitHub
1. Ve a [vercel.com](https://vercel.com) → **New Project** → importa `diploma_briveconmigo2026`
2. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Tu connection string de Neon |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob (auto-generado) |
| `APP_BASE_URL` | `https://tu-proyecto.vercel.app` |
| `API_KEY` | Una clave secreta segura para HubSpot |

3. Deploy → Vercel construirá tu app automáticamente

### 4. Migrar base de datos
Una vez deployado, corre en tu terminal local (con DATABASE_URL de Neon en .env):
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## ⚡ Desarrollo local

```bash
# 1. Clonar e instalar
git clone https://github.com/lavidadeuncreativo/diploma_briveconmigo2026.git
cd diploma_briveconmigo2026
npm install

# 2. Configurar .env.local (copia .env.example y completa DATABASE_URL con Neon)
cp .env.example .env.local

# 3. Migrar y poblar DB
npx prisma migrate dev --name init
npx prisma db seed

# 4. Iniciar
npm run dev
```

Demo link (después del seed):
```
http://localhost:3000/e/workshop-evaluacion-360?t=SEED_TOKEN_DEMO_2026
```

---

## 🔑 Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL (Neon): `postgresql://...` |
| `APP_BASE_URL` | URL del sitio (`https://tudominio.vercel.app`) |
| `API_KEY` | Clave para endpoint HubSpot `/api/tokens/create` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (se genera automáticamente) |
| `HUBSPOT_PRIVATE_APP_TOKEN` | Opcional |

---

## 📡 API

### `GET /api/token/validate?t={token}`
Valida el token y devuelve info del evento.

### `POST /api/certificate/generate`
Genera el diploma (PDF+PNG). Marca token como USED.
```json
{ "token": "...", "template": "A|B", "fullName": "...", "company": "..." }
```

### `GET /api/certificate/{id}` — Metadatos del certificado

### `POST /api/tokens/create` *(Header: x-api-key)*
Para HubSpot. Crea token y devuelve `{ url }`.
```json
{ "email": "...", "eventSlug": "...", "prefillName": "..." }
```

---

## 🔧 Integración HubSpot

**Custom Code Action (Node.js) en HubSpot Workflow:**
```js
const axios = require("axios");
const response = await axios.post(`${process.env.SITE_URL}/api/tokens/create`, {
  email: contact.properties.email,
  eventSlug: "workshop-evaluacion-360",
  prefillName: `${contact.properties.firstname} ${contact.properties.lastname}`
}, {
  headers: { "x-api-key": process.env.API_KEY }
});
// response.data.url → insertar en email como botón CTA
```

---

## 🎨 Templates de diploma

| Template A — Editorial Claro | Template B — Dark Premium |
|---|---|
| Fondo off-white gradiente | Fondo navy/charcoal |
| Tipografía navy + acento teal | Tipografía blanca + teal |
| Layout editorial clásico | Layout moderno 2 columnas |
| QR abajo derecha | QR en recuadro dedicado |

Dimensiones: **1600 × 1130 px** PNG + PDF A4 landscape.
