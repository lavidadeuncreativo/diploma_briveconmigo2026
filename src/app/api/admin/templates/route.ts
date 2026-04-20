import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const template = await prisma.diplomaTemplate.create({
      data: {
        name: data.name,
        backgroundImage: data.backgroundImage,
        layoutConfig: typeof data.layoutConfig === 'string' 
          ? data.layoutConfig 
          : JSON.stringify(data.layoutConfig),
      },
    });
    return NextResponse.json(template);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const templates = await prisma.diplomaTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}
