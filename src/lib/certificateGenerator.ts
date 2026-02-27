// src/lib/certificateGenerator.ts
import QRCode from "qrcode";
import { renderTemplateA, TemplateData } from "./templates/templateA";
import { renderTemplateB } from "./templates/templateB";

const isProduction = process.env.NODE_ENV === "production";

async function launchBrowser() {
    if (isProduction) {
        // Vercel / serverless: use lightweight chromium
        const chromium = (await import("@sparticuz/chromium-min")).default;
        const puppeteer = (await import("puppeteer-core")).default;
        return puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width: 1600, height: 1130 },
            executablePath: await chromium.executablePath(
                `https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar`
            ),
            headless: true,
        });
    } else {
        // Local dev: use full Puppeteer
        const puppeteer = await import("puppeteer");
        return puppeteer.default.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor",
            ],
        });
    }
}

async function saveFiles(
    certificateId: string,
    pngBuffer: Buffer,
    pdfBuffer: Buffer
): Promise<{ pngUrl: string; pdfUrl: string }> {
    if (isProduction) {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Vercel Blob in production
            const { put } = await import("@vercel/blob");
            const [png, pdf] = await Promise.all([
                put(`certificates/${certificateId}.png`, pngBuffer, {
                    access: "public",
                    contentType: "image/png",
                }),
                put(`certificates/${certificateId}.pdf`, pdfBuffer, {
                    access: "public",
                    contentType: "application/pdf",
                }),
            ]);
            return { pngUrl: png.url, pdfUrl: pdf.url };
        } else {
            // In production but no Blob token - this is a configuration error
            throw new Error("Vercel Blob token is missing. Please connect a Blob Store to your Vercel project (Settings -> Storage).");
        }
    } else {
        // Local filesystem fallback (using /tmp for better compatibility even locally)
        const path = await import("path");
        const fs = await import("fs");
        const STORAGE_DIR = path.join(process.cwd(), "storage", "certificates");

        if (!fs.existsSync(STORAGE_DIR)) {
            fs.mkdirSync(STORAGE_DIR, { recursive: true });
        }

        const pngPath = path.join(STORAGE_DIR, `${certificateId}.png`);
        const pdfPath = path.join(STORAGE_DIR, `${certificateId}.pdf`);
        fs.writeFileSync(pngPath, pngBuffer);
        fs.writeFileSync(pdfPath, pdfBuffer);
        return {
            pngUrl: `/api/storage/${certificateId}.png`,
            pdfUrl: `/api/storage/${certificateId}.pdf`,
        };
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
}): Promise<{ pngUrl: string; pdfUrl: string }> {
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

    const browser = await launchBrowser();

    let pngBuffer: Buffer;
    let pdfBuffer: Buffer;

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 1130, deviceScaleFactor: 2 });
        await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
        await new Promise((r) => setTimeout(r, 800));

        const pngScreenshot = await page.screenshot({
            type: "png",
            clip: { x: 0, y: 0, width: 1600, height: 1130 },
            omitBackground: false,
        });
        pngBuffer = Buffer.from(pngScreenshot);

        const pdfData = await page.pdf({
            width: "1600px",
            height: "1130px",
            printBackground: true,
            pageRanges: "1",
        });
        pdfBuffer = Buffer.from(pdfData);
    } finally {
        await browser.close();
    }

    return saveFiles(certificateId, pngBuffer, pdfBuffer);
}
