import QRCode from "qrcode";
import { renderDynamicTemplate } from "./dynamicRenderer";

const isProduction = process.env.NODE_ENV === "production";

async function launchBrowser() {
    if (isProduction) {
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
        const puppeteer = await import("puppeteer");
        return puppeteer.default.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
        });
    }
}

async function saveFiles(
    certificateId: string,
    pngBuffer: Buffer,
    pdfBuffer: Buffer
): Promise<{ pngUrl: string; pdfUrl: string }> {
    if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
        const { put } = await import("@vercel/blob");
        const [png, pdf] = await Promise.all([
            put(`certificates/${certificateId}.png`, pngBuffer, { access: "public", contentType: "image/png" }),
            put(`certificates/${certificateId}.pdf`, pdfBuffer, { access: "public", contentType: "application/pdf" }),
        ]);
        return { pngUrl: png.url, pdfUrl: pdf.url };
    } else {
        const path = await import("path");
        const fs = await import("fs");
        const STORAGE_DIR = path.join(process.cwd(), "public", "storage", "certificates");
        if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

        const pngPath = path.join(STORAGE_DIR, `${certificateId}.png`);
        const pdfPath = path.join(STORAGE_DIR, `${certificateId}.pdf`);
        fs.writeFileSync(pngPath, pngBuffer);
        fs.writeFileSync(pdfPath, pdfBuffer);
        return {
            pngUrl: `/storage/certificates/${certificateId}.png`,
            pdfUrl: `/storage/certificates/${certificateId}.pdf`,
        };
    }
}

export async function generateSessionCertificate(params: {
    certificateId: string;
    fullName: string;
    session: any;
    baseUrl: string;
}): Promise<{ pngUrl: string; pdfUrl: string }> {
    const { certificateId, fullName, session, baseUrl } = params;

    const verifyUrl = `${baseUrl}/verify/${certificateId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
    });

    const html = renderDynamicTemplate({
        fullName,
        sessionTitle: session.title,
        sessionSubtitle: session.subtitle,
        date: new Date(session.date).toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' }),
        instructorName: session.signer.name,
        instructorPosition: session.signer.position,
        signatureUrl: session.signer.signature,
        backgroundImage: session.template.backgroundImage,
        qrDataUrl,
        layoutConfig: session.template.layoutConfig,
    });

    const browser = await launchBrowser();
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 1130, deviceScaleFactor: 2 });
        await page.setContent(html, { waitUntil: "networkidle0" });
        
        const [pngScreenshot, pdfData] = await Promise.all([
            page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1600, height: 1130 } }),
            page.pdf({ width: "1600px", height: "1130px", printBackground: true }),
        ]);

        return saveFiles(certificateId, Buffer.from(pngScreenshot), Buffer.from(pdfData));
    } finally {
        await browser.close();
    }
}
