# Brivé Conmigo - Plataforma de Diplomas 2026

Esta es una plataforma profesional para la gestión de sesiones, webinars y generación de certificados dinámicos para Brivé Conmigo.

## Características Principales

- **Panel Admin**: CRUD de sesiones, plantillas y firmantes.
- **Carga Masiva**: Importación de asistentes mediante CSV.
- **Motor Dinámico**: Generación de PNG/PDF basada en coordenadas configurables.
- **Validación Flexible**: Soporte para sesiones libres, por lista de asistentes o por token único.
- **Branding Personalizable**: Colores, logos y firmas dinámicas por sesión.
- **Compartir**: Integración directa con WhatsApp y LinkedIn (vía URL de verificación).

## Requisitos Previos

- **Node.js 18+**
- **Base de Datos PostgreSQL** (Recomendado: Neon.tech)
- **Vercel Blob Storage** (Para almacenamiento de assets y certificados)

## Configuración de Entorno (.env)

Copia el archivo `.env.example` a `.env` y completa las variables:

```bash
DATABASE_URL="tu_url_de_neon"
BLOB_READ_WRITE_TOKEN="tu_token_de_vercel_blob"
ADMIN_EMAIL="admin@brive.com"
ADMIN_PASSWORD="tu_password_segura"
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

## Estructura de Datos (Prisma)

El proyecto utiliza un esquema escalable con las siguientes entidades:
- `Session`: El evento o webinar.
- `DiplomaTemplate`: La base visual y configuración de campos.
- `Signer`: Información del instructor/director y su firma.
- `SessionAttendee`: Lista de personas autorizadas.
- `GeneratedCertificate`: Registro histórico de diplomas emitidos.

## Despliegue en Vercel (Instrucciones Exactas)

1. **Crear Proyecto**: Haz un nuevo proyecto en Vercel vinculado a este repositorio.
2. **Variables de Entorno**: Agrega todas las variables del `.env` en la consola de Vercel.
3. **Almacenamiento**:
   - Ve a la pestaña **Storage** en tu proyecto de Vercel.
   - Crea un **Vercel Blob** store y conéctalo al proyecto. Esto generará automáticamente la variable `BLOB_READ_WRITE_TOKEN`.
4. **Base de Datos**:
   - Si usas Neon, asegúrate de que la IP de Vercel tenga acceso o usa el connection string de pooling.
5. **Build**: Ejecuta `npx prisma generate` como parte del script de `postinstall` (ya configurado en `package.json`).

## Configuración de Subdominio Brivé

Para conectar un subdominio (ej: `diplomas.brive.com.mx`):
1. En Vercel: Ve a **Settings > Domains**.
2. Agrega tu subdominio.
3. En tu proveedor de DNS (GoDaddy, Cloudflare, etc.):
   - Crea un registro **CNAME** apuntando a `cname.vercel-dns.com`.
   - Espera a que se propaguen los cambios y Vercel emita el certificado SSL automáticamente.

## Uso del Panel Admin

Accede a `/admin` para gestionar la plataforma. La primera vez que ingreses con las credenciales del `.env`, se creará el usuario administrador en la base de datos.
- Primero crea un **Signer** (Firmante).
- Luego crea un **Template** (Plantilla) subiendo el fondo del diploma.
- Finalmente crea una para una **Session** vinculando ambos y subiendo tu lista de asistentes si es necesario.
