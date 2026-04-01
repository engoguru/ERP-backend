


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
export const generatePremiumCard = async (user, customId) => {
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
// blank wala
export const generatePremiumCardBlank = async (user, customId) => {
  const canvas = createCanvas(650, 450);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gold Gradient
  const gold = ctx.createLinearGradient(0, 0, 600, 0);
  gold.addColorStop(0, '#C9A227');
  gold.addColorStop(1, '#704c15');

  // Decorative Curves
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
  ctx.strokeRect(15, 15, 620, 420);

  // Logo
  const logoPath = path.join(process.cwd(), 'public/image/logo.jpg');
  const logo = await loadImage(logoPath);
  ctx.drawImage(logo, 30, 30, 60, 60);

  // Header Text
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
  ctx.lineTo(620, 110);
  ctx.stroke();

  // ==============================
  // WHITE USER DETAILS SECTION (ENLARGED)
  // ==============================
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30, 130, 380, 200);

  ctx.strokeStyle = '#C9A227';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(30, 130, 380, 200);

  // Labels
  ctx.fillStyle = '#000';
  ctx.font = 'bold 15px Arial';

  ctx.fillText('Name:', 40, 165);
  ctx.fillText('ID:', 40, 205);
  ctx.fillText('Org:', 40, 245);
  ctx.fillText('Contact:', 40, 285);

  // Writing lines
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(120, 160); ctx.lineTo(390, 160);
  ctx.moveTo(120, 200); ctx.lineTo(390, 200);
  ctx.moveTo(120, 240); ctx.lineTo(390, 240);
  ctx.moveTo(120, 280); ctx.lineTo(390, 280);
  ctx.stroke();

  // ==============================
  // BADGE (RIGHT SIDE)
  // ==============================
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(440, 150, 170, 110);

  ctx.strokeStyle = '#C9A227';
  ctx.lineWidth = 2;
  ctx.strokeRect(440, 150, 170, 110);

  ctx.fillStyle = '#00000021';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('AUTHORIZED', 460, 190);

  ctx.font = '12px Arial';
  ctx.fillText('SEMINAR ACCESS', 455, 215);

  // Bottom Design Shape
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

      const customId = `S2S290326MUM${String(counter).padStart(2, '0')}${suffix}`;
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

    let counter = 53;
    // S2S29032601PP
    // for (let user of leadAll.slice(0, 5)) {
      const suffix = user.OnConfirmed?.[0]?.unpaidAmount > 0 ? 'PP' : 'FP';

      const customId = `S2S290326MUM${String(counter).padStart(2, '0')}${suffix}`;


      const imageBuffer = await generatePremiumCardOne(user, customId);

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
      .select("fields OnConfirmed")
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