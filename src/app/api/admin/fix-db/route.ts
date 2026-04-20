// src/app/api/admin/fix-db/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const results: any = {};
    try {
        // 1. Try to make tokenId nullable
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE "Certificate" ALTER COLUMN "tokenId" DROP NOT NULL;');
            results.tokenIdFix = "Success (DROP NOT NULL)";
        } catch (e: any) {
            results.tokenIdFix = `Error: ${e.message}`;
        }

        // 2. Add columns if missing
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "email" TEXT;');
            await prisma.$executeRawUnsafe('ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "company" TEXT;');
            results.columnsFix = "Success (ADD COLUMN IF NOT EXISTS)";
        } catch (e: any) {
            results.columnsFix = `Error: ${e.message}`;
        }

        // 3. Inspect final state
        const columns: any[] = await prisma.$queryRawUnsafe(`
            SELECT column_name, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'Certificate'
            ORDER BY column_name;
        `);

        return NextResponse.json({
            success: true,
            results,
            columns,
            message: "Database fix iteration complete."
        });
    } catch (error: any) {
        console.error("[fix-db] Critical Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error)
        }, { status: 500 });
    }
}
