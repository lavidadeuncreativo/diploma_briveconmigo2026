// src/app/api/certificate/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const cert = await prisma.certificate.findUnique({
        where: { id },
        include: { event: true },
    });

    if (!cert) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

    return NextResponse.json({
        id: cert.id,
        fullName: cert.fullName,
        company: cert.company,
        template: cert.template,
        pdfUrl: cert.pdfPath,
        pngUrl: cert.pngPath,
        verifyUrl: `${baseUrl}/verify/${cert.id}`,
        createdAt: cert.createdAt,
        event: {
            id: cert.event.id,
            slug: cert.event.slug,
            title: cert.event.title,
            subtitle: cert.event.subtitle,
            date: cert.event.date,
            hours: cert.event.hours,
            instructor: cert.event.instructor,
        },
    });
}
