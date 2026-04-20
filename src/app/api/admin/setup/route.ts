import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({
        error: "ADMIN_EMAIL and ADMIN_PASSWORD must be set in Environment Variables (Vercel Console)."
      }, { status: 400 });
    }

    // Upsert the admin user
    const admin = await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { password: adminPassword },
      create: {
        email: adminEmail,
        password: adminPassword,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created/updated successfully.",
      user: { email: admin.email }
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({
      success: false,
      error: "Database error. Did you run 'npx prisma db push' yet?",
      details: error.message
    }, { status: 500 });
  }
}
