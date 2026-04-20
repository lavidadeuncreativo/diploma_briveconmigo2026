// src/app/api/download/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    const filename = req.nextUrl.searchParams.get("filename") || "diploma";

    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch file");

        const blob = await response.blob();
        const headers = new Headers();

        // Ensure the browser treats this as a download
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Content-Type", blob.type);

        return new NextResponse(blob, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error("[download] Error:", error);
        return NextResponse.json({ error: "Error downloading file" }, { status: 500 });
    }
}
