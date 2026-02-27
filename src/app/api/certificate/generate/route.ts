// src/app/api/certificate/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCertificate } from "@/lib/certificateGenerator";

export const maxDuration = 60; // Allow up to 60 seconds for Puppeteer

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token: tokenStr, template, fullName, company } = body;

        if (!tokenStr || !template || !fullName) {
            return NextResponse.json(
                { error: "Missing required fields: token, template, fullName" },
                { status: 400 }
            );
        }

        if (template !== "A" && template !== "B") {
            return NextResponse.json({ error: "Invalid template. Must be A or B" }, { status: 400 });
        }

        // Fetch token
        const tokenRecord = await prisma.token.findUnique({
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

        const event = tokenRecord.event;
        const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

        // Create a placeholder certificate ID
        const { v4: uuidv4 } = await import("uuid");
        const certificateId = uuidv4();

        // Generate PNG + PDF
        const { pngRelative, pdfRelative } = await generateCertificate({
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

        // Create Certificate record
        const certificate = await prisma.certificate.create({
            data: {
                id: certificateId,
                eventId: event.id,
                tokenId: tokenRecord.id,
                fullName: fullName.trim(),
                company: company?.trim() || null,
                template,
                pdfPath: pdfRelative,
                pngPath: pngRelative,
            },
        });

        // Mark token as USED
        await prisma.token.update({
            where: { id: tokenRecord.id },
            data: { status: "USED", usedAt: new Date() },
        });

        return NextResponse.json({
            certificateId: certificate.id,
            pdfUrl: pdfRelative,
            pngUrl: pngRelative,
            verifyUrl: `${baseUrl}/verify/${certificate.id}`,
            alreadyGenerated: false,
        });
    } catch (error) {
        console.error("[generate] Error:", error);
        return NextResponse.json(
            { error: "Internal server error generating certificate" },
            { status: 500 }
        );
    }
}
