// src/app/api/admin/fix-db/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // 1. Inspect existing columns
        const columns: any[] = await prisma.$queryRawUnsafe(`
            SELECT column_name, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'Certificate';
        `);

        // 2. Fix missing columns
        const columnNames = columns.map(c => c.column_name);

        if (!columnNames.includes('email')) {
            await prisma.$executeRawUnsafe('ALTER TABLE "Certificate" ADD COLUMN "email" TEXT;');
        }
        if (!columnNames.includes('company')) {
            await prisma.$executeRawUnsafe('ALTER TABLE "Certificate" ADD COLUMN "company" TEXT;');
        }

        // 3. Ensure tokenId is nullable (in case it was messed up)
        await prisma.$executeRawUnsafe('ALTER TABLE "Certificate" ALTER COLUMN "tokenId" DROP NOT NULL;');

        return NextResponse.json({
            success: true,
            columns: columns,
            message: "Database check complete. Added 'email' and 'company' if missing. Ensured 'tokenId' is nullable."
        });
    } catch (error: any) {
        console.error("[fix-db] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error)
        }, { status: 500 });
    }
}
