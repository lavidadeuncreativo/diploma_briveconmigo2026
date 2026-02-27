// src/lib/templates/templateA.ts
export interface TemplateData {
    fullName: string;
    company?: string;
    eventTitle: string;
    eventSubtitle?: string;
    eventDate: string;
    eventHours?: string;
    instructor?: string;
    qrDataUrl: string;
    certificateId: string;
}

export function renderTemplateA(data: TemplateData): string {
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
    background: #F6F7FB;
    overflow: hidden;
  }

  .diploma {
    width: 1600px;
    height: 1130px;
    position: relative;
    background: linear-gradient(145deg, #FAFBFD 0%, #F0F2F7 50%, #EEF0F8 100%);
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }

  /* Decorative top bar */
  .top-bar {
    width: 100%;
    height: 12px;
    background: linear-gradient(90deg, #0B1220 0%, #2EE59D 50%, #0B1220 100%);
  }

  /* Decorative blob */
  .blob-1 {
    position: absolute;
    top: -120px;
    right: -80px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(46,229,157,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .blob-2 {
    position: absolute;
    bottom: -150px;
    left: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(11,18,32,0.06) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* Corner decorations */
  .corner-tl, .corner-br {
    position: absolute;
    width: 160px;
    height: 160px;
  }
  .corner-tl {
    top: 28px;
    left: 60px;
    border-top: 2px solid rgba(11,18,32,0.15);
    border-left: 2px solid rgba(11,18,32,0.15);
  }
  .corner-br {
    bottom: 60px;
    right: 340px;
    border-bottom: 2px solid rgba(11,18,32,0.15);
    border-right: 2px solid rgba(11,18,32,0.15);
  }

  .content {
    flex: 1;
    padding: 60px 80px 50px 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    z-index: 2;
  }

  /* Header section */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .brand-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .brand-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #0B1220;
    letter-spacing: -0.5px;
  }

  .brand-logo span {
    color: #2EE59D;
  }

  .brand-pill {
    display: inline-flex;
    align-items: center;
    background: #0B1220;
    color: #2EE59D;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
    width: fit-content;
  }

  .diploma-type {
    text-align: right;
    font-size: 13px;
    font-weight: 500;
    color: rgba(11,18,32,0.45);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* Medal / seal */
  .seal {
    width: 90px;
    height: 90px;
    position: relative;
  }
  .seal-outer {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: conic-gradient(#2EE59D 0deg, #0B1220 60deg, #2EE59D 120deg, #0B1220 180deg, #2EE59D 240deg, #0B1220 300deg, #2EE59D 360deg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .seal-inner {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #F6F7FB;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 2px;
  }
  .seal-check {
    font-size: 22px;
  }
  .seal-text {
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #0B1220;
    text-transform: uppercase;
  }

  /* Main content area */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0;
    padding: 20px 0;
  }

  .certifies-label {
    font-size: 15px;
    font-weight: 400;
    color: rgba(11,18,32,0.55);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .diploma-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 56px;
    font-weight: 700;
    color: #0B1220;
    letter-spacing: -1.5px;
    line-height: 1.05;
    margin-bottom: 28px;
  }

  .name-container {
    position: relative;
    margin-bottom: 36px;
  }

  .name-underline {
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #2EE59D, transparent);
    border-radius: 2px;
  }

  .participant-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 84px;
    font-weight: 700;
    color: #0B1220;
    letter-spacing: -3px;
    line-height: 0.95;
    display: block;
  }

  .participant-company {
    font-size: 20px;
    font-weight: 400;
    color: rgba(11,18,32,0.55);
    margin-top: 16px;
    letter-spacing: 0.5px;
  }

  /* Event card */
  .event-card {
    background: rgba(11,18,32,0.04);
    border: 1px solid rgba(11,18,32,0.10);
    border-radius: 16px;
    padding: 24px 32px;
    display: inline-flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 24px;
    max-width: 780px;
  }

  .event-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #2EE59D;
    background: #0B1220;
    padding: 4px 10px;
    border-radius: 100px;
    width: fit-content;
    margin-bottom: 8px;
  }

  .event-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #0B1220;
    line-height: 1.3;
  }

  .event-subtitle {
    font-size: 15px;
    font-weight: 400;
    color: rgba(11,18,32,0.60);
    line-height: 1.4;
  }

  .event-meta {
    display: flex;
    gap: 32px;
    margin-top: 12px;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .meta-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(11,18,32,0.40);
  }

  .meta-value {
    font-size: 15px;
    font-weight: 500;
    color: #0B1220;
  }

  /* Footer */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 20px;
    border-top: 1px solid rgba(11,18,32,0.08);
  }

  .signature-section {
    display: flex;
    gap: 60px;
  }

  .signature-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .signature-line {
    width: 160px;
    height: 1px;
    background: rgba(11,18,32,0.25);
    margin-bottom: 8px;
  }

  .signature-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #0B1220;
  }

  .signature-role {
    font-size: 12px;
    font-weight: 400;
    color: rgba(11,18,32,0.50);
  }

  .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .qr-image {
    width: 90px;
    height: 90px;
    border: 1px solid rgba(11,18,32,0.12);
    border-radius: 10px;
    padding: 4px;
    background: white;
  }

  .qr-label {
    font-size: 10px;
    font-weight: 500;
    color: rgba(11,18,32,0.40);
    letter-spacing: 0.5px;
    text-align: center;
  }

  .cert-id {
    font-size: 9px;
    color: rgba(11,18,32,0.25);
    letter-spacing: 1px;
    text-align: center;
    font-variant: small-caps;
  }
</style>
</head>
<body>
<div class="diploma">
  <div class="top-bar"></div>
  <div class="blob-1"></div>
  <div class="blob-2"></div>
  <div class="corner-tl"></div>
  <div class="corner-br"></div>

  <div class="content">
    <div class="header">
      <div class="brand-section">
        <div class="brand-logo">Bri<span>v</span>é</div>
        <div class="brand-pill">Brivé Conmigo 2026</div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:16px;">
        <div class="diploma-type">Certificado de participación</div>
        <div class="seal">
          <div class="seal-outer">
            <div class="seal-inner">
              <div class="seal-check">✦</div>
              <div class="seal-text">Brivé</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="certifies-label">Certifica que</div>
      <div class="diploma-title">Diploma de participación</div>
      <div class="name-container">
        <span class="participant-name">${fullName}</span>
        <div class="name-underline"></div>
      </div>
      ${company ? `<div class="participant-company">${company}</div>` : ''}

      <div class="event-card">
        <div class="event-label">Workshop</div>
        <div class="event-title">${eventTitle}</div>
        ${eventSubtitle ? `<div class="event-subtitle">${eventSubtitle}</div>` : ''}
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
        <img class="qr-image" src="${qrDataUrl}" alt="QR verificación" />
        <div class="qr-label">Verificar diploma</div>
        <div class="cert-id">ID: ${certificateId.slice(0, 12)}</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}
