// src/app/api/token/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const t = req.nextUrl.searchParams.get("t");

    if (!t) {
        return NextResponse.json({ valid: false, reason: "missing_token" }, { status: 400 });
    }

    console.log(`[API] Validating token: "${t}"`);

    try {
        const tokenRecord = await prisma.token.findUnique({
            where: { token: t },
            include: {
                event: true,
                certificate: true,
            },
        });

        if (!tokenRecord) {
            console.warn(`[API] Token not found in DB: "${t}"`);
            return NextResponse.json({ valid: false, reason: "not_found" }, { status: 200 });
        }

        // Check expiry
        const now = new Date();
        if (tokenRecord.expiresAt && tokenRecord.expiresAt < now) {
            console.warn(`[API] Token expired: "${t}" (Expires: ${tokenRecord.expiresAt.toISOString()}, Now: ${now.toISOString()})`);
            return NextResponse.json({ valid: false, reason: "expired" }, { status: 200 });
        }

        if (tokenRecord.status === "EXPIRED") {
            console.warn(`[API] Token status is EXPIRED: "${t}"`);
            return NextResponse.json({ valid: false, reason: "expired" }, { status: 200 });
        }

        console.log(`[API] Token OK: ${tokenRecord.email} for event ${tokenRecord.event.slug}`);

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
    } catch (error) {
        console.error("[API] Validation CRASH:", error);
        return NextResponse.json({
            valid: false,
            reason: "error",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
