# Brivé Conmigo 2026 – Generador de Diplomas

Sistema completo para que los asistentes a eventos de Brivé generen, descarguen y compartan su diploma de participación a través de un enlace único enviado por email.

---

## ⚡ Inicio rápido (local)

```bash
# 1. Instalar dependencias
npm install

# 2. Migración de base de datos
npx prisma migrate dev --name init

# 3. Generar cliente Prisma
npx prisma generate

# 4. Poblar base de datos con evento y token demo
npx prisma db seed

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abre en el navegador:

```
http://localhost:3000/e/workshop-evaluacion-360?t=SEED_TOKEN_DEMO_2026
```

---

## 🔑 Variables de entorno

Copia `.env.example` a `.env.local` y ajusta:

| Variable | Descripción | Default |
|---|---|---|
| `APP_BASE_URL` | URL base del sitio | `http://localhost:3000` |
| `API_KEY` | Clave secreta para crear tokens (HubSpot) | `dev_secret_key_change_me` |
| `STORAGE_MODE` | `local` (carpeta `storage/`) | `local` |
| `HUBSPOT_PRIVATE_APP_TOKEN` | Opcional, para notificar a HubSpot | — |

---

## 🔗 Flujo end-to-end

1. **HubSpot** → llama `POST /api/tokens/create` y obtiene un `url` con token único
2. **Email** → contiene enlace `https://dominio/e/{eventSlug}?t={token}`
3. **Usuario** → abre enlace, elige diseño, confirma datos, genera diploma
4. **Diploma** → descarga PDF/PNG, comparte en LinkedIn/WhatsApp
5. **Verificación** → `/verify/{certificateId}` muestra diploma y OpenGraph para LinkedIn

---

## 📡 API

### `GET /api/token/validate?t={token}`
Valida el token. Devuelve evento, email, y si ya fue generado.

### `POST /api/certificate/generate`
Genera el diploma (Puppeteer PDF+PNG). Marca token como USED.
```json
{ "token": "...", "template": "A|B", "fullName": "...", "company": "..." }
```

### `GET /api/certificate/{id}`
Metadatos del certificado.

### `POST /api/tokens/create` *(x-api-key requerido)*
Crear token para HubSpot. Devuelve `{ url }`.
```json
{ "email": "...", "eventSlug": "...", "prefillName": "..." }
```

---

## 🔧 Integración HubSpot

**Custom Code Action (Node.js):**
```js
const response = await axios.post(`${SITE_URL}/api/tokens/create`, {
  email: contact.properties.email,
  eventSlug: "workshop-evaluacion-360",
  prefillName: contact.properties.firstname + " " + contact.properties.lastname
}, {
  headers: { "x-api-key": API_KEY }
});

// Insertar response.url en el email como botón CTA
```

**Webhook:** Configurar en HubSpot Workflow como HTTP Request POST con los mismos campos y header `x-api-key`.

---

## 📁 Estructura

```
src/
  app/
    e/[eventSlug]/          # Generador principal
    verify/[certificateId]/ # Verificación pública (OG tags)
    api/
      token/validate/       # Validación de token
      certificate/
        generate/           # Generación PDF+PNG
        [id]/               # Metadatos
      tokens/create/        # Crear token (HubSpot)
      storage/[...path]/    # Servir archivos generados
  lib/
    prisma.ts               # Cliente Prisma singleton
    analytics.ts            # Tracking GA4-ready
    certificateGenerator.ts # Puppeteer PDF+PNG
    templates/
      templateA.ts          # Diseño claro editorial
      templateB.ts          # Diseño dark premium
prisma/
  schema.prisma             # Modelos: Event, Token, Certificate
  seed.ts                   # Datos demo
storage/certificates/       # PDFs y PNGs generados
```

---

## 🎨 Templates

| | Template A | Template B |
|---|---|---|
| Fondo | Off-white gradiente | Navy/charcoal oscuro |
| Acento | Teal (#2EE59D) | Teal (#2EE59D) |
| Layout | Editorial clásico | Moderno 2 columnas |
| QR | Abajo derecha | Card separada |

---

## 📊 Modelo de datos

- **Event**: slug único, título, subtítulo, fecha, horas, instructor
- **Token**: ligado a email+evento, estados ACTIVE/USED/EXPIRED, expiración opcional
- **Certificate**: ligado a token+evento, guarda la ruta del PDF/PNG generado
