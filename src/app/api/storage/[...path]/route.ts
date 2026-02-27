// src/app/api/storage/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;
    const filename = pathSegments.join("/");

    // Security: only allow alphanumeric, hyphens, dots in filename
    if (!/^[a-zA-Z0-9\-_.]+$/.test(filename)) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "storage", "certificates", filename);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType =
        ext === ".pdf"
            ? "application/pdf"
            : ext === ".png"
                ? "image/png"
                : "application/octet-stream";

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "public, max-age=86400",
        },
    });
}
