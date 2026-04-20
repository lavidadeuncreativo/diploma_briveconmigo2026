import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const signer = await prisma.signer.create({
      data: {
        name: data.name,
        position: data.position,
        signature: data.signature,
      },
    });
    return NextResponse.json(signer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create signer" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const signers = await prisma.signer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(signers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch signers" }, { status: 500 });
  }
}
