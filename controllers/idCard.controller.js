


import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import leadModel from '../models/lead.model.js';

const cityCodeMap = {
  delhi: "DL",
  mumbai: "MUM",
  bangalore: "BLR",
  bengaluru: "BLR",
  hyderabad: "HYD",
  chennai: "CHE",
  kolkata: "KOL",
  pune: "PUN",
  ahmedabad: "AMD",
  jaipur: "JAI",
  lucknow: "LKO",
  chandigarh: "CHD",
  indore: "IND",
  bhopal: "BPL",
  surat: "SUR",
  nagpur: "NGP",
  patna: "PAT",
  kochi: "KOC",
  goa: "GOA"
};
const getLocationCode = (source) => {
  if (!source) return "UNK";

  const lowerSource = source.toLowerCase();

  for (const city in cityCodeMap) {
    if (lowerSource.includes(city)) {
      return cityCodeMap[city];
    }
  }

  return "UNK"; // fallback
};
// ===== Escape Regex =====
const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ===== Premium Card Generator =====
// export const generatePremiumCard = async (user, customId) => {
//   const canvas = createCanvas(600, 350);
//   const ctx = canvas.getContext('2d');

//   const getField = (key) =>
//     user.fields instanceof Map ? user.fields.get(key) : user.fields?.[key];

//   // Background
//   ctx.fillStyle = '#000';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Gold Gradient
//   const gold = ctx.createLinearGradient(0, 0, 600, 0);
//   gold.addColorStop(0, '#C9A227');
//   gold.addColorStop(1, '#704c15');

//   // Curves
//   ctx.beginPath();
//   ctx.moveTo(400, 0);
//   ctx.quadraticCurveTo(600, 100, 600, 0);
//   ctx.fillStyle = '#111';
//   ctx.fill();

//   ctx.beginPath();
//   ctx.moveTo(350, 0);
//   ctx.quadraticCurveTo(600, 150, 600, 50);
//   ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
//   ctx.fill();

//   // Border
//   ctx.strokeStyle = gold;
//   ctx.lineWidth = 2;
//   ctx.strokeRect(15, 15, 570, 320);

//   // Logo
//   const logoPath = path.join(process.cwd(), 'public/image/logo.jpg');
//   const logo = await loadImage(logoPath);
//   ctx.drawImage(logo, 30, 30, 60, 60);

//   // Header
//   ctx.fillStyle = gold;
//   ctx.font = 'bold 22px Arial';
//   ctx.fillText('NGO GURU PVT LTD', 110, 55);

//   ctx.fillStyle = '#ccc';
//   ctx.font = '14px Arial';
//   ctx.fillText('SEMINAR ACCESS CARD', 110, 75);

//   ctx.fillStyle = '#bfa76f';
//   ctx.font = 'italic 13px Arial';
//   ctx.fillText('Where Passion Meets Social Impact', 110, 95);

//   // Divider
//   ctx.strokeStyle = '#333';
//   ctx.beginPath();
//   ctx.moveTo(30, 110);
//   ctx.lineTo(570, 110);
//   ctx.stroke();

//   // User Data
//   const name = getField('Name') || 'N/A';
//   const org = getField('ngoName') || 'N/A';
//   const contact = getField('Contact') || 'N/A';

//   ctx.fillStyle = '#fff';
//   ctx.font = 'bold 16px Arial';
//   ctx.fillText(name.toUpperCase(), 40, 150);

//   ctx.font = '14px Arial';
//   ctx.fillStyle = '#ccc';
//   ctx.fillText(`ID: ${customId}`, 40, 175);
//   // ctx.fillText(`Role: NGO Operator`, 40, 195);
//   ctx.fillText(`Org: ${org}`, 40, 215);
//   ctx.fillText(`Contact: ${contact}`, 40, 235);

//   // Badge
//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(400, 140, 150, 90);

//   ctx.strokeStyle = '#C9A227';
//   ctx.lineWidth = 2;
//   ctx.strokeRect(400, 140, 150, 90);

//   ctx.fillStyle = '#f7f6f3';
//   ctx.font = 'bold 1px Arial';
//   ctx.fillText('AUTHORIZED', 420, 175);

//   ctx.fillStyle = '#f3f1f1';
//   ctx.font = '2px Arial';
//   ctx.fillText('SEMINAR ACCESS', 415, 200);

//   // Bottom Shape
//   ctx.beginPath();
//   ctx.moveTo(0, 300);
//   ctx.quadraticCurveTo(300, 100, 100, 600);
//   ctx.lineTo(600, 350);
//   ctx.lineTo(0, 350);
//   ctx.closePath();
//   ctx.fillStyle = 'rgba(255, 217, 0, 0.18)';
//   ctx.fill();

//   // Checkboxes
//   // const labels = ['FP', 'PP', 'VIP'];
//   // const boxY = 270;

//   // labels.forEach((label, i) => {
//   //   const x = 40 + i * 150;

//   //   ctx.strokeStyle = '#C9A227';
//   //   ctx.strokeRect(x, boxY, 130, 45);

//   //   ctx.strokeRect(x + 10, boxY + 14, 15, 15);

//   //   ctx.fillStyle = '#fff';
//   //   ctx.font = '14px Arial';
//   //   ctx.fillText(label, x + 35, boxY + 28);
//   // });

//   return canvas.toBuffer('image/png');
// };

// with max width
// id car for Mumbai seminar
// export const generatePremiumCard = async (user, customId) => {
//   const canvas = createCanvas(600, 350);
//   const ctx = canvas.getContext('2d');

//   const getField = (key) =>
//     user.fields instanceof Map ? user.fields.get(key) : user.fields?.[key];

//   // ✅ Helper: Wrap text inside max width
//   const drawWrappedText = (text, x, y, maxWidth, lineHeight) => {
//     const words = text.split(' ');
//     let line = '';
//     let currentY = y;

//     for (let n = 0; n < words.length; n++) {
//       const testLine = line + words[n] + ' ';
//       const metrics = ctx.measureText(testLine);
//       const testWidth = metrics.width;

//       if (testWidth > maxWidth && n > 0) {
//         ctx.fillText(line, x, currentY);
//         line = words[n] + ' ';
//         currentY += lineHeight;
//       } else {
//         line = testLine;
//       }
//     }

//     ctx.fillText(line, x, currentY);
//     return currentY;
//   };

//   // Background
//   ctx.fillStyle = '#000';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Gold Gradient
//   const gold = ctx.createLinearGradient(0, 0, 600, 0);
//   gold.addColorStop(0, '#C9A227');
//   gold.addColorStop(1, '#704c15');

//   // Curves
//   ctx.beginPath();
//   ctx.moveTo(400, 0);
//   ctx.quadraticCurveTo(600, 100, 600, 0);
//   ctx.fillStyle = '#111';
//   ctx.fill();

//   ctx.beginPath();
//   ctx.moveTo(350, 0);
//   ctx.quadraticCurveTo(600, 150, 600, 50);
//   ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
//   ctx.fill();

//   // Border
//   ctx.strokeStyle = gold;
//   ctx.lineWidth = 2;
//   ctx.strokeRect(15, 15, 570, 320);

//   // Logo
//   const logoPath = path.join(process.cwd(), 'public/image/logo.jpg');
//   const logo = await loadImage(logoPath);
//   ctx.drawImage(logo, 30, 30, 60, 60);

//   // Header
//   ctx.fillStyle = gold;
//   ctx.font = 'bold 22px Arial';
//   ctx.fillText('NGO GURU PVT LTD', 110, 55);

//   ctx.fillStyle = '#ccc';
//   ctx.font = '14px Arial';
//   ctx.fillText('SEMINAR ACCESS CARD', 110, 75);

//   ctx.fillStyle = '#bfa76f';
//   ctx.font = 'italic 13px Arial';
//   ctx.fillText('Connecting Vision with Social Impact', 110, 95);
// // Connecting Vision with Social Impact
// // Where Passion Meets Social Impact
//   // Divider
//   ctx.strokeStyle = '#333';
//   ctx.beginPath();
//   ctx.moveTo(30, 110);
//   ctx.lineTo(570, 110);
//   ctx.stroke();

//   // User Data
//   const name = getField('Name') || 'N/A';
//   const org = getField('ngoName') || 'N/A';
//   const contact = getField('Contact') || 'N/A';

//   let startY = 150;

//   // Name
//   ctx.fillStyle = '#fff';
//   ctx.font = 'bold 17px Arial';
//   startY = drawWrappedText(name.toUpperCase(), 40, startY, 300, 20);

//   // ID
//   ctx.font = '14px Arial';
//   ctx.fillStyle = '#ccc';
//   startY += 20;
//   ctx.fillText(`ID: ${customId}`, 40, startY);

//   // Organization
//   startY += 20;
//   startY = drawWrappedText(`Org: ${org}`, 40, startY, 300, 18);

//   // Contact
//   startY += 20;
//   drawWrappedText(`Contact: ${contact}`, 40, startY, 300, 18);

//   // Badge
//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(400, 140, 150, 90);

//   ctx.strokeStyle = '#C9A227';
//   ctx.lineWidth = 2;
//   ctx.strokeRect(400, 140, 150, 90);

//   ctx.fillStyle = '#fcf6f6';
//   ctx.font = 'bold 1px Arial';
//   ctx.fillText('AUTHORIZED', 415, 175);

//   ctx.font = '1px Arial';
//   ctx.fillText('SEMINAR ACCESS', 410, 200);

//   // Bottom Shape
//   ctx.beginPath();
//   ctx.moveTo(0, 300);
//   ctx.quadraticCurveTo(300, 100, 100, 600);
//   ctx.lineTo(600, 350);
//   ctx.lineTo(0, 350);
//   ctx.closePath();
//   ctx.fillStyle = 'rgba(255, 217, 0, 0.18)';
//   ctx.fill();

//   return canvas.toBuffer('image/png');
// };











// Id Card for Delhi Seminar

export const generatePremiumCard = async (user, customId) => {
  const canvas = createCanvas(640, 360);
  const ctx = canvas.getContext('2d');

  const getField = (key) =>
    user.fields instanceof Map ? user.fields.get(key) : user.fields?.[key];

  // ── Helpers ──────────────────────────────────────────────
  const drawWrappedText = (text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY;
  };

  // Gold gradient (horizontal)
  const makeGoldH = (x0, x1) => {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0,   '#c9a244');
    g.addColorStop(0.5, '#f0d080');
    g.addColorStop(1,   '#c9a244');
    return g;
  };

  // Gold gradient (vertical)
  const makeGoldV = (y0, y1) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0,   '#c9a244');
    g.addColorStop(0.5, '#f0d080');
    g.addColorStop(1,   '#c9a244');
    return g;
  };

  const W = 640, H = 360;

  // ── 1. Background ─────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0,    '#0a0e1f');
  bgGrad.addColorStop(0.6,  '#0d1630');
  bgGrad.addColorStop(1,    '#070a16');
  ctx.fillStyle = bgGrad;
  ctx.roundRect(0, 0, W, H, 14);
  ctx.fill();

  // Dot texture overlay
  ctx.fillStyle = '#c9a24420';
  for (let x = 12; x < W; x += 24) {
    for (let y = 12; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── 2. Outer border ───────────────────────────────────────
  ctx.strokeStyle = makeGoldH(0, W);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(10, 10, 620, 340, 10);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(201,162,68,0.2)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.roundRect(14, 14, 612, 332, 8);
  ctx.stroke();

  // ── 3. Left / right gold stripes ─────────────────────────
  ctx.fillStyle = makeGoldV(10, 350);
  ctx.globalAlpha = 0.5;
  ctx.fillRect(10, 10, 5, 340);
  ctx.fillRect(625, 10, 5, 340);
  ctx.globalAlpha = 1;

  // ── 4. Corner ornaments ───────────────────────────────────
  const corners = [
    { sx: 10, sy: 44, ex: 10, ey: 10, ex2: 44, ey2: 10 },   // TL
    { sx: 630, sy: 44, ex: 630, ey: 10, ex2: 596, ey2: 10 }, // TR
    { sx: 10, sy: 316, ex: 10, ey: 350, ex2: 44, ey2: 350 }, // BL
    { sx: 630, sy: 316, ex: 630, ey: 350, ex2: 596, ey2: 350 }, // BR
  ];
  ctx.strokeStyle = '#c9a244';
  ctx.lineWidth = 2.2;
  corners.forEach(({ sx, sy, ex, ey, ex2, ey2 }) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex2, ey2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a244';
    ctx.fill();
  });

  // ── 5. Delhi Edition badge (top-right) ───────────────────
  ctx.fillStyle = 'rgba(201,162,68,0.13)';
  ctx.strokeStyle = 'rgba(201,162,68,0.4)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(460, 22, 162, 22, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f0d080';
  ctx.font = 'bold 9.5px Cinzel, serif';
  ctx.letterSpacing = '1.5px';
  ctx.textAlign = 'center';
  ctx.fillText('✦ DELHI EDITION ✦', 541, 37);
  ctx.letterSpacing = '0px';

  // ── 6. Logo (actual company logo image) ──────────────────
  const logoPath = path.join(process.cwd(), 'public/image/logo.jpg');
  const logo = await loadImage(logoPath);

  // Gold ring behind logo
  ctx.strokeStyle = makeGoldH(30, 94);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(62, 62, 30, 0, Math.PI * 2);
  ctx.fillStyle = '#101428';
  ctx.fill();
  ctx.stroke();

  // Clip logo to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(62, 62, 28, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, 34, 34, 56, 56);
  ctx.restore();

  // ── 7. Company title ──────────────────────────────────────
  ctx.textAlign = 'left';

  ctx.fillStyle = makeGoldH(104, 400);
  ctx.font = 'bold 18px Cinzel, serif';
  ctx.fillText('NGO GURU PVT LTD', 104, 48);

  ctx.fillStyle = 'rgba(201,162,68,0.8)';
  ctx.font = '9px Cinzel, serif';
  ctx.letterSpacing = '3.5px';
  ctx.fillText('SEMINAR ACCESS CARD', 104, 66);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#a07830';
  ctx.font = 'italic 12px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Connecting Vision with Social Impact', 104, 83);

  // ── 8. Divider with diamond ornament ─────────────────────
  ctx.strokeStyle = 'rgba(201,162,68,0.5)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(30, 105); ctx.lineTo(300, 105); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(340, 105); ctx.lineTo(610, 105); ctx.stroke();

  // Diamond
  ctx.fillStyle = 'rgba(201,162,68,0.7)';
  ctx.beginPath();
  ctx.moveTo(320, 100);
  ctx.lineTo(326, 105);
  ctx.lineTo(320, 110);
  ctx.lineTo(314, 105);
  ctx.closePath();
  ctx.fill();

  // ── 9. Name (centered) ───────────────────────────────────
  const name = (getField('Name') || 'N/A').toUpperCase();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Cinzel, serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(name, W / 2, 148);
  ctx.letterSpacing = '0px';

  // Name underline
  ctx.strokeStyle = makeGoldH(140, 500);
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.moveTo(140, 158); ctx.lineTo(500, 158); ctx.stroke();
  ctx.globalAlpha = 1;

  // ── 10. Info rows (centered, label : value) ───────────────
  const org     = getField('ngoName')  || 'N/A';
  const contact = getField('Contact')  || 'N/A';

  const labelX = 210;   // right-align labels here
  const colonX = 218;
  const valueX = 232;

  const infoRows = [
    { label: 'ID',           value: customId },
    { label: 'Organisation', value: org },
    { label: 'Contact',      value: contact },
  ];

  infoRows.forEach(({ label, value }, i) => {
    const y = 186 + i * 26;

    ctx.textAlign = 'right';
    ctx.fillStyle = '#8090a8';
    ctx.font = '14px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(label, labelX, y);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#c9a244';
    ctx.fillText(':', colonX, y);

    ctx.fillStyle = '#e8d5a0';
    ctx.font = '14.5px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(value, valueX, y);
  });

  // ── 11. Bottom band ───────────────────────────────────────
  ctx.fillStyle = 'rgba(201,162,68,0.065)';
  ctx.fillRect(10, 268, 620, 82);

  ctx.strokeStyle = 'rgba(201,162,68,0.5)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(10, 268); ctx.lineTo(630, 268); ctx.stroke();

  // ── 12. Minaret silhouette ────────────────────────────────
  ctx.fillStyle = 'rgba(201,162,68,0.18)';
  ctx.globalAlpha = 0.55;

  // Central tower
  ctx.fillRect(42, 294, 12, 56);
  ctx.beginPath(); ctx.moveTo(48, 284); ctx.lineTo(38, 294); ctx.lineTo(58, 294); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(48, 284, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  // Side towers
  ctx.fillRect(28, 314, 8, 36);
  ctx.beginPath(); ctx.moveTo(32, 307); ctx.lineTo(25, 314); ctx.lineTo(39, 314); ctx.closePath(); ctx.fill();
  ctx.fillRect(62, 314, 8, 36);
  ctx.beginPath(); ctx.moveTo(66, 307); ctx.lineTo(59, 314); ctx.lineTo(73, 314); ctx.closePath(); ctx.fill();
  // Base
  ctx.fillRect(18, 348, 60, 4);
  ctx.globalAlpha = 1;

  // ── 13. Geo triangles (bottom sides) ─────────────────────
  ctx.strokeStyle = '#c9a244';
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.28;
  [[562, 295], [582, 295], [602, 295]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x + 8, 280); ctx.lineTo(x + 16, y); ctx.lineTo(x, y); ctx.closePath();
    ctx.stroke();
  });
  [[62, 295], [82, 295]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x + 8, 280); ctx.lineTo(x + 16, y); ctx.lineTo(x, y); ctx.closePath();
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // ── 14. Bottom text ───────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.font = '12px Cinzel, serif';
  ctx.letterSpacing = '2.5px';
  ctx.fillStyle = '#c9a244';
  ctx.fillText('DELHI SEMINAR 2026', W / 2, 293);
  ctx.letterSpacing = '0px';

  ctx.font = 'italic 12px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#8090a0';
  ctx.fillText('Empowering NGOs · Strengthening Communities', W / 2, 313);

  // ── 15. QR placeholder (bottom-right) ────────────────────
  ctx.fillStyle = 'rgba(201,162,68,0.1)';
  ctx.strokeStyle = 'rgba(201,162,68,0.27)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.roundRect(540, 278, 56, 56, 4); ctx.fill(); ctx.stroke();

  // QR pixel blocks
  const qrColor = 'rgba(201,162,68,0.5)';
  ctx.fillStyle = qrColor;
  ctx.strokeStyle = qrColor;
  ctx.lineWidth = 0.7;

  const qrBlocks = [
    // TL finder
    { x: 544, y: 282, w: 14, h: 14, fill: false },
    { x: 546, y: 284, w: 4,  h: 4  },
    { x: 552, y: 284, w: 4,  h: 4  },
    { x: 546, y: 290, w: 4,  h: 4  },
    // TR finder
    { x: 562, y: 282, w: 14, h: 14, fill: false },
    { x: 564, y: 284, w: 10, h: 4  },
    { x: 564, y: 290, w: 6,  h: 4  },
    // BL finder
    { x: 544, y: 300, w: 14, h: 14, fill: false },
    { x: 546, y: 302, w: 4,  h: 10 },
    { x: 552, y: 302, w: 4,  h: 4  },
    // Data modules
    { x: 562, y: 298, w: 4,  h: 4  },
    { x: 568, y: 302, w: 4,  h: 4  },
    { x: 562, y: 306, w: 10, h: 4  },
    { x: 562, y: 312, w: 4,  h: 4  },
  ];
  qrBlocks.forEach(({ x, y, w, h, fill = true }) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 1);
    fill ? ctx.fill() : ctx.stroke();
  });

  ctx.textAlign = 'center';
  ctx.font = '7.5px Cinzel, serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillStyle = 'rgba(201,162,68,0.4)';
  ctx.fillText('ngo-guru', 568, 340);
  ctx.letterSpacing = '0px';

  return canvas.toBuffer('image/png');
};
// blank wala  mumbai
// export const generatePremiumCardBlank = async (user, customId) => {
//   const canvas = createCanvas(650, 450);
//   const ctx = canvas.getContext('2d');

//   // Background
//   ctx.fillStyle = '#000';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Gold Gradient
//   const gold = ctx.createLinearGradient(0, 0, 600, 0);
//   gold.addColorStop(0, '#C9A227');
//   gold.addColorStop(1, '#704c15');

//   // Decorative Curves
//   ctx.beginPath();
//   ctx.moveTo(400, 0);
//   ctx.quadraticCurveTo(600, 100, 600, 0);
//   ctx.fillStyle = '#111';
//   ctx.fill();

//   ctx.beginPath();
//   ctx.moveTo(350, 0);
//   ctx.quadraticCurveTo(600, 150, 600, 50);
//   ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
//   ctx.fill();

//   // Border
//   ctx.strokeStyle = gold;
//   ctx.lineWidth = 2;
//   ctx.strokeRect(15, 15, 620, 420);

//   // Logo
//   const logoPath = path.join(process.cwd(), 'public/image/logo.jpg');
//   const logo = await loadImage(logoPath);
//   ctx.drawImage(logo, 30, 30, 60, 60);

//   // Header Text
//   ctx.fillStyle = gold;
//   ctx.font = 'bold 22px Arial';
//   ctx.fillText('NGO GURU PVT LTD', 110, 55);

//   ctx.fillStyle = '#ccc';
//   ctx.font = '14px Arial';
//   ctx.fillText('SEMINAR ACCESS CARD', 110, 75);

//   ctx.fillStyle = '#bfa76f';
//   ctx.font = 'italic 13px Arial';
//   ctx.fillText('Where Passion Meets Social Impact', 110, 95);

//   // Divider
//   ctx.strokeStyle = '#333';
//   ctx.beginPath();
//   ctx.moveTo(30, 110);
//   ctx.lineTo(620, 110);
//   ctx.stroke();

//   // ==============================
//   // WHITE USER DETAILS SECTION (ENLARGED)
//   // ==============================
//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(30, 130, 380, 200);

//   ctx.strokeStyle = '#C9A227';
//   ctx.lineWidth = 1.5;
//   ctx.strokeRect(30, 130, 380, 200);

//   // Labels
//   ctx.fillStyle = '#000';
//   ctx.font = 'bold 15px Arial';

//   ctx.fillText('Name:', 40, 165);
//   ctx.fillText('ID:', 40, 205);
//   ctx.fillText('Org:', 40, 245);
//   ctx.fillText('Contact:', 40, 285);

//   // Writing lines
//   ctx.strokeStyle = '#999';
//   ctx.lineWidth = 1;

//   ctx.beginPath();
//   ctx.moveTo(120, 160); ctx.lineTo(390, 160);
//   ctx.moveTo(120, 200); ctx.lineTo(390, 200);
//   ctx.moveTo(120, 240); ctx.lineTo(390, 240);
//   ctx.moveTo(120, 280); ctx.lineTo(390, 280);
//   ctx.stroke();

//   // ==============================
//   // BADGE (RIGHT SIDE)
//   // ==============================
//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(440, 150, 170, 110);

//   ctx.strokeStyle = '#C9A227';
//   ctx.lineWidth = 2;
//   ctx.strokeRect(440, 150, 170, 110);

//   ctx.fillStyle = '#00000021';
//   ctx.font = 'bold 14px Arial';
//   ctx.fillText('AUTHORIZED', 460, 190);

//   ctx.font = '12px Arial';
//   ctx.fillText('SEMINAR ACCESS', 455, 215);

//   // Bottom Design Shape
//   ctx.beginPath();
//   ctx.moveTo(0, 300);
//   ctx.quadraticCurveTo(300, 100, 100, 600);
//   ctx.lineTo(600, 350);
//   ctx.lineTo(0, 350);
//   ctx.closePath();
//   ctx.fillStyle = 'rgba(255, 217, 0, 0.18)';
//   ctx.fill();
//   return canvas.toBuffer('image/png');
// };



// blank wala delhi
export const generatePremiumCardBlank = async () => {
  // Fields are left blank for handwriting – no user data needed
  const canvas = createCanvas(640, 380);
  const ctx = canvas.getContext('2d');

  const W = 640, H = 380;

  // ── Gradient helpers ────────────────────────────────────────────────────────
  const goldH = (x0, x1) => {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0,   '#c9a244');
    g.addColorStop(0.5, '#f0d080');
    g.addColorStop(1,   '#c9a244');
    return g;
  };
  const goldV = (y0, y1) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0,   '#c9a244');
    g.addColorStop(0.5, '#f0d080');
    g.addColorStop(1,   '#c9a244');
    return g;
  };

  // ── 1. Background ───────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   '#0a0e1f');
  bg.addColorStop(0.6, '#0d1630');
  bg.addColorStop(1,   '#070a16');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 14);
  ctx.fill();

  // Dot texture
  ctx.fillStyle = '#c9a24428';
  for (let x = 12; x < W; x += 24)
    for (let y = 12; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

  // ── 2. Borders ──────────────────────────────────────────────────────────────
  ctx.strokeStyle = goldH(0, W);
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(10, 10, 620, 360, 10); ctx.stroke();

  ctx.strokeStyle = 'rgba(201,162,68,0.2)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.roundRect(14, 14, 612, 352, 8); ctx.stroke();

  // ── 3. Side gold stripes ────────────────────────────────────────────────────
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = goldV(10, 370);
  ctx.fillRect(10, 10, 5, 360);
  ctx.fillRect(625, 10, 5, 360);
  ctx.globalAlpha = 1;

  // ── 4. Corner ornaments ─────────────────────────────────────────────────────
  const corners = [
    [10,  46,  10,  10,  46,  10 ],
    [630, 46,  630, 10,  594, 10 ],
    [10,  334, 10,  370, 46,  370],
    [630, 334, 630, 370, 594, 370],
  ];
  ctx.strokeStyle = '#c9a244';
  ctx.lineWidth = 2.2;
  corners.forEach(([sx, sy, ex, ey, ex2, ey2]) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(ex2, ey2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a244';
    ctx.fill();
  });

  // ── 5. Delhi Edition badge ──────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(201,162,68,0.13)';
  ctx.strokeStyle = 'rgba(201,162,68,0.4)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.roundRect(460, 22, 162, 22, 4); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#f0d080';
  ctx.font = 'bold 9.5px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('DELHI EDITION 2026', 541, 37);

  // ── 6. Logo ─────────────────────────────────────────────────────────────────
  const logoPath = path.join(process.cwd(), 'public/image/logo.jpg');
  const logo = await loadImage(logoPath);

  ctx.strokeStyle = goldH(30, 94);
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(62, 62, 30, 0, Math.PI * 2);
  ctx.fillStyle = '#101428'; ctx.fill(); ctx.stroke();

  ctx.save();
  ctx.beginPath(); ctx.arc(62, 62, 28, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(logo, 34, 34, 56, 56);
  ctx.restore();

  // ── 7. Company title ────────────────────────────────────────────────────────
  ctx.textAlign = 'left';
  ctx.fillStyle = goldH(104, 420);
  ctx.font = 'bold 18px "Cinzel", serif';
  ctx.fillText('NGO GURU PVT LTD', 104, 48);

  ctx.fillStyle = 'rgba(201,162,68,0.8)';
  ctx.font = '9px "Cinzel", serif';
  ctx.fillText('SEMINAR ACCESS CARD', 104, 66);

  ctx.fillStyle = '#a07830';
  ctx.font = 'italic 12px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Connecting Vision with Social Impact', 104, 83);

  // ── 8. Divider + diamond ────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(201,162,68,0.5)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(30, 104); ctx.lineTo(300, 104); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(340, 104); ctx.lineTo(610, 104); ctx.stroke();

  ctx.fillStyle = 'rgba(201,162,68,0.7)';
  ctx.beginPath();
  ctx.moveTo(320, 99); ctx.lineTo(326, 104); ctx.lineTo(320, 109); ctx.lineTo(314, 104);
  ctx.closePath(); ctx.fill();

  // ── 9. Write-in fields ──────────────────────────────────────────────────────
  // Three generous blank boxes: tall enough for a dark pen, full card width
  const fields = [
    { label: 'NAME',         y: 118 },
    { label: 'ORGANISATION', y: 192 },
    { label: 'CONTACT',      y: 266 },
  ];

  fields.forEach(({ label, y }) => {
    // Gold label above box
    ctx.fillStyle = 'rgba(201,162,68,0.85)';
    ctx.font = '10px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 36, y);

    const boxY = y + 8;
    const boxH = 40; // tall enough for thick pen strokes

    // Very subtle warm fill so dark ink pops
    ctx.fillStyle = 'rgba(247, 246, 246, 0.88)';
    ctx.beginPath(); ctx.roundRect(36, boxY, 568, boxH, 4); ctx.fill();

    // Dashed gold border
    ctx.strokeStyle = '#c9a244';
    ctx.lineWidth = 0.9;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.roundRect(36, boxY, 568, boxH, 4); ctx.stroke();
    ctx.setLineDash([]);

    // Inner baseline guide (like ruled paper)
    ctx.strokeStyle = 'rgba(201,162,68,0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(44, boxY + boxH - 10);
    ctx.lineTo(596, boxY + boxH - 10);
    ctx.stroke();
  });

  // ── 10. Bottom band ─────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(201,162,68,0.065)';
  ctx.fillRect(10, 326, 620, 54);

  ctx.strokeStyle = 'rgba(201,162,68,0.5)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(10, 326); ctx.lineTo(630, 326); ctx.stroke();

  // ── 11. Minaret silhouette ──────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(201,162,68,0.22)';
  ctx.globalAlpha = 0.55;

  ctx.fillRect(42, 330, 10, 40);
  ctx.beginPath(); ctx.moveTo(47,322); ctx.lineTo(38,330); ctx.lineTo(56,330); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(47, 322, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(28, 342, 8, 28);
  ctx.beginPath(); ctx.moveTo(32,336); ctx.lineTo(24,342); ctx.lineTo(40,342); ctx.closePath(); ctx.fill();
  ctx.fillRect(58, 342, 8, 28);
  ctx.beginPath(); ctx.moveTo(62,336); ctx.lineTo(54,342); ctx.lineTo(70,342); ctx.closePath(); ctx.fill();
  ctx.fillRect(18, 368, 54, 3);

  ctx.globalAlpha = 1;

  // ── 12. Bottom text ─────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.font = '11px "Cinzel", serif';
  ctx.fillStyle = '#c9a244';
  ctx.fillText('DELHI SEMINAR 2026', W / 2, 348);

  ctx.font = 'italic 11.5px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#8090a0';
  ctx.fillText('Empowering NGOs · Strengthening Communities', W / 2, 366);

  // ── 13. Geo triangles ───────────────────────────────────────────────────────
  ctx.strokeStyle = '#c9a244';
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.25;

  [[562,343],[580,343],[598,343]].forEach(([bx, by]) => {
    ctx.beginPath(); ctx.moveTo(bx+8,328); ctx.lineTo(bx+16,by); ctx.lineTo(bx,by); ctx.closePath(); ctx.stroke();
  });
  [[82,343],[100,343]].forEach(([bx, by]) => {
    ctx.beginPath(); ctx.moveTo(bx+8,328); ctx.lineTo(bx+16,by); ctx.lineTo(bx,by); ctx.closePath(); ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // ── 14. QR placeholder ──────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(201,162,68,0.1)';
  ctx.strokeStyle = 'rgba(201,162,68,0.27)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.roundRect(540, 330, 52, 36, 3); ctx.fill(); ctx.stroke();

  ctx.fillStyle   = 'rgba(201,162,68,0.5)';
  ctx.strokeStyle = 'rgba(201,162,68,0.5)';

  const qr = [
    { x:544, y:334, w:10, h:10, f:false },
    { x:546, y:336, w:3,  h:3          },
    { x:558, y:334, w:10, h:10, f:false },
    { x:560, y:336, w:6,  h:3          },
    { x:560, y:340, w:4,  h:3          },
    { x:544, y:348, w:10, h:10, f:false },
    { x:546, y:350, w:3,  h:6          },
    { x:558, y:346, w:3,  h:3          },
    { x:563, y:350, w:5,  h:3          },
    { x:558, y:354, w:8,  h:3          },
  ];
  qr.forEach(({ x, y, w, h, f = true }) => {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 1);
    f ? ctx.fill() : ctx.stroke();
  });

  ctx.textAlign = 'center';
  ctx.font = '7px "Cinzel", serif';
  ctx.fillStyle = 'rgba(201,162,68,0.45)';
  ctx.fillText('', 566, 372);

  return canvas.toBuffer('image/png');
};
export const generatePremiumCardOne = async (user, customId) => {
  const canvas = createCanvas(600, 350);
  const ctx = canvas.getContext('2d');

  const getField = (key) =>
    user.fields instanceof Map ? user.fields.get(key) : user.fields?.[key];

  // ✅ Helper: Wrap text inside max width
  const drawWrappedText = (text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, currentY);
    return currentY;
  };

  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gold Gradient
  const gold = ctx.createLinearGradient(0, 0, 600, 0);
  gold.addColorStop(0, '#C9A227');
  gold.addColorStop(1, '#704c15');

  // Curves
  ctx.beginPath();
  ctx.moveTo(400, 0);
  ctx.quadraticCurveTo(600, 100, 600, 0);
  ctx.fillStyle = '#111';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(350, 0);
  ctx.quadraticCurveTo(600, 150, 600, 50);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
  ctx.fill();

  // Border
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 15, 570, 320);

  // Logo
  const logoPath = path.join(process.cwd(), 'public/image/logo.jpg');
  const logo = await loadImage(logoPath);
  ctx.drawImage(logo, 30, 30, 60, 60);

  // Header
  ctx.fillStyle = gold;
  ctx.font = 'bold 22px Arial';
  ctx.fillText('NGO GURU PVT LTD', 110, 55);

  ctx.fillStyle = '#ccc';
  ctx.font = '14px Arial';
  ctx.fillText('SEMINAR ACCESS CARD', 110, 75);

  ctx.fillStyle = '#bfa76f';
  ctx.font = 'italic 13px Arial';
  ctx.fillText('Where Passion Meets Social Impact', 110, 95);

  // Divider
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(30, 110);
  ctx.lineTo(570, 110);
  ctx.stroke();

  // User Data
  const name = getField('Name') || 'N/A';
  const org = getField('ngoName') || 'N/A';
  const contact = getField('Contact') || 'N/A';

  let startY = 150;

  // Name
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px Arial';
  startY = drawWrappedText(name.toUpperCase(), 40, startY, 300, 20);

  // ID
  ctx.font = '14px Arial';
  ctx.fillStyle = '#ccc';
  startY += 20;
  ctx.fillText(`ID: ${customId}`, 40, startY);

  // Organization
  startY += 20;
  startY = drawWrappedText(`Org: ${org}`, 40, startY, 300, 18);

  // Contact
  startY += 20;
  drawWrappedText(`Contact: ${contact}`, 40, startY, 300, 18);

  // Badge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(400, 140, 150, 90);

  ctx.strokeStyle = '#C9A227';
  ctx.lineWidth = 2;
  ctx.strokeRect(400, 140, 150, 90);

  ctx.fillStyle = '#fcf6f6';
  ctx.font = 'bold 1px Arial';
  ctx.fillText('AUTHORIZED', 415, 175);

  ctx.font = '1px Arial';
  ctx.fillText('SEMINAR ACCESS', 410, 200);

  // Bottom Shape
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(300, 100, 100, 600);
  ctx.lineTo(600, 350);
  ctx.lineTo(0, 350);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 217, 0, 0.18)';
  ctx.fill();

  return canvas.toBuffer('image/png');
};
import ExcelJS from 'exceljs';
import EmployeeModel from '../models/employees/employee.model.js';
import { isValidObjectId } from 'mongoose';



// export const exportLeadsToExcel = async (req, res) => {
//   try {
//     const { status, source } = req.query;

//     const query = {};
//     if (source) {
//       query.source = {
//         $regex: `.*${escapeRegex(source)}.*`,
//         $options: 'i',
//       };
//     }
//     if (status) {
//       query['fields.status'] = status;
//     }

//     // Fetch leads
//     const leads = await leadModel.find(query).sort({ createdAt: -1 });

//     // ===== Populate addedBy for OnConfirmed =====
//     for (const lead of leads) {
//       if (Array.isArray(lead.OnConfirmed)) {
//         for (const oc of lead.OnConfirmed) {
//           if (oc.addedBy?.userId) {
//             const user = await EmployeeModel.findById(oc.addedBy.userId).select('name');
//             if (user) {
//               oc.addedBy.name = user.name;
//             }
//           }
//         }
//       }
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Leads');

//     // ===== Columns =====
//     worksheet.columns = [
//       { header: 'Name', key: 'name', width: 25 },
//       { header: 'Email', key: 'email', width: 30 },
//       { header: 'Contact', key: 'contact', width: 20 },
//       { header: 'NGO Name', key: 'ngoName', width: 30 },
//       { header: 'City', key: 'city', width: 20 },
//       { header: 'State', key: 'state', width: 20 },
//       { header: 'Status', key: 'status', width: 20 },
//       { header: 'Source', key: 'source', width: 25 },
//       { header: 'OnConfirmed', key: 'onConfirmed', width: 80 },
//     ];

//     // ===== Helper to format OnConfirmed with colors =====
//     const formatOnConfirmedRichText = (onConfirmedArray) => {
//       return (onConfirmedArray || []).map((item) => {
//         const service = item.nameOfService || '';
//         const total = item.totalAmount || '';
//         const paid = item.paidAmount || '';
//         const unpaid = item.unpaidAmount || '';
//         const addedByName = item.addedBy?.name || '';

//         const richText = [];
//         if (service) richText.push({ text: `Service: ${service}\n`, font: { color: { argb: 'FF000000' } } });
//         if (total || paid || unpaid) {
//           richText.push({ text: `Total: ${total}`, font: { color: { argb: 'FF000000' } } });
//           richText.push({ text: `, Paid: ${paid}`, font: { color: { argb: 'FF28A745' } } }); // green
//           richText.push({ text: `, Unpaid: ${unpaid}\n`, font: { color: { argb: 'FFDC3545' } } }); // red
//         }
//         if (addedByName) richText.push({ text: `Added By: ${addedByName}\n`, font: { color: { argb: 'FF006400' }, size: 12 } }); // dark green
//         return { richText };
//       });
//     };

//     // ===== Add rows =====
//     leads.forEach((lead) => {
//       const getField = (key) => (lead.fields instanceof Map ? lead.fields.get(key) : lead.fields?.[key]);

//       const richTextArray = formatOnConfirmedRichText(lead.OnConfirmed);

//       const cellRichText = [];
//       richTextArray.forEach((item, index) => {
//         cellRichText.push(...item.richText);
//         if (index < richTextArray.length - 1) {
//           cellRichText.push({ text: '\n', font: { color: { argb: 'FF000000' } } });
//         }
//       });

//       const row = worksheet.addRow({
//         name: getField('Name') || '',
//         email: getField('Email') || '',
//         contact: getField('Contact') || '',
//         ngoName: getField('ngoName') || '',
//         city: getField('city') || '',
//         state: getField('state') || '',
//         status: getField('status') || '',
//         source: lead.source || '',
//       });

//       const onConfirmedCell = row.getCell('onConfirmed');
//       onConfirmedCell.value = { richText: cellRichText };
//       onConfirmedCell.alignment = { wrapText: true };
//     });

//     // ===== Response =====
//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader('Content-Disposition', 'attachment; filename=leads.xlsx');

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error exporting Excel');
//   }
// };
// ===== Create PDF =====
export const createIDCard = async (req, res) => {
  try {
    const { status, source, date } = req.query;

    const query = {};

    if (source) {
      query.source = {
        $regex: `.*${escapeRegex(source)}.*`,
        $options: 'i',
      };
    }

    if (status) {
      query['fields.status'] = status;
    }

    const leadAll = await leadModel.find(query).sort({ createdAt: -1 });

    const pdfDoc = await PDFDocument.create();

    let counter = 1;
    // S2S29032601PP
    const [day, month, year] = date.split("/");
    const formattedDate = `${day}${month}${year.slice(2)}`;
    const locationCode = getLocationCode(source);
    // console.log(formattedDate, locationCode)
    for (let user of leadAll) {
      const suffix = user.OnConfirmed?.[0]?.unpaidAmount > 0 ? 'PP' : 'FP';

      const customId = `S2S100526DEL${String(counter).padStart(2, '0')}${suffix}`;
      // const customId = `S2S2${formattedDate}${locationCode}${String(counter).padStart(3, "0")}${suffix}`;
      counter++;

      const imageBuffer = await generatePremiumCard(user, customId);

      const image = await pdfDoc.embedPng(imageBuffer);
      const page = pdfDoc.addPage([600, 400]);

      const { width, height } = image.scale(0.8);

      page.drawImage(image, {
        x: 50,
        y: 50,
        width,
        height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=id_cards.pdf'
      // 'attachment; filename=id_cards_blank.pdf'
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating PDF');
  }
};



export const createIDCardBlank = async (req, res) => {
  try {
    const { status, source } = req.query;

    const query = {};

    if (source) {
      query.source = {
        $regex: `.*${escapeRegex(source)}.*`,
        $options: 'i',
      };
    }

    if (status) {
      query['fields.status'] = status;
    }

    const leadAll = await leadModel.find(query).sort({ createdAt: -1 });

    const pdfDoc = await PDFDocument.create();

    let counter = 1;
    // S2S29032601PP
    for (let user of leadAll.slice(0, 5)) {
      // const suffix = user.OnConfirmed?.[0]?.unpaidAmount > 0 ? 'PP' : 'FP';

      // const customId = `S2S290326MUM${String(counter).padStart(2, '0')}${suffix}`;

      // counter++;

      const imageBuffer = await generatePremiumCardBlank();

      const image = await pdfDoc.embedPng(imageBuffer);
      const page = pdfDoc.addPage([600, 400]);

      const { width, height } = image.scale(0.8);

      page.drawImage(image, {
        x: 50,
        y: 50,
        width,
        height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      // 'attachment; filename=id_cards.pdf'
      'attachment; filename=id_cards_blank.pdf'
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating PDF');
  }
};

// seminar excell data
export const exportLeadsToExcel = async (req, res) => {
  try {
    const { status, source } = req.query;

    const query = {};

    if (source) {
      query.source = {
        $regex: `.*${escapeRegex(source)}.*`,
        $options: 'i',
      };
    }

    if (status) {
      query['fields.status'] = status;
    }

    // ===== Fetch leads =====
    const leads = await leadModel.find(query).sort({ createdAt: -1 });

    // ===== Collect userIds =====
    const userIds = new Set();

    leads.forEach((lead) => {
      (lead.OnConfirmed || []).forEach((oc) => {
        if (oc.addedBy?.userId) {
          userIds.add(oc.addedBy.userId.toString());
        }
      });
    });

    // ===== Fetch users =====
    const users = await EmployeeModel.find({
      _id: { $in: [...userIds] },
    }).select('name');

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user.name;
    });

    // ===== Attach names =====
    leads.forEach((lead) => {
      (lead.OnConfirmed || []).forEach((oc) => {
        if (oc.addedBy?.userId) {
          oc.addedBy.name = userMap[oc.addedBy.userId.toString()] || '';
        }
      });
    });

    // ===== Create workbook =====
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    // ===== Columns (NO OnConfirmed) =====
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Contact', key: 'contact', width: 20 },
      { header: 'NGO Name', key: 'ngoName', width: 30 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'State', key: 'state', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Source', key: 'source', width: 25 },

      { header: 'Total Paid', key: 'totalPaid', width: 20 },
      { header: 'Total Unpaid', key: 'totalUnpaid', width: 20 },
    ];

    // ===== Add rows =====
    leads.forEach((lead) => {
      const getField = (key) =>
        lead.fields instanceof Map
          ? lead.fields.get(key)
          : lead.fields?.[key];

      let totalPaid = 0;
      let totalUnpaid = 0;

      (lead.OnConfirmed || []).forEach((item) => {
        totalPaid += Number(item.paidAmount || 0);
        totalUnpaid += Number(item.unpaidAmount || 0);
      });

      const row = worksheet.addRow({
        name: getField('Name') || '',
        email: getField('Email') || '',
        contact: getField('Contact') || '',
        ngoName: getField('ngoName') || '',
        city: getField('city') || '',
        state: getField('state') || '',
        status: getField('status') || '',
        source: lead.source || '',

        totalPaid,
        totalUnpaid,
      });

      // ===== Optional coloring =====
      row.getCell('totalPaid').font = { color: { argb: 'FF28A745' } };
      row.getCell('totalUnpaid').font = { color: { argb: 'FFDC3545' } };
    });

    // ===== Response =====
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=leads.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error exporting Excel');
  }
};

export const createIDCardOne = async (req, res) => {
  try {
        const { id } = req.params;
    const { status, source } = req.query;

    const query = {};

    if (source) {
      query.source = {
        $regex: `.*${escapeRegex(source)}.*`,
        $options: 'i',
      };
    }

    if (status) {
      query['fields.status'] = status;
    }

    // const leadAll = await leadModel.find(query).sort({ createdAt: -1 });
     const user = await leadModel.findById(id);
    if (!user) return res.status(404).send('User not found');

    const pdfDoc = await PDFDocument.create();

    let counter = 66;
    // S2S29032601PP
    // for (let user of leadAll.slice(0, 5)) {
      const suffix = user.OnConfirmed?.[0]?.unpaidAmount > 0 ? 'PP' : 'FP';

      // const customId = `S2S290326MUM${String(counter).padStart(2, '0')}${suffix}`;
      const customId = `S2S100526DEL${String(counter).padStart(2, '0')}${suffix}`;


      // const imageBuffer = await generatePremiumCardOne(user, customId);
      const imageBuffer=await generatePremiumCard(user,customId)

      const image = await pdfDoc.embedPng(imageBuffer);
      const page = pdfDoc.addPage([600, 400]);

      const { width, height } = image.scale(0.8);

      page.drawImage(image, {
        x: 50,
        y: 50,
        width,
        height,
      });
    // }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      // 'attachment; filename=id_cards.pdf'
      'attachment; filename=id_cards_blank.pdf'
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating PDF');
  }
};

// seminar dataa for website

// export const seminarData = async (req, res) => {
//   try {
//     const { status, source, page = 1, limit = 50 } = req.query;

//     const query = {};

//     if (source) {
//       query.source = {
//         $regex: `.*${escapeRegex(source)}.*`,
//         $options: "i",
//       };
//     }

//     if (status) {
//       query["fields.status"] = status;
//     }

//     // Convert page & limit to integers
//     const pageNumber = Math.max(parseInt(page), 1);
//     const pageLimit = Math.max(parseInt(limit), 1);

//     // Total count (for pagination UI)
//     const totalCount = await leadModel.countDocuments(query);

//     // Fetch paginated leads
//     const leadAll = await leadModel
//       .find(query)
//       .select("fields OnConfirmed") // only these two
//       .sort({ createdAt: -1 })
//       .skip((pageNumber - 1) * pageLimit)
//       .limit(pageLimit);

//     res.json({
//       success: true,
//       data: leadAll,
//       pagination: {
//         totalCount,
//         page: pageNumber,
//         limit: pageLimit,
//         totalPages: Math.ceil(totalCount / pageLimit),
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
export const seminarData = async (req, res) => {
  try {
    const {
      status,
      source,
      page = 1,
      limit = 50,
      name,
      contact,
      city,
      state,
      email,
      ngoName,
      year,
    } = req.query;
    // console.log(req.query)
    const query = {};

    if (source) {
      query.source = {
        $regex: `.*${escapeRegex(source)}.*`,
        $options: "i",
      };
    }

    if (status) {
      query["fields.status"] = status;
    }

    // ✅ Year filter
    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      query.createdAt = { $gte: start, $lte: end };
    }

    if (name) query["fields.Name"] = { $regex: name, $options: "i" };
    if (contact) query["fields.Contact"] = { $regex: contact, $options: "i" };
    if (city) query["fields.city"] = { $regex: city, $options: "i" };
    if (state) query["fields.state"] = { $regex: state, $options: "i" };
    if (email) query["fields.Email"] = { $regex: email, $options: "i" };
    if (ngoName) query["fields.ngoName"] = { $regex: ngoName, $options: "i" };

    const pageNumber = Math.max(parseInt(page), 1);
    const pageLimit = Math.max(parseInt(limit), 1);

    const totalCount = await leadModel.countDocuments(query);

    const leadAll = await leadModel
      .find(query)
      .select("fields OnConfirmed attendance")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit);

    res.json({
      success: true,
      data: leadAll,
      pagination: {
        totalCount,
        page: pageNumber,
        limit: pageLimit,
        totalPages: Math.ceil(totalCount / pageLimit), 
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


// clear dues
// export const clearDues = async (req, res) => {
//   try {
//     const {id}=req.params
// if(!isValidObjectId(id)){
//   return
// }
//   const data=await leadModel.findByIdAndUpdate({_id:id},{

//   })
//   } catch (error) {
//     console.log(error)
//   }
// }