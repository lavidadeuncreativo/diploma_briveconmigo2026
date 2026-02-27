import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    try {
        let event = await prisma.event.findUnique({
            where: { slug },
        });

        // Auto-seed: If this is the main workshop and it's missing, create it
        if (!event && slug === "workshop-evaluacion-360") {
            try {
                event = await prisma.event.create({
                    data: {
                        slug: "workshop-evaluacion-360",
                        title: "Workshop: Cómo convertir la evaluación 360° en decisiones reales de talento",
                        subtitle: "Del diagnóstico al desarrollo de talento",
                        date: "15 de marzo de 2026",
                        hours: "3 horas",
                        instructor: "Equipo Brivé",
                        location: "Online",
                    },
                });
                console.log("[API] Auto-seeded workshop event");
            } catch (seedError) {
                console.warn("[API] Seed parallel race or error:", seedError);
                event = await prisma.event.findUnique({ where: { slug } });
            }
        }

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: event.id,
            slug: event.slug,
            title: event.title,
            subtitle: event.subtitle,
            date: event.date,
            hours: event.hours,
            instructor: event.instructor,
            location: event.location,
        });
    } catch (error) {
        console.error("[API] Event Fetch Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
