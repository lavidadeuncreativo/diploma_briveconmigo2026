import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "Deployment is LIVE",
    timestamp: new Date().toISOString(),
    note: "If you see this, the deployment was successful. Now I will add the database checks back."
  });
}
