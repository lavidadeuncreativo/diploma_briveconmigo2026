import { prisma } from "@/lib/prisma";
import { generateSessionCertificate } from "@/lib/certificateGenerator";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { name, email, token } = await req.json();
    const { slug } = await params;

    // 1. Fetch Session
    const session = await prisma.session.findUnique({
      where: { slug: slug, active: true },
      include: { template: true, signer: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found or inactive" }, { status: 404 });
    }

    // 2. Validation Logic
    if (session.validationMode === "ATTENDEE_LIST") {
      const attendee = await prisma.sessionAttendee.findUnique({
        where: { sessionId_email: { sessionId: session.id, email: email } },
      });
      if (!attendee) {
        return NextResponse.json({ error: "No estás en la lista de asistentes autorizados." }, { status: 403 });
      }
      // Update attendee as validated
      await prisma.sessionAttendee.update({
        where: { id: attendee.id },
        data: { validated: true, name: name }, // Update name with the one input by user if desired
      });
    } else if (session.validationMode === "TOKEN") {
      const attendee = await prisma.sessionAttendee.findUnique({
        where: { token: token },
      });
      if (!attendee || attendee.sessionId !== session.id || attendee.validated) {
        return NextResponse.json({ error: "Token inválido o ya utilizado." }, { status: 403 });
      }
      await prisma.sessionAttendee.update({
        where: { id: attendee.id },
        data: { validated: true, name: name },
      });
    }

    // 3. Check if already generated (Optional, but good for performance)
    // We'll just generate a new one for now to ensure name corrections work.

    // 4. Generate Certificate
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const certificateId = Math.random().toString(36).substr(2, 9).toUpperCase();

    const { pngUrl, pdfUrl } = await generateSessionCertificate({
      certificateId,
      fullName: name,
      session: session,
      baseUrl,
    });

    // 5. Save Record
    const generated = await prisma.generatedCertificate.create({
      data: {
        sessionId: session.id,
        name: name,
        email: email || "guest@brive.com",
        pdfUrl,
        pngUrl,
        certificateId,
      },
    });

    return NextResponse.json(generated);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Error al generar el diploma." }, { status: 500 });
  }
}
