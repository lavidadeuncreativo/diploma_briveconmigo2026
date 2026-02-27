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
        const event = await prisma.event.findUnique({
            where: { slug },
        });

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
