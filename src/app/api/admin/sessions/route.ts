import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const session = await prisma.session.create({
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        date: data.date,
        duration: data.duration,
        solution: data.solution,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        validationMode: data.validationMode,
        templateId: data.templateId,
        signerId: data.signerId,
      },
    });
    return NextResponse.json(session);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: { template: true, signer: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
