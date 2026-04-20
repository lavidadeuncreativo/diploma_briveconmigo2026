import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const email = "admin@brive.com";
    const password = "admin"; // Extreme simplicity for debugging

    // 1. Create tables first (just in case)
    const tables = [
        `CREATE TABLE IF NOT EXISTS "AdminUser" (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS "DiplomaTemplate" (id TEXT PRIMARY KEY, name TEXT, "backgroundImage" TEXT, "layoutConfig" TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS "Signer" (id TEXT PRIMARY KEY, name TEXT, position TEXT, signature TEXT, logo TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS "Session" (id TEXT PRIMARY KEY, slug TEXT UNIQUE, title TEXT, subtitle TEXT, date TIMESTAMP, duration TEXT, solution TEXT, "primaryColor" TEXT DEFAULT '#000000', "secondaryColor" TEXT DEFAULT '#e2e8f0', active BOOLEAN DEFAULT true, "validationMode" TEXT DEFAULT 'FREE', "copySharing" TEXT, "templateId" TEXT, "signerId" TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS "SessionAttendee" (id TEXT PRIMARY KEY, "sessionId" TEXT, email TEXT, name TEXT, token TEXT UNIQUE, validated BOOLEAN DEFAULT false, "createdAt" TIMESTAMP DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS "GeneratedCertificate" (id TEXT PRIMARY KEY, "sessionId" TEXT, name TEXT, email TEXT, "pdfUrl" TEXT, "pngUrl" TEXT, "certificateId" TEXT UNIQUE, "createdAt" TIMESTAMP DEFAULT NOW())`
    ];

    for (const sql of tables) {
        try { await prisma.$executeRawUnsafe(sql); } catch (e) {}
    }

    // 2. Create the emergency user
    await prisma.adminUser.upsert({
      where: { email },
      update: { password },
      create: { email, password, name: "Emergency Admin" }
    });

    return NextResponse.json({
      success: true,
      message: "Emergency access created!",
      credentials: { email, password },
      note: "Try logging in with these credentials now at /admin"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
