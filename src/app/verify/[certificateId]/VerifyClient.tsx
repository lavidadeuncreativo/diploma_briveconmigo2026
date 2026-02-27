"use client";

import { motion } from "framer-motion";

interface CertData {
    id: string;
    fullName: string;
    company?: string | null;
    template: string;
    pdfUrl: string;
    pngUrl: string;
    createdAt: string;
    verifyUrl: string;
    event: {
        id: string;
        slug: string;
        title: string;
        subtitle?: string | null;
        date: string;
        hours?: string | null;
        instructor?: string | null;
    };
}

export default function VerifyClient({ data }: { data: CertData }) {
    const { fullName, company, pdfUrl, pngUrl, event, createdAt, verifyUrl } = data;
    const issuedDate = new Date(createdAt).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(160deg, #F6F7FB 0%, #EEF0F8 100%)",
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* Header */}
            <header
                style={{
                    padding: "20px 32px",
                    borderBottom: "1px solid rgba(11,18,32,0.07)",
                    background: "rgba(246,247,251,0.85)",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#0B1220" }}>
                    Bri<span style={{ color: "#2EE59D" }}>v</span>é
                </span>
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
                    Verificación oficial
                </div>
            </header>

            {/* Content */}
            <div
                style={{
                    maxWidth: 680,
                    margin: "0 auto",
                    padding: "48px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 28,
                }}
            >
                {/* Verified badge */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(46,229,157,0.10)",
                        border: "1px solid rgba(46,229,157,0.25)",
                        color: "#0a9c68",
                        padding: "8px 18px",
                        borderRadius: 100,
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "'Space Grotesk', sans-serif",
                        width: "fit-content",
                    }}>
                        ✅ Diploma verificado
                    </div>

                    <h1 style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "clamp(24px, 4vw, 36px)",
                        fontWeight: 700,
                        color: "#0B1220",
                        letterSpacing: "-1px",
                        lineHeight: 1.1,
                        margin: 0,
                    }}>
                        {fullName}
                    </h1>
                    {company && (
                        <p style={{ fontSize: 15, color: "rgba(11,18,32,0.50)", margin: 0 }}>{company}</p>
                    )}
                </motion.div>

                {/* Certificate image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 16px 64px rgba(11,18,32,0.14)",
                        border: "1px solid rgba(11,18,32,0.06)",
                    }}
                >
                    <img
                        src={pngUrl}
                        alt={`Diploma de ${fullName}`}
                        style={{ width: "100%", display: "block" }}
                    />
                </motion.div>

                {/* Info card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    style={{
                        background: "white",
                        border: "1px solid rgba(11,18,32,0.08)",
                        borderRadius: 20,
                        padding: "28px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}
                >
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(11,18,32,0.40)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>
                        Detalles del certificado
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <InfoItem label="Participante" value={fullName} />
                        {company && <InfoItem label="Empresa" value={company} />}
                        <InfoItem label="Evento" value={event.title} fullWidth />
                        {event.subtitle && <InfoItem label="Subtítulo" value={event.subtitle} fullWidth />}
                        <InfoItem label="Fecha del evento" value={event.date} />
                        {event.hours && <InfoItem label="Duración" value={event.hours} />}
                        {event.instructor && <InfoItem label="Instructor" value={event.instructor} />}
                        <InfoItem label="Emitido por" value="Brivé – Brivé Conmigo 2026" />
                        <InfoItem label="Fecha de emisión" value={issuedDate} />
                    </div>
                </motion.div>

                {/* Download button */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    style={{ display: "flex", gap: 12 }}
                >
                    <motion.a
                        href={pdfUrl}
                        download
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            padding: "14px 24px",
                            background: "#0B1220",
                            color: "white",
                            borderRadius: 14,
                            textDecoration: "none",
                            fontSize: 15,
                            fontWeight: 600,
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}
                    >
                        📄 Descargar PDF
                    </motion.a>
                    <motion.a
                        href={pngUrl}
                        download
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            padding: "14px 24px",
                            background: "white",
                            border: "1px solid rgba(11,18,32,0.12)",
                            color: "#0B1220",
                            borderRadius: 14,
                            textDecoration: "none",
                            fontSize: 15,
                            fontWeight: 600,
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}
                    >
                        🖼️ Descargar PNG
                    </motion.a>
                </motion.div>

                {/* Footer */}
                <div style={{ textAlign: "center", fontSize: 12, color: "rgba(11,18,32,0.35)", lineHeight: 1.6 }}>
                    Este diploma fue emitido por{" "}
                    <span style={{ fontWeight: 600, color: "#0B1220" }}>Brivé</span> como parte de{" "}
                    <span style={{ fontWeight: 600, color: "#0B1220" }}>Brivé Conmigo 2026</span>.
                    <br />
                    Link permanente:{" "}
                    <a href={verifyUrl} style={{ color: "#2EE59D", fontWeight: 500, textDecoration: "none" }}>
                        {verifyUrl}
                    </a>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
    return (
        <div style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "rgba(11,18,32,0.35)", marginBottom: 4 }}>
                {label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#0B1220", lineHeight: 1.5 }}>
                {value}
            </div>
        </div>
    );
}
