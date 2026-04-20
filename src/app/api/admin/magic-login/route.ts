import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const email = "admin@brive.com";
    
    // Find the emergency user we created earlier
    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!admin) {
      return NextResponse.json({ 
        error: "User not found. Run /api/admin/emergency-init first." 
      }, { status: 404 });
    }

    // Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Redirect to the dashboard
    return NextResponse.redirect(new URL("/admin/sessions", process.env.NEXT_PUBLIC_APP_URL || "https://diploma-briveconmigo2026.vercel.app"));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
