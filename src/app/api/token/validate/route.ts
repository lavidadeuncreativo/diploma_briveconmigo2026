// src/app/api/token/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const t = req.nextUrl.searchParams.get("t");

    if (!t) {
        return NextResponse.json({ valid: false, reason: "missing_token" }, { status: 400 });
    }

    const tokenRecord = await prisma.token.findUnique({
        where: { token: t },
        include: {
            event: true,
            certificate: true,
        },
    });

    if (!tokenRecord) {
        return NextResponse.json({ valid: false, reason: "not_found" }, { status: 200 });
    }

    // Check expiry
    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
        return NextResponse.json({ valid: false, reason: "expired" }, { status: 200 });
    }

    if (tokenRecord.status === "EXPIRED") {
        return NextResponse.json({ valid: false, reason: "expired" }, { status: 200 });
    }

    const event = tokenRecord.event;
    const alreadyGenerated = tokenRecord.status === "USED";

    return NextResponse.json({
        valid: true,
        email: tokenRecord.email,
        prefillName: tokenRecord.prefillName ?? null,
        alreadyGenerated,
        certificateId: tokenRecord.certificate?.id ?? null,
        event: {
            id: event.id,
            slug: event.slug,
            title: event.title,
            subtitle: event.subtitle,
            date: event.date,
            hours: event.hours,
            instructor: event.instructor,
            location: event.location,
        },
    });
}
