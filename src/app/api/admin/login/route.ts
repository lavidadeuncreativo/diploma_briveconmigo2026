import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// In a real app, use a library like jose or next-auth
// For now, we compare passwords and set a simple session cookie
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Check against AdminUser table
    // For the very first run, if no admin exists, we could check against ENVs
    const adminCount = await prisma.adminUser.count();
    
    if (adminCount === 0) {
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        // Create the first admin if it doesn't exist
        await prisma.adminUser.create({
          data: {
            email,
            password, // Should be hashed!
            name: "Initial Admin",
          },
        });
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin || admin.password !== password) { // Use proper hash comparison in production
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
