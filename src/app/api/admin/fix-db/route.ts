// src/app/api/admin/fix-db/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    // Basic protection: check for a secret in the URL or just let it be temporary
    const secret = req.nextUrl.searchParams.get("secret")?.trim()?.toLowerCase();
    if (secret !== "brive2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // SQL to add the email column if it doesn't exist
        // We use model name "Certificate" which Prisma maps to the same name in PG
        await prisma.$executeRawUnsafe(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Certificate' AND column_name='email') THEN 
                    ALTER TABLE "Certificate" ADD COLUMN "email" TEXT; 
                END IF; 
            END $$;
        `);

        return NextResponse.json({
            success: true,
            message: "Database schema updated successfully. The 'email' column has been added."
        });
    } catch (error: any) {
        console.error("[fix-db] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error)
        }, { status: 500 });
    }
}
