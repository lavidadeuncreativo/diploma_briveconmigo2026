// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create demo event
    const event = await prisma.event.upsert({
        where: { slug: "workshop-evaluacion-360" },
        update: {},
        create: {
            slug: "workshop-evaluacion-360",
            title: "Workshop: Cómo convertir la evaluación 360° en decisiones reales de talento",
            subtitle: "Del diagnóstico al desarrollo de talento",
            date: "15 de marzo de 2026",
            hours: "3 horas",
            instructor: "Equipo Brivé",
            location: "Online",
        },
    });

    console.log("✅ Evento creado:", event.slug);

    // Create demo token
    const demoToken = "SEED_TOKEN_DEMO_2026";

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    const token = await prisma.token.upsert({
        where: { token: demoToken },
        update: {},
        create: {
            token: demoToken,
            email: "demo@brive.mx",
            prefillName: "María González",
            eventId: event.id,
            status: "ACTIVE",
            expiresAt,
        },
    });

    console.log("✅ Token demo creado:", token.token);
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎓 Demo link: http://localhost:3000/e/workshop-evaluacion-360?t=SEED_TOKEN_DEMO_2026");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
    .catch((e: unknown) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
