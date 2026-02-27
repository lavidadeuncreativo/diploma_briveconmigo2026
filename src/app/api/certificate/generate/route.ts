// src/app/api/certificate/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCertificate } from "@/lib/certificateGenerator";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds for Puppeteer / chromium-min

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token: tokenStr, eventSlug, template, fullName, company } = body;

        if ((!tokenStr && !eventSlug) || !template || !fullName) {
            return NextResponse.json(
                { error: "Missing required fields: (token or eventSlug), template, fullName" },
                { status: 400 }
            );
        }

        if (template !== "A" && template !== "B") {
            return NextResponse.json({ error: "Invalid template. Must be A or B" }, { status: 400 });
        }

        let event;
        let tokenRecord = null;

        if (tokenStr) {
            tokenRecord = await prisma.token.findUnique({
                where: { token: tokenStr },
                include: { event: true, certificate: true },
            });

            if (!tokenRecord) {
                return NextResponse.json({ error: "Token not found" }, { status: 404 });
            }

            if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
                return NextResponse.json({ error: "Token expired" }, { status: 403 });
            }

            if (tokenRecord.status === "EXPIRED") {
                return NextResponse.json({ error: "Token expired" }, { status: 403 });
            }

            // If already used, return existing certificate
            if (tokenRecord.status === "USED" && tokenRecord.certificate) {
                const cert = tokenRecord.certificate;
                const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
                return NextResponse.json({
                    certificateId: cert.id,
                    pdfUrl: cert.pdfPath,
                    pngUrl: cert.pngPath,
                    verifyUrl: `${baseUrl}/verify/${cert.id}`,
                    alreadyGenerated: true,
                });
            }
            event = tokenRecord.event;
        } else {
            // Guest access: find event by slug
            event = await prisma.event.findUnique({
                where: { slug: eventSlug },
            });

            if (!event) {
                return NextResponse.json({ error: "Event not found" }, { status: 404 });
            }
        }

        const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

        const { v4: uuidv4 } = await import("uuid");
        const certificateId = uuidv4();

        // Generate PNG + PDF (Vercel Blob or local)
        const { pngUrl, pdfUrl } = await generateCertificate({
            certificateId,
            fullName: fullName.trim(),
            company: company?.trim() || undefined,
            template: template as "A" | "B",
            event: {
                title: event.title,
                subtitle: event.subtitle ?? undefined,
                date: event.date,
                hours: event.hours ?? undefined,
                instructor: event.instructor ?? undefined,
                location: event.location ?? undefined,
            },
            baseUrl,
        });

        const certificate = await prisma.certificate.create({
            data: {
                id: certificateId,
                eventId: event.id,
                tokenId: tokenRecord?.id ?? null,
                fullName: fullName.trim(),
                company: company?.trim() || null,
                template,
                pdfPath: pdfUrl,
                pngPath: pngUrl,
            },
        });

        if (tokenRecord) {
            await prisma.token.update({
                where: { id: tokenRecord.id },
                data: { status: "USED", usedAt: new Date() },
            });
        }

        return NextResponse.json({
            certificateId: certificate.id,
            pdfUrl,
            pngUrl,
            verifyUrl: `${baseUrl}/verify/${certificate.id}`,
            alreadyGenerated: false,
        });
    } catch (error: any) {
        console.error("[generate] Error:", error);
        return NextResponse.json(
            {
                error: "Error generating certificate",
                details: error?.message || String(error)
            },
            { status: 500 }
        );
    }
}
