// src/app/verify/[certificateId]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VerifyClient from "./VerifyClient";

interface Props {
    params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { certificateId } = await params;
    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

    const cert = await prisma.certificate.findUnique({
        where: { id: certificateId },
        include: { event: true },
    });

    if (!cert) {
        return { title: "Diploma no encontrado – Brivé" };
    }

    const pngUrl = `${baseUrl}${cert.pngPath}`;

    return {
        title: `Diploma – ${cert.fullName} | Brivé Conmigo 2026`,
        description: `${cert.fullName} completó: ${cert.event.title} – Brivé Conmigo 2026`,
        openGraph: {
            title: `Diploma – ${cert.fullName}`,
            description: `Completó: ${cert.event.title} – Brivé Conmigo 2026`,
            images: [
                {
                    url: pngUrl,
                    width: 1600,
                    height: 1130,
                    alt: `Diploma de ${cert.fullName}`,
                },
            ],
            type: "website",
            siteName: "Brivé Conmigo 2026",
        },
        twitter: {
            card: "summary_large_image",
            title: `Diploma – ${cert.fullName}`,
            description: `Completó: ${cert.event.title} – Brivé Conmigo 2026`,
            images: [pngUrl],
        },
    };
}

export default async function VerifyPage({ params }: Props) {
    const { certificateId } = await params;
    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

    const cert = await prisma.certificate.findUnique({
        where: { id: certificateId },
        include: { event: true },
    });

    if (!cert) {
        notFound();
    }

    const data = {
        id: cert.id,
        fullName: cert.fullName,
        company: cert.company,
        template: cert.template,
        pdfUrl: cert.pdfPath,
        pngUrl: cert.pngPath,
        createdAt: cert.createdAt.toISOString(),
        event: {
            id: cert.event.id,
            slug: cert.event.slug,
            title: cert.event.title,
            subtitle: cert.event.subtitle,
            date: cert.event.date,
            hours: cert.event.hours,
            instructor: cert.event.instructor,
        },
        verifyUrl: `${baseUrl}/verify/${cert.id}`,
    };

    return <VerifyClient data={data} />;
}
