// src/lib/analytics.ts
type EventName =
    | "certificate_generate_click"
    | "certificate_generate_success"
    | "certificate_download_pdf"
    | "certificate_download_png"
    | "certificate_share_linkedin"
    | "certificate_share_whatsapp"
    | "certificate_copy_verify_link";

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

export function trackEvent(
    eventName: EventName,
    params?: Record<string, unknown>
): void {
    if (process.env.NODE_ENV !== "production") {
        console.log(`[Analytics] ${eventName}`, params ?? {});
        return;
    }

    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, params ?? {});
    }
}
