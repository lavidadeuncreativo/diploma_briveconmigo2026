// src/lib/dynamicRenderer.ts
export interface DynamicTemplateData {
  fullName: string;
  sessionTitle: string;
  sessionSubtitle?: string | null;
  date: string;
  instructorName: string;
  instructorPosition: string;
  signatureUrl: string;
  backgroundImage: string;
  qrDataUrl: string;
  layoutConfig: any;
}

  const layout = typeof layoutConfig === 'string' ? JSON.parse(layoutConfig) : (layoutConfig || {});

  // Default positions if layoutConfig is missing some fields
  const getPos = (key: string) => layout?.[key] || { x: 50, y: 50, fontSize: 24, color: "#000000" };

  const namePos = getPos("name");
  const titlePos = getPos("title");
  const datePos = getPos("date");
  const signaturePos = getPos("signature");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');
            
            body, html {
                margin: 0;
                padding: 0;
                width: 1600px;
                height: 1130px;
                font-family: 'Outfit', sans-serif;
                overflow: hidden;
            }
            .container {
                position: relative;
                width: 1600px;
                height: 1130px;
                background-image: url('${backgroundImage}');
                background-size: cover;
                background-position: center;
            }
            .dynamic-text {
                position: absolute;
                transform: translate(-50%, -50%);
                text-align: center;
                white-space: nowrap;
            }
            .name {
                left: ${namePos.x}%;
                top: ${namePos.y}%;
                font-size: ${namePos.fontSize}px;
                color: ${namePos.color};
                font-weight: 700;
            }
            .title {
                left: ${titlePos.x || 50}%;
                top: ${titlePos.y || 45}%;
                font-size: ${titlePos.fontSize || 30}px;
                color: ${titlePos.color || '#334155'};
            }
            .date {
                left: ${datePos.x}%;
                top: ${datePos.y}%;
                font-size: ${datePos.fontSize}px;
                color: ${datePos.color};
            }
            .signature-block {
                position: absolute;
                left: ${signaturePos.x || 50}%;
                top: ${signaturePos.y || 80}%;
                transform: translate(-50%, -50%);
                text-align: center;
                width: 400px;
            }
            .signature-img {
                max-width: 200px;
                max-height: 100px;
                margin-bottom: 10px;
                mix-blend-multiply;
            }
            .signer-info {
                font-size: 18px;
                color: #1e293b;
                font-weight: 700;
            }
            .signer-pos {
                font-size: 14px;
                color: #64748b;
            }
            .qr-code {
                position: absolute;
                bottom: 40px;
                right: 40px;
                width: 100px;
                height: 100px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="dynamic-text name">${fullName}</div>
            <div class="dynamic-text title">${sessionTitle}</div>
            <div class="dynamic-text date">${date}</div>
            
            <div class="signature-block">
                <img src="${signatureUrl}" class="signature-img" />
                <div class="signer-info">${instructorName}</div>
                <div class="signer-pos">${instructorPosition}</div>
            </div>

            <img src="${qrDataUrl}" class="qr-code" />
        </div>
    </body>
    </html>
  `;
}
