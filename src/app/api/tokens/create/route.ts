// src/app/api/tokens/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    // Protect with x-api-key
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = process.env.API_KEY;

    if (!apiKey || apiKey !== expectedKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { email, eventSlug, prefillName, expiresInDays } = body;

        if (!email || !eventSlug) {
            return NextResponse.json(
                { error: "Missing required fields: email, eventSlug" },
                { status: 400 }
            );
        }

        // Find event
        const event = await prisma.event.findUnique({ where: { slug: eventSlug } });

        if (!event) {
            return NextResponse.json({ error: `Event not found: ${eventSlug}` }, { status: 404 });
        }

        // Generate token
        const token = uuidv4();

        // Calculate expiry
        let expiresAt: Date | null = null;
        const days = expiresInDays ?? 30;
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        const tokenRecord = await prisma.token.create({
            data: {
                token,
                email,
                prefillName: prefillName ?? null,
                eventId: event.id,
                status: "ACTIVE",
                expiresAt,
            },
        });

        const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
        const url = `${baseUrl}/e/${eventSlug}?t=${tokenRecord.token}`;

        return NextResponse.json({ token: tokenRecord.token, url });
    } catch (error) {
        console.error("[tokens/create] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
