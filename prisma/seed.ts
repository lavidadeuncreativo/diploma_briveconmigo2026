// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required for seeding.");
}

const prisma = new PrismaClient();

async function main() {
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

    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
    console.log("✅ Token demo creado:", token.token);
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎓 Demo link: ${baseUrl}/e/workshop-evaluacion-360?t=SEED_TOKEN_DEMO_2026`);
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
