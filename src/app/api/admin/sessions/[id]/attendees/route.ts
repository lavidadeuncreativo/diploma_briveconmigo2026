import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { attendees } = await req.json();
    const { id } = await params;

    // Bulk upsert would be ideal, but for now we'll do it in a transaction
    // to ensure basic data integrity.
    await prisma.$transaction(
      attendees.map((attendee: any) =>
        prisma.sessionAttendee.upsert({
          where: {
            sessionId_email: {
              sessionId: id,
              email: attendee.email,
            },
          },
          create: {
            sessionId: id,
            email: attendee.email,
            name: attendee.name,
          },
          update: {
            name: attendee.name,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: attendees.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload attendees" }, { status: 500 });
  }
}
