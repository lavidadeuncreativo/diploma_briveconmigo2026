import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Check Connectivity
    await prisma.$connect();
    
    // 2. Try simple query
    const adminCount = await prisma.adminUser.count();
    
    // 3. Check ENV presence (without showing values)
    const envs = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    };

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      adminCount,
      envs
    });
  } catch (error: any) {
    console.error("DB DEBUG ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Database connection FAILED.",
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split("\n").slice(0, 3) // Keep it brief
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
