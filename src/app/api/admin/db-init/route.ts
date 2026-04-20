import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Check if database is already initialized by trying a simple query
    try {
        await prisma.adminUser.count();
        return NextResponse.json({ 
            success: true, 
            message: "La base de datos ya está inicializada. Puedes ir directo a /api/admin/setup" 
        });
    } catch (e) {
        // Table probably doesn't exist, proceed to create
        console.log("Database not initialized, starting creation...");
    }

    const sqlCommands = [
        `CREATE TABLE IF NOT EXISTS "AdminUser" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
        );`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");`,
        
        `CREATE TABLE IF NOT EXISTS "DiplomaTemplate" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "backgroundImage" TEXT NOT NULL,
            "layoutConfig" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "DiplomaTemplate_pkey" PRIMARY KEY ("id")
        );`,
        
        `CREATE TABLE IF NOT EXISTS "Signer" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "position" TEXT NOT NULL,
            "signature" TEXT NOT NULL,
            "logo" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Signer_pkey" PRIMARY KEY ("id")
        );`,
        
        `CREATE TABLE IF NOT EXISTS "Session" (
            "id" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "subtitle" TEXT,
            "date" TIMESTAMP(3) NOT NULL,
            "duration" TEXT,
            "solution" TEXT,
            "primaryColor" TEXT NOT NULL DEFAULT '#000000',
            "secondaryColor" TEXT DEFAULT '#e2e8f0',
            "active" BOOLEAN NOT NULL DEFAULT true,
            "validationMode" TEXT NOT NULL DEFAULT 'FREE',
            "copySharing" TEXT,
            "templateId" TEXT NOT NULL,
            "signerId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "Session_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DiplomaTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT "Session_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "Signer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Session_slug_key" ON "Session"("slug");`,
        
        `CREATE TABLE IF NOT EXISTS "SessionAttendee" (
            "id" TEXT NOT NULL,
            "sessionId" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "name" TEXT,
            "token" TEXT,
            "validated" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "SessionAttendee_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "SessionAttendee_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "SessionAttendee_token_key" ON "SessionAttendee"("token");`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "SessionAttendee_sessionId_email_key" ON "SessionAttendee"("sessionId", "email");`,
        
        `CREATE TABLE IF NOT EXISTS "GeneratedCertificate" (
            "id" TEXT NOT NULL,
            "sessionId" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "pdfUrl" TEXT NOT NULL,
            "pngUrl" TEXT NOT NULL,
            "certificateId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "GeneratedCertificate_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "GeneratedCertificate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "GeneratedCertificate_certificateId_key" ON "GeneratedCertificate"("certificateId");`,
        
        `CREATE TABLE IF NOT EXISTS "AuditLog" (
            "id" TEXT NOT NULL,
            "adminId" TEXT NOT NULL,
            "action" TEXT NOT NULL,
            "entity" TEXT NOT NULL,
            "entityId" TEXT NOT NULL,
            "details" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
        );`
    ];

    const executionResults = [];
    for (const sql of sqlCommands) {
        try {
            await prisma.$executeRawUnsafe(sql);
            executionResults.push({ sql: sql.substring(0, 50) + "...", status: "success" });
        } catch (e: any) {
            executionResults.push({ sql: sql.substring(0, 50) + "...", status: "error", message: e.message });
        }
    }

    return NextResponse.json({
      success: true,
      message: "Proceso de inicialización de tablas completado.",
      details: executionResults,
      nextStep: "Ahora visita /api/admin/setup para crear tu primer usuario."
    });
  } catch (error: any) {
    console.error("Critical Init error:", error);
    return NextResponse.json({
      success: false,
      error: "Error crítico durante la inicialización.",
      details: error.message
    }, { status: 500 });
  }
}
