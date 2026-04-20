// src/app/verify/[certificateId]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VerifyClient from "./VerifyClient";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { certificateId } = await params;
    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

    const cert = await prisma.generatedCertificate.findUnique({
        where: { id: certificateId || "" },
        include: { session: true },
    });

    if (!cert) {
        // Fallback for certificateId lookup if id is not matching
        const certByCertId = await prisma.generatedCertificate.findUnique({
          where: { certificateId: certificateId },
          include: { session: true },
        });
        if (!certByCertId) return { title: "Diploma no encontrado – Brivé" };
        
        const pngUrl = certByCertId.pngUrl.startsWith("http") ? certByCertId.pngUrl : `${baseUrl}${certByCertId.pngUrl}`;
        return {
          title: `Diploma – ${certByCertId.name} | Brivé Conmigo 2026`,
          description: `${certByCertId.name} completó: ${certByCertId.session.title} – Brivé Conmigo 2026`,
          openGraph: {
              title: `Diploma – ${certByCertId.name}`,
              images: [{ url: pngUrl, width: 1600, height: 1130 }],
          }
        };
    }

    const pngUrl = cert.pngUrl.startsWith("http") ? cert.pngUrl : `${baseUrl}${cert.pngUrl}`;

    return {
        title: `Diploma – ${cert.name} | Brivé Conmigo 2026`,
        description: `${cert.name} completó: ${cert.session.title} – Brivé Conmigo 2026`,
        openGraph: {
            title: `Diploma – ${cert.name}`,
            description: `Completó: ${cert.session.title} – Brivé Conmigo 2026`,
            images: [
                {
                    url: pngUrl,
                    width: 1600,
                    height: 1130,
                    alt: `Diploma de ${cert.name}`,
                },
            ],
            type: "website",
            siteName: "Brivé Conmigo 2026",
        },
        twitter: {
            card: "summary_large_image",
            title: `Diploma – ${cert.name}`,
            description: `Completó: ${cert.session.title} – Brivé Conmigo 2026`,
            images: [pngUrl],
        },
    };
}

export default async function VerifyPage({ params }: Props) {
    const { certificateId } = await params;
    
    let cert = await prisma.generatedCertificate.findUnique({
        where: { id: certificateId },
        include: { session: { include: { signer: true } } },
    });

    if (!cert) {
      cert = await prisma.generatedCertificate.findUnique({
        where: { certificateId: certificateId },
        include: { session: { include: { signer: true } } },
      });
    }

    if (!cert) {
        notFound();
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const data = {
        id: cert.id,
        fullName: cert.name,
        template: "Session Template",
        pdfUrl: cert.pdfUrl,
        pngUrl: cert.pngUrl,
        createdAt: cert.createdAt.toISOString(),
        verifyUrl: `${baseUrl}/verify/${cert.id}`,
        event: {
            id: cert.session.id,
            slug: cert.session.slug,
            title: cert.session.title,
            subtitle: cert.session.subtitle,
            date: cert.session.date,
            instructor: cert.session.signer.name,
        },
    };

    return <VerifyClient data={data} />;
}
