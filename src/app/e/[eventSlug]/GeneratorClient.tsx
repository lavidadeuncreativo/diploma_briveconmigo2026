"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventInfo {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    date: string;
    hours?: string;
    instructor?: string;
    location?: string;
}

interface ValidateResponse {
    valid: boolean;
    reason?: string;
    message?: string; // Added for diagnostics
    email?: string;
    prefillName?: string | null;
    alreadyGenerated?: boolean;
    certificateId?: string | null;
    event?: EventInfo;
}

interface GenerateResult {
    certificateId: string;
    pdfUrl: string;
    pngUrl: string;
    verifyUrl: string;
}

type AppState =
    | "validating"
    | "invalid"
    | "already_generated"
    | "ready"
    | "generating"
    | "done"
    | "error";

// ─── Toast Component ───────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDone, 1800);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
                <div
                    style={{
                        background: "#0B1220",
                        color: "#2EE59D",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        fontWeight: 500,
                        padding: "10px 20px",
                        borderRadius: 100,
                        whiteSpace: "nowrap",
                        boxShadow: "0 8px 32px rgba(11,18,32,0.25)",
                    }}
                >
                    {message}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({
    id,
    selected,
    onClick,
}: {
    id: "A" | "B";
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            style={{
                flex: 1,
                border: selected ? "2px solid #2EE59D" : "1px solid rgba(11,18,32,0.10)",
                borderRadius: 16,
                padding: "12px 10px 10px",
                background: selected ? "rgba(46,229,157,0.06)" : "white",
                cursor: "pointer",
                transition: "all 0.18s ease",
                outline: "none",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Mini diploma preview */}
            {id === "A" ? (
                <div
                    style={{
                        width: "100%",
                        aspectRatio: "1600/1130",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #FAFBFD 0%, #EEF0F8 100%)",
                        border: "1px solid rgba(11,18,32,0.06)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ height: 4, background: "linear-gradient(90deg, #0B1220, #2EE59D, #0B1220)" }} />
                    <div style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ fontSize: 5, fontWeight: 700, color: "#0B1220", fontFamily: "Space Grotesk, sans-serif" }}>Brivé</div>
                        <div style={{ width: "40%", height: 1.5, background: "linear-gradient(90deg,#2EE59D,transparent)", borderRadius: 1 }} />
                        <div style={{ fontSize: 4, color: "rgba(11,18,32,0.4)", marginTop: 2 }}>CERTIFICA QUE</div>
                        <div style={{ fontSize: 7, fontWeight: 700, color: "#0B1220", fontFamily: "Space Grotesk, sans-serif", lineHeight: 1 }}>Tu Nombre</div>
                        <div style={{ marginTop: 3, background: "rgba(11,18,32,0.04)", border: "1px solid rgba(11,18,32,0.08)", borderRadius: 4, padding: "3px 5px" }}>
                            <div style={{ fontSize: 3.5, color: "#2EE59D", fontWeight: 700, background: "#0B1220", borderRadius: 100, padding: "1px 4px", width: "fit-content", marginBottom: 2 }}>WORKSHOP</div>
                            <div style={{ fontSize: 4, color: "#0B1220", fontWeight: 600 }}>Workshop Brivé</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        width: "100%",
                        aspectRatio: "1600/1130",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #0B1220, #111B2E)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 2, background: "linear-gradient(180deg, #2EE59D, transparent)" }} />
                    <div style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ fontSize: 5, fontWeight: 700, color: "white", fontFamily: "Space Grotesk, sans-serif" }}>Bri<span style={{ color: "#2EE59D" }}>v</span>é</div>
                        <div style={{ width: "40%", height: 1.5, background: "linear-gradient(90deg,#2EE59D,transparent)", borderRadius: 1 }} />
                        <div style={{ fontSize: 4, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>CERTIFICA QUE</div>
                        <div style={{ fontSize: 7, fontWeight: 700, color: "white", fontFamily: "Space Grotesk, sans-serif", lineHeight: 1 }}>Tu Nombre</div>
                        <div style={{ marginTop: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "3px 5px" }}>
                            <div style={{ fontSize: 3.5, color: "#2EE59D", fontWeight: 700, border: "1px solid rgba(46,229,157,0.3)", borderRadius: 100, padding: "1px 4px", width: "fit-content", marginBottom: 2 }}>WORKSHOP</div>
                            <div style={{ fontSize: 4, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Workshop Brivé</div>
                        </div>
                    </div>
                </div>
            )}

            <div
                style={{
                    marginTop: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: selected ? "#2EE59D" : "#0B1220",
                    fontFamily: "'Space Grotesk', sans-serif",
                    transition: "color 0.18s",
                }}
            >
                {id === "A" ? "✦ Editorial Claro" : "✦ Dark Premium"}
            </div>

            {selected && (
                <motion.div
                    layoutId="templateIndicator"
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#2EE59D",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <span style={{ fontSize: 11, color: "#0B1220" }}>✓</span>
                </motion.div>
            )}
        </motion.button>
    );
}

// ─── Preview Panel ─────────────────────────────────────────────────────────────

function PreviewPanel({
    state,
    pngUrl,
    selectedTemplate,
}: {
    state: AppState;
    pngUrl?: string;
    selectedTemplate: "A" | "B";
}) {
    const isLight = selectedTemplate === "A";

    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <motion.div
                key={selectedTemplate}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                    width: "100%",
                    maxWidth: 520,
                    aspectRatio: "1600/1130",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: isLight
                        ? "0 20px 60px rgba(11,18,32,0.12), 0 2px 8px rgba(11,18,32,0.06)"
                        : "0 20px 60px rgba(11,18,32,0.40), 0 0 0 1px rgba(46,229,157,0.12)",
                    position: "relative",
                    background: isLight
                        ? "linear-gradient(135deg, #FAFBFD 0%, #EEF0F8 100%)"
                        : "linear-gradient(135deg, #0B1220, #111B2E)",
                }}
            >
                {state === "generating" ? (
                    /* Shimmer skeleton */
                    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
                        <motion.div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: isLight
                                    ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
                                    : "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
                            }}
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        />
                        <div style={{ padding: "10% 8%", display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ height: 12, width: "30%", borderRadius: 6, background: isLight ? "rgba(11,18,32,0.08)" : "rgba(255,255,255,0.08)" }} />
                            <div style={{ height: 28, width: "60%", borderRadius: 6, background: isLight ? "rgba(11,18,32,0.08)" : "rgba(255,255,255,0.08)" }} />
                            <div style={{ height: 40, width: "85%", borderRadius: 6, background: isLight ? "rgba(11,18,32,0.08)" : "rgba(255,255,255,0.08)" }} />
                            <div style={{ height: 16, width: "50%", borderRadius: 6, background: isLight ? "rgba(11,18,32,0.06)" : "rgba(255,255,255,0.06)" }} />
                        </div>
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 12,
                        }}>
                            <motion.div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    border: `3px solid ${isLight ? "rgba(11,18,32,0.12)" : "rgba(255,255,255,0.12)"}`,
                                    borderTopColor: "#2EE59D",
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                            />
                            <p style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: isLight ? "rgba(11,18,32,0.45)" : "rgba(255,255,255,0.45)",
                                fontFamily: "'Inter', sans-serif",
                            }}>
                                Generando diploma…
                            </p>
                        </div>
                    </div>
                ) : state === "done" && pngUrl ? (
                    <motion.img
                        src={pngUrl}
                        alt="Tu diploma"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                ) : (
                    /* Placeholder preview */
                    <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 8,
                    }}>
                        <span style={{ fontSize: 36, opacity: 0.3 }}>🎓</span>
                        <p style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: isLight ? "rgba(11,18,32,0.35)" : "rgba(255,255,255,0.30)",
                            fontFamily: "'Inter', sans-serif",
                            textAlign: "center",
                            padding: "0 20px",
                        }}>
                            Aquí aparecerá<br />tu diploma
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ─── Action Buttons ────────────────────────────────────────────────────────────

function ActionButtons({
    result,
    event,
    onCopy,
}: {
    result: GenerateResult;
    event: EventInfo;
    onCopy: () => void;
}) {
    const verifyUrl = result.verifyUrl;
    const waText = encodeURIComponent(
        `¡Completé ${event.title} en Brivé Conmigo 2026! Aquí está mi diploma: ${verifyUrl}`
    );
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
    const waUrl = `https://wa.me/?text=${waText}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
            {/* Download row */}
            <div style={{ display: "flex", gap: 8 }}>
                <ActionBtn
                    href={result.pdfUrl}
                    download
                    onClick={() => trackEvent("certificate_download_pdf")}
                    variant="primary"
                    icon="📄"
                    label="Descargar PDF"
                />
                <ActionBtn
                    href={result.pngUrl}
                    download
                    onClick={() => trackEvent("certificate_download_png")}
                    variant="secondary"
                    icon="🖼️"
                    label="Descargar PNG"
                />
            </div>
            {/* Share row */}
            <div style={{ display: "flex", gap: 8 }}>
                <ActionBtn
                    href={liUrl}
                    target="_blank"
                    onClick={() => trackEvent("certificate_share_linkedin")}
                    variant="linkedin"
                    icon="💼"
                    label="LinkedIn"
                />
                <ActionBtn
                    href={waUrl}
                    target="_blank"
                    onClick={() => trackEvent("certificate_share_whatsapp")}
                    variant="whatsapp"
                    icon="💬"
                    label="WhatsApp"
                />
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(verifyUrl);
                        trackEvent("certificate_copy_verify_link");
                        onCopy();
                    }}
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(11,18,32,0.12)",
                        background: "white",
                        color: "#0B1220",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,18,32,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "white")}
                >
                    <span>🔗</span>
                    <span>Copiar link</span>
                </button>
            </div>
            {/* Verify link */}
            <div style={{
                fontSize: 11,
                color: "rgba(11,18,32,0.40)",
                textAlign: "center",
                fontFamily: "'Inter', sans-serif",
            }}>
                Link de verificación:{" "}
                <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2EE59D", fontWeight: 500, textDecoration: "none" }}
                >
                    {verifyUrl}
                </a>
            </div>
        </motion.div>
    );
}

function ActionBtn({
    href,
    download,
    target,
    onClick,
    variant,
    icon,
    label,
}: {
    href: string;
    download?: boolean;
    target?: string;
    onClick?: () => void;
    variant: "primary" | "secondary" | "linkedin" | "whatsapp";
    icon: string;
    label: string;
}) {
    const styles: Record<string, React.CSSProperties> = {
        primary: { background: "#0B1220", color: "white", border: "none" },
        secondary: { background: "white", color: "#0B1220", border: "1px solid rgba(11,18,32,0.12)" },
        linkedin: { background: "#0077B5", color: "white", border: "none" },
        whatsapp: { background: "#25D366", color: "white", border: "none" },
    };

    return (
        <motion.a
            href={href}
            download={download}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                textDecoration: "none",
                ...styles[variant],
            }}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </motion.a>
    );
}

// ─── Main Generator Component ──────────────────────────────────────────────────

export default function GeneratorClient({ eventSlug }: { eventSlug: string }) {
    const searchParams = useSearchParams();
    const tokenStr = searchParams.get("t") ?? "";

    const [appState, setAppState] = useState<AppState>("validating");
    const [event, setEvent] = useState<EventInfo | null>(null);
    const [email, setEmail] = useState<string>("");
    const [fullName, setFullName] = useState<string>("");
    const [company, setCompany] = useState<string>("");
    const [selectedTemplate, setSelectedTemplate] = useState<"A" | "B">("A");
    const [result, setResult] = useState<GenerateResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [toast, setToast] = useState<string>("");
    const [nameError, setNameError] = useState<string>("");

    // Validate token on mount
    useEffect(() => {
        if (!tokenStr) {
            // Public access: fetch event info directly
            (async () => {
                try {
                    console.log(`[Client] No token, fetching event: "${eventSlug}"`);
                    const res = await fetch(`/api/event/${eventSlug}`);
                    if (!res.ok) {
                        setAppState("invalid");
                        return;
                    }
                    const data = await res.json();
                    setEvent(data);
                    setAppState("ready");
                } catch (err) {
                    console.error("[Client] Public event fetch error:", err);
                    setAppState("invalid");
                }
            })();
            return;
        }

        (async () => {
            try {
                console.log(`[Client] Validating token: "${tokenStr}"`);
                const res = await fetch(`/api/token/validate?t=${encodeURIComponent(tokenStr)}`);
                const data: ValidateResponse = await res.json();
                console.log("[Client] Validation response:", data);

                if (!data.valid) {
                    console.warn("[Client] Token invalid:", data.reason, data.message);
                    setAppState("invalid");
                    return;
                }

                setEvent(data.event!);
                setEmail(data.email!);
                if (data.prefillName) setFullName(data.prefillName);

                if (data.alreadyGenerated && data.certificateId) {
                    // Fetch certificate data
                    const certRes = await fetch(`/api/certificate/${data.certificateId}`);
                    const certData = await certRes.json();
                    const baseUrl = window.location.origin;
                    setResult({
                        certificateId: data.certificateId,
                        pdfUrl: certData.pdfUrl,
                        pngUrl: certData.pngUrl,
                        verifyUrl: `${baseUrl}/verify/${data.certificateId}`,
                    });
                    setAppState("already_generated");
                } else {
                    setAppState("ready");
                }
            } catch (err) {
                console.error("[Client] Validation error:", err);
                setAppState("invalid");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenStr, eventSlug]);

    const handleGenerate = useCallback(async () => {
        if (!fullName.trim()) {
            setNameError("Por favor ingresa tu nombre completo.");
            return;
        }
        setNameError("");
        trackEvent("certificate_generate_click");
        setAppState("generating");

        try {
            const res = await fetch("/api/certificate/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: tokenStr || undefined,
                    eventSlug: !tokenStr ? eventSlug : undefined,
                    template: selectedTemplate,
                    fullName: fullName.trim(),
                    company: company.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error ?? "Error generando diploma");
                setAppState("error");
                return;
            }

            // Add cache-busting to image URL
            const pngWithCache = `${data.pngUrl}?v=${Date.now()}`;
            setResult({ ...data, pngUrl: pngWithCache });
            trackEvent("certificate_generate_success");
            setAppState("done");
        } catch {
            setErrorMsg("Ocurrió un error. Por favor intenta de nuevo.");
            setAppState("error");
        }
    }, [tokenStr, fullName, company, selectedTemplate]);

    // ─── UI States ──────────────────────────────────────────────────────────────

    if (appState === "validating") {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div
                    style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            border: "3px solid rgba(11,18,32,0.10)",
                            borderTopColor: "#2EE59D",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    />
                    <p style={{ color: "rgba(11,18,32,0.45)", fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
                        Verificando tu enlace…
                    </p>
                </motion.div>
            </div>
        );
    }

    if (appState === "invalid") {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        maxWidth: 440,
                        background: "white",
                        border: "1px solid rgba(11,18,32,0.10)",
                        borderRadius: 24,
                        padding: "48px 40px",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#0B1220", marginBottom: 12 }}>
                        Enlace no válido
                    </h1>
                    <p style={{ color: "rgba(11,18,32,0.55)", fontSize: 15, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                        Este enlace ya no es válido o ha expirado. Si crees que es un error, contacta al equipo de Brivé.
                    </p>
                    <div style={{ marginTop: 24, padding: "12px 20px", background: "rgba(11,18,32,0.04)", borderRadius: 12 }}>
                        <p style={{ fontSize: 13, color: "rgba(11,18,32,0.45)", fontFamily: "'Inter', sans-serif" }}>
                            📧 hola@brive.mx
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (appState === "already_generated" && result) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "linear-gradient(160deg, #F6F7FB 0%, #EEF0F8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        maxWidth: 540,
                        width: "100%",
                        background: "white",
                        border: "1px solid rgba(11,18,32,0.08)",
                        borderRadius: 24,
                        padding: "40px 36px",
                    }}
                >
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(46,229,157,0.10)",
                        border: "1px solid rgba(46,229,157,0.25)",
                        color: "#0a9c68",
                        padding: "6px 14px",
                        borderRadius: 100,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "'Space Grotesk', sans-serif",
                        marginBottom: 20,
                    }}>
                        ✅ Diploma ya generado
                    </div>
                    <h1 style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 26,
                        fontWeight: 700,
                        color: "#0B1220",
                        marginBottom: 8,
                    }}>
                        Tu diploma está listo
                    </h1>
                    <p style={{ color: "rgba(11,18,32,0.55)", fontSize: 14, marginBottom: 28, fontFamily: "'Inter', sans-serif" }}>
                        {event?.title}
                    </p>
                    {/* Preview */}
                    <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 24, boxShadow: "0 8px 32px rgba(11,18,32,0.10)" }}>
                        <img src={result.pngUrl} alt="Tu diploma" style={{ width: "100%", display: "block" }} />
                    </div>
                    <ActionButtons result={result} event={event!} onCopy={() => setToast("Copiado ✅")} />
                </motion.div>
                {toast && <Toast message={toast} onDone={() => setToast("")} />}
            </div>
        );
    }

    if (appState === "error") {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ textAlign: "center", maxWidth: 400 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <h2 style={{ fontFamily: "Space Grotesk", fontSize: 24, color: "#0B1220", marginBottom: 12 }}>Ups, algo salió mal</h2>
                    <p style={{ color: "rgba(11,18,32,0.6)", marginBottom: 24 }}>{errorMsg}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: "#0B1220",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none"
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // ─── Main Generator UI ─────────────────────────────────────────────────────

    return (
        <div
            className="bg-noise"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(160deg, #F6F7FB 0%, #EEF0F8 60%, #E8EBF5 100%)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                style={{
                    padding: "20px 32px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(11,18,32,0.07)",
                    background: "rgba(246,247,251,0.85)",
                    backdropFilter: "blur(12px)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#0B1220" }}>
                        Bri<span style={{ color: "#2EE59D" }}>v</span>é
                    </span>
                </div>
                <div style={{
                    background: "#0B1220",
                    color: "#2EE59D",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "5px 14px",
                    borderRadius: 100,
                    fontFamily: "'Space Grotesk', sans-serif",
                }}>
                    Brivé Conmigo 2026
                </div>
            </motion.header>

            {/* Main content */}
            <div
                style={{
                    flex: 1,
                    maxWidth: 1100,
                    width: "100%",
                    margin: "0 auto",
                    padding: "40px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 32,
                }}
            >
                {/* Hero section */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    style={{ textAlign: "center" }}
                >
                    <h1
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: "clamp(28px, 4vw, 48px)",
                            fontWeight: 700,
                            color: "#0B1220",
                            marginBottom: 8,
                            letterSpacing: "-1px",
                            lineHeight: 1.1,
                        }}
                    >
                        {event?.title}
                    </h1>
                    <p style={{ color: "rgba(11,18,32,0.45)", fontSize: 16, fontFamily: "'Inter', sans-serif" }}>
                        {event?.subtitle}
                    </p>
                </motion.div>

                {/* Generator Grid */}
                <div style={{
                    display: "flex",
                    flexDirection: window.innerWidth < 900 ? "column-reverse" : "row",
                    gap: 40,
                    alignItems: "flex-start",
                }}>
                    {/* Form side */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            flex: 1,
                            width: "100%",
                            maxWidth: 480,
                            background: "white",
                            borderRadius: 24,
                            border: "1px solid rgba(11,18,32,0.08)",
                            padding: "32px 28px",
                            boxShadow: "0 10px 40px rgba(11,18,32,0.04)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 24,
                        }}
                    >
                        {/* Step 1: Design */}
                        <section>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.35)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                                1. Elige tu diseño
                            </h3>
                            <div style={{ display: "flex", gap: 12 }}>
                                <TemplateCard id="A" selected={selectedTemplate === "A"} onClick={() => setSelectedTemplate("A")} />
                                <TemplateCard id="B" selected={selectedTemplate === "B"} onClick={() => setSelectedTemplate("B")} />
                            </div>
                        </section>

                        {/* Step 2: Form */}
                        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.35)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
                                2. Valida tus datos
                            </h3>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#0B1220", fontFamily: "'Inter', sans-serif" }}>Nombre Completo</label>
                                <input
                                    type="text"
                                    placeholder="Ej. María García"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    style={{
                                        padding: "12px 16px",
                                        borderRadius: 12,
                                        border: nameError ? "1.5px solid #ff4d4d" : "1px solid rgba(11,18,32,0.12)",
                                        fontSize: 15,
                                        fontFamily: "'Inter', sans-serif",
                                        outline: "none",
                                        background: "rgba(11,18,32,0.02)",
                                        transition: "all 0.15s ease",
                                    }}
                                    onFocus={e => e.currentTarget.style.border = "1.5px solid #2EE59D"}
                                    onBlur={e => e.currentTarget.style.border = nameError ? "1.5px solid #ff4d4d" : "1px solid rgba(11,18,32,0.12)"}
                                />
                                {nameError && <span style={{ fontSize: 11, color: "#ff4d4d", fontWeight: 500 }}>{nameError}</span>}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#0B1220", fontFamily: "'Inter', sans-serif" }}>Empresa (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Brivé"
                                    value={company}
                                    onChange={e => setCompany(e.target.value)}
                                    style={{
                                        padding: "12px 16px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(11,18,32,0.12)",
                                        fontSize: 15,
                                        fontFamily: "'Inter', sans-serif",
                                        outline: "none",
                                        background: "rgba(11,18,32,0.02)",
                                    }}
                                />
                            </div>

                            <div style={{
                                marginTop: 8,
                                padding: "12px",
                                background: "rgba(46,229,157,0.05)",
                                border: "1px dashed rgba(46,229,157,0.3)",
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 10
                            }}>
                                <div style={{ fontSize: 18 }}>📧</div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: 10, color: "rgba(11,18,32,0.4)", fontWeight: 700, textTransform: "uppercase" }}>Email registrado</span>
                                    <span style={{ fontSize: 13, color: "#0B1220", fontWeight: 500 }}>{email}</span>
                                </div>
                            </div>
                        </section>

                        {/* Step 3: Generate */}
                        <motion.button
                            onClick={handleGenerate}
                            disabled={appState === "generating"}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            style={{
                                background: "#0B1220",
                                color: "white",
                                border: "none",
                                padding: "16px",
                                borderRadius: 14,
                                fontSize: 16,
                                fontWeight: 700,
                                fontFamily: "'Space Grotesk', sans-serif",
                                cursor: appState === "generating" ? "not-allowed" : "pointer",
                                opacity: appState === "generating" ? 0.7 : 1,
                                boxShadow: "0 12px 24px rgba(11,18,32,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                            }}
                        >
                            {appState === "generating" ? (
                                <>
                                    <motion.div
                                        style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#2EE59D" }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                    />
                                    Generando...
                                </>
                            ) : (
                                <>Generar mi diploma <span>✨</span></>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Preview side */}
                    <div style={{ flex: 1.2, width: "100%" }}>
                        <PreviewPanel state={appState} pngUrl={result?.pngUrl} selectedTemplate={selectedTemplate} />
                    </div >
                </div >
            </div >

            {/* Footer */}
            <footer style={{ padding: "40px", textAlign: "center", opacity: 0.4 }}>
                <p style={{ fontSize: 12, color: "#0B1220", fontFamily: "'Inter', sans-serif" }}>
                    &copy; 2026 Brivé. Todos los derechos reservados.
                </p>
            </footer>

            {toast && <Toast message={toast} onDone={() => setToast("")} />}
        </div >
    );
}
