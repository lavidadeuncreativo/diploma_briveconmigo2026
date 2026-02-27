// src/lib/templates/templateB.ts
import { TemplateData } from "./templateA";

export function renderTemplateB(data: TemplateData): string {
    const { fullName, company, eventTitle, eventSubtitle, eventDate, eventHours, instructor, qrDataUrl, certificateId } = data;

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1600px;
    height: 1130px;
    font-family: 'Inter', sans-serif;
    background: #0B1220;
    overflow: hidden;
  }

  .diploma {
    width: 1600px;
    height: 1130px;
    position: relative;
    background: linear-gradient(135deg, #0B1220 0%, #111B2E 40%, #0D1A2E 100%);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Noise texture overlay */
  .noise {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.06;
    pointer-events: none;
    z-index: 1;
  }

  /* Glow accents */
  .glow-1 {
    position: absolute;
    top: -200px;
    right: 200px;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(46,229,157,0.12) 0%, transparent 65%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  .glow-2 {
    position: absolute;
    bottom: -300px;
    left: 100px;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(46,229,157,0.06) 0%, transparent 65%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  /* Left accent bar */
  .left-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: linear-gradient(180deg, #2EE59D 0%, rgba(46,229,157,0.2) 60%, transparent 100%);
    z-index: 3;
  }

  /* Top decorative line */
  .top-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, #2EE59D, rgba(46,229,157,0.3), transparent);
    z-index: 3;
  }

  .content {
    flex: 1;
    padding: 60px 80px 50px 90px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    z-index: 2;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .brand-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.5px;
  }
  .brand-logo span { color: #2EE59D; }

  .brand-pill {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(46,229,157,0.35);
    color: #2EE59D;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
    margin-top: 8px;
  }

  .right-header {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;
  }

  .diploma-type {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.35);
    letter-spacing: 2.5px;
    text-transform: uppercase;
  }

  /* Badge */
  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(46,229,157,0.2), rgba(46,229,157,0.05));
    border: 1.5px solid rgba(46,229,157,0.4);
    flex-direction: column;
    gap: 3px;
  }

  .badge-icon {
    font-size: 28px;
    line-height: 1;
  }

  .badge-text {
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #2EE59D;
    text-transform: uppercase;
  }

  /* Main content */
  .main {
    flex: 1;
    display: flex;
    gap: 60px;
    align-items: center;
    padding: 30px 0;
  }

  .main-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .certifies-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.35);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .diploma-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 48px;
    font-weight: 700;
    color: white;
    letter-spacing: -1.5px;
    line-height: 1.05;
    margin-bottom: 24px;
  }

  .diploma-title span { color: #2EE59D; }

  .name-block {
    position: relative;
    margin-bottom: 28px;
    padding-bottom: 20px;
  }

  .name-glow {
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2EE59D, rgba(46,229,157,0.2), transparent);
    border-radius: 2px;
  }

  .participant-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 78px;
    font-weight: 700;
    color: white;
    letter-spacing: -3px;
    line-height: 0.95;
    display: block;
  }

  .participant-company {
    font-size: 18px;
    font-weight: 400;
    color: rgba(255,255,255,0.45);
    margin-top: 14px;
  }

  .main-right {
    width: 440px;
    flex-shrink: 0;
  }

  /* Event card */
  .event-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 20px;
    padding: 28px 32px;
    backdrop-filter: blur(12px);
    position: relative;
    overflow: hidden;
  }

  .event-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #2EE59D, transparent);
  }

  .event-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(46,229,157,0.15);
    border: 1px solid rgba(46,229,157,0.30);
    color: #2EE59D;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 100px;
    margin-bottom: 16px;
  }

  .event-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 19px;
    font-weight: 600;
    color: white;
    line-height: 1.35;
    margin-bottom: 8px;
  }

  .event-subtitle {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255,255,255,0.50);
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .divider {
    height: 1px;
    background: rgba(255,255,255,0.08);
    margin: 16px 0;
  }

  .event-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .meta-item {}

  .meta-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.30);
    margin-bottom: 3px;
  }

  .meta-value {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.80);
  }

  /* Footer */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .signature-section {
    display: flex;
    gap: 56px;
  }

  .signature-item {}

  .signature-line {
    width: 150px;
    height: 1px;
    background: rgba(255,255,255,0.20);
    margin-bottom: 8px;
  }

  .signature-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: rgba(255,255,255,0.80);
  }

  .signature-role {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    margin-top: 2px;
  }

  .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .qr-wrapper {
    background: white;
    border-radius: 12px;
    padding: 6px;
    border: 1px solid rgba(46,229,157,0.25);
  }

  .qr-image {
    width: 82px;
    height: 82px;
    display: block;
  }

  .qr-label {
    font-size: 9px;
    font-weight: 500;
    color: rgba(255,255,255,0.30);
    letter-spacing: 0.5px;
    text-align: center;
  }

  .cert-id {
    font-size: 8px;
    color: rgba(255,255,255,0.18);
    letter-spacing: 1px;
    text-align: center;
    font-variant: small-caps;
  }
</style>
</head>
<body>
<div class="diploma">
  <div class="noise"></div>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="left-bar"></div>
  <div class="top-line"></div>

  <div class="content">
    <div class="header">
      <div>
        <div class="brand-logo">Bri<span>v</span>é</div>
        <div class="brand-pill">Brivé Conmigo 2026</div>
      </div>
      <div class="right-header">
        <div class="diploma-type">Certificado de participación</div>
        <div class="badge">
          <div class="badge-icon">✦</div>
          <div class="badge-text">Brivé</div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="main-left">
        <div class="certifies-label">Certifica que</div>
        <div class="diploma-title">Diploma de <span>participación</span></div>
        <div class="name-block">
          <span class="participant-name">${fullName}</span>
          <div class="name-glow"></div>
        </div>
        ${company ? `<div class="participant-company">${company}</div>` : ''}
      </div>
      <div class="main-right">
        <div class="event-card">
          <div class="event-badge">◆ Workshop</div>
          <div class="event-title">${eventTitle}</div>
          ${eventSubtitle ? `<div class="event-subtitle">${eventSubtitle}</div>` : ''}
          <div class="divider"></div>
          <div class="event-meta">
            <div class="meta-item">
              <div class="meta-label">Fecha</div>
              <div class="meta-value">${eventDate}</div>
            </div>
            ${eventHours ? `<div class="meta-item">
              <div class="meta-label">Duración</div>
              <div class="meta-value">${eventHours}</div>
            </div>` : ''}
            ${instructor ? `<div class="meta-item">
              <div class="meta-label">Instructor</div>
              <div class="meta-value">${instructor}</div>
            </div>` : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="signature-section">
        <div class="signature-item">
          <div class="signature-line"></div>
          <div class="signature-name">Brivé</div>
          <div class="signature-role">Plataforma de talento</div>
        </div>
        <div class="signature-item">
          <div class="signature-line"></div>
          <div class="signature-name">Equipo Brivé</div>
          <div class="signature-role">Brivé Conmigo 2026</div>
        </div>
      </div>
      <div class="qr-section">
        <div class="qr-wrapper">
          <img class="qr-image" src="${qrDataUrl}" alt="QR verificación" />
        </div>
        <div class="qr-label">Verificar diploma</div>
        <div class="cert-id">ID: ${certificateId.slice(0, 12)}</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}
