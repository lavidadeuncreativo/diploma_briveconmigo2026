// src/lib/certificateGenerator.ts
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { renderTemplateA, TemplateData } from "./templates/templateA";
import { renderTemplateB } from "./templates/templateB";

const STORAGE_DIR = path.join(process.cwd(), "storage", "certificates");

function ensureStorageDir() {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
}

export async function generateCertificate(params: {
    certificateId: string;
    fullName: string;
    company?: string;
    template: "A" | "B";
    event: {
        title: string;
        subtitle?: string;
        date: string;
        hours?: string;
        instructor?: string;
        location?: string;
    };
    baseUrl: string;
}): Promise<{ pngPath: string; pdfPath: string; pngRelative: string; pdfRelative: string }> {
    ensureStorageDir();

    const { certificateId, fullName, company, template, event, baseUrl } = params;

    // Generate QR code
    const verifyUrl = `${baseUrl}/verify/${certificateId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: { dark: "#0B1220", light: "#FFFFFF" },
    });

    const templateData: TemplateData = {
        fullName,
        company,
        eventTitle: event.title,
        eventSubtitle: event.subtitle,
        eventDate: event.date,
        eventHours: event.hours,
        instructor: event.instructor,
        qrDataUrl,
        certificateId,
    };

    const html =
        template === "A"
            ? renderTemplateA(templateData)
            : renderTemplateB(templateData);

    const pngFilename = `${certificateId}.png`;
    const pdfFilename = `${certificateId}.pdf`;
    const pngPath = path.join(STORAGE_DIR, pngFilename);
    const pdfPath = path.join(STORAGE_DIR, pdfFilename);
    const pngRelative = `/api/storage/${pngFilename}`;
    const pdfRelative = `/api/storage/${pdfFilename}`;

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
        ],
    });

    try {
        const page = await browser.newPage();

        // Set viewport to match diploma dimensions
        await page.setViewport({ width: 1600, height: 1130, deviceScaleFactor: 2 });

        // Set HTML content and wait for fonts to load
        await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

        // Wait extra for Google Fonts to load (if available)
        await new Promise((r) => setTimeout(r, 800));

        // PNG screenshot
        await page.screenshot({
            path: pngPath,
            type: "png",
            clip: { x: 0, y: 0, width: 1600, height: 1130 },
            omitBackground: false,
        });

        // PDF export
        await page.pdf({
            path: pdfPath,
            width: "1600px",
            height: "1130px",
            printBackground: true,
            pageRanges: "1",
        });
    } finally {
        await browser.close();
    }

    return { pngPath, pdfPath, pngRelative, pdfRelative };
}
