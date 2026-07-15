import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";

import ExcelJS from 'exceljs';

import mongoose from 'mongoose';
import Tesseract from 'tesseract.js';
 


const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const textractClient = new TextractClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const uploadReceipt = async (req, res) => {
  try {
    // 1. चेक करें कि फाइल्स फ्रंटेंड से आई हैं या नहीं
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "फाइल नहीं मिली!" });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    const savedReceipts = []; // सभी प्रोसेस हुई फाइल्स का डेटा स्टोर करने के लिए

    // 2. लूप चलाकर एक-एक करके सारी फाइल्स को प्रोसेस करें
       // 🟢 मल्टार लूप के अंदर का बिल्कुल सही और अपडेटेड ब्लॉक
    for (const file of req.files) {
      const fileKey = `receipts/${Date.now()}_${file.originalname}`; 

      // A. S3 में अपलोड करें (वर्किंग फ्लो)
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer
      }));

      // 🟢 फिक्स 1: S3 का बिल्कुल सही और वैलिड URL स्ट्रक्चर (बैकेटिक के साथ टेम्पलेट फिक्स)
   
const s3Url = `https://${bucketName}://{fileKey}`;
      let extractedData = { date: "MISSING", gstNumber: "MISSING", totalAmount: "MISSING" };
      
      try {
        console.log(`Processing Local OCR for: ${file.originalname}...`);
        
        const ocrResult = await Tesseract.recognize(file.buffer, 'eng');
        const text = ocrResult.data.text; 
        
        console.log(`--- Raw Text Extracted --- \n ${text} \n-------------------`);

        // 🟢 फिक्स 2: .match() एरे के इंडेक्स पोजीशन [0] या [1] को सुरक्षित तरीके से निकालना

        // 1. भारतीय GSTIN (15 डिजिट फ़ॉर्मेट)
        const gstMatch = text.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/);
        if (gstMatch && gstMatch[0]) {
          extractedData.gstNumber = gstMatch[0]; // एरे का पहला मैचिंग स्ट्रिंग लें
        }

        // 2. इनवॉइस डेट (DD-MM-YYYY, DD/MM/YYYY, या DD Nov YYYY)
        // यह टेस्ट रसीद की "14 Nov 2023" या "11-07-2026" दोनों को स्मार्टली पकड़ लेगा
        const dateMatch = text.match(/(\d{1,2}[-\/\.\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{2})[-\/\.\s]\d{4})/i);
        if (dateMatch && dateMatch[0]) {
          extractedData.date = dateMatch[0];
        } else {
          // अगर ऊपर का एडवांस फेल हो तो बेसिक न्यूमेरिकल डेट ढूंढे
          const basicDate = text.match(/(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/);
          if (basicDate && basicDate[0]) extractedData.date = basicDate[0];
        }

        // 3. टोटल अमाउंट / ग्रैंड टोटल
        // यह 'Total' या 'Grand Total' के बाद आने वाले पैसे (डिजिट) को कैप्चर करेगा
        const amountMatch = text.match(/(?:total|amount|payable|grand\s?total)[:\s₹$]*([\d,]+\.\d{2}|[\d,]+)/i);
        if (amountMatch && amountMatch[1]) {
          extractedData.totalAmount = amountMatch[1].trim(); // ब्रैकेट () के अंदर का मैच हुआ शुद्ध नंबर लें
        }

      } catch (ocrError) {
        console.error(`Local OCR inside loop failed for ${file.originalname}:`, ocrError);
      }

      // C. स्टेटस कैलकुलेशन
      const status = (extractedData.totalAmount === "MISSING" || extractedData.date === "MISSING") ? "Action Required" : "Ready";

      // D. डेटाबेस में बिल्कुल सही वेरिएबल के साथ सेव करना
      const newReceipt = await Receipt.create({
        s3Url,         // 🟢 अब सही यूआरएल डेटाबेस में जाएगा
        public_id: fileKey, 
        ...extractedData,
        status
      });

      savedReceipts.push(newReceipt);
    }


    // 3. सभी जनरेटेड रिकॉर्ड्स की एरे (Array) फ्रंटेंड को रिस्पॉन्स में भेजें
    res.status(200).json({ success: true, data: savedReceipts });

  } catch (error) {
    console.error("Global Upload Error:", error);
    res.status(500).json({ success: false, message: "प्रोसेसिंग में एरर आया।" });
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const bufferToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType: mimeType
    },
  };
};

import { GoogleGenAI } from "@google/genai"; //



const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
import { GoogleGenerativeAI } from "@google/generative-ai";

const DynamicReceiptSchema = new mongoose.Schema({
  s3Url: { type: String, required: true },
  public_id: { type: String, required: true },
  clientName:{type: String, required: true},

  extractedData: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: "Action Required" }
}, { timestamps: true, strict: false });

const DynamicReceipt = mongoose.model('DynamicReceipt', DynamicReceiptSchema);








export const uploadDynamicReceipt = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided for upload." });
    }

    const { clientName } = req.body;
    if (!clientName) {
      return res.status(400).json({ success: false, message: "clientName field is required." });
    }

    const selectedFields = req.body.selectedFields ? JSON.parse(req.body.selectedFields) : ["Date", "Total"];
    const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    const savedDocs = [];

    const jsonProperties = {};
    selectedFields.forEach(field => {
      jsonProperties[field] = { type: "STRING" };
    });

    for (const file of req.files) {
      console.log(`Processing File: ${file.originalname}`);
      
      const fileKey = `receipts/${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}_${file.originalname}`;

      await s3.send(new PutObjectCommand({ 
        Bucket: bucketName, 
        Key: fileKey, 
        Body: file.buffer,
        ContentType: file.mimetype
      }));
      
      const s3Url = `https://${bucketName}://{fileKey}`;

      const prompt = `You are an expert accountant. Extract only these specific fields from the attached invoice image: ${selectedFields.join(", ")}. 
                      Return the output strictly as a single flat JSON object where the keys are the exact field names requested. 
                      If any field is completely missing or unreadable in the invoice image, set its value to "MISSING". 
                      Do not add any markdown block code or conversational text.`;

      console.log(`Sending image ${file.originalname} to Gemini API via @google/genai...`);

      let currentResponseText = "";
      let currentAiJSON = {};

      try {
        const aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash", 
          contents: [
            prompt,
            {
              inlineData: {
                data: file.buffer.toString("base64"),
                mimeType: file.mimetype
              }
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: jsonProperties,
              required: selectedFields
            }
          }
        });

        currentResponseText = aiResponse.text || "{}";

        if (currentResponseText.includes("```")) {
          currentResponseText = currentResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
        }
        currentAiJSON = JSON.parse(currentResponseText);

      } catch (geminiError) {
        console.error(`Gemini validation failed specifically for ${file.originalname}:`, geminiError);
        selectedFields.forEach(field => { currentAiJSON[field] = "MISSING"; });
      }

      if (!currentAiJSON || Object.keys(currentAiJSON).length === 0) {
        selectedFields.forEach(field => { currentAiJSON[field] = "MISSING"; });
      }

      const isDataMissing = Object.values(currentAiJSON).includes("MISSING");
      const status = isDataMissing ? "Action Required" : "Ready";

      const newDoc = await DynamicReceipt.create({
        s3Url,
        public_id: fileKey,
        clientName, 
        extractedData: currentAiJSON, 
        status
      });

      savedDocs.push(newDoc);
      console.log(`Successfully saved ${file.originalname} to DB.`);
    } 

    res.status(200).json({ success: true, data: savedDocs });

  } catch (error) {
    console.error("Global Multi-Upload Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during document processing." });
  }
};



// API Endpoint: Inline editing to dynamically update a specific field value inside extractedData object
export const updateDynamicField = async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldName, value } = req.body; // Expects field name key and the new input value string

    if (!fieldName) {
      return res.status(400).json({ success: false, message: "The parameter 'fieldName' is required." });
    }

    const doc = await DynamicReceipt.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Target document record not found." });
    }

    // Safely initialize extractedData if it does not exist as an object
    if (!doc.extractedData || typeof doc.extractedData !== 'object') {
      doc.extractedData = {};
    }

    // Dynamically set or overwrite the value inside Mongoose Mixed Type object
    doc.extractedData[fieldName] = value;
    
    // Automatically re-evaluate and switch system status badge rules
    const hasMissingValues = Object.values(doc.extractedData).includes("MISSING");
    doc.status = hasMissingValues ? "Action Required" : "Ready";

    // Explicitly notify Mongoose that the Mixed Type schema object has been modified before calling save
    doc.markModified('extractedData');
    await doc.save();

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error("Inline Update API Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during inline cell update modification." });
  }
};



// API Endpoint: Fetch documents filtered by clientName and a specific upload date
export const getReceiptsByClientAndDate = async (req, res) => {
  try {
    const { clientName, startDate, endDate } = req.query; // dates expected: YYYY-MM-DD

    if (!clientName) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'clientName' is required."
      });
    }

    // Build the dynamic query object
    let query = { clientName };

    // If either bound is provided, build a range filter on createdAt
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid 'startDate' format. Please use YYYY-MM-DD format."
          });
        }
        query.createdAt.$gte = start;
      }

      if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999Z`);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid 'endDate' format. Please use YYYY-MM-DD format."
          });
        }
        query.createdAt.$lte = end;
      }
    }

    // Fetch matching data from MongoDB sorted by newest records first
    const documents = await DynamicReceipt.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });

  } catch (error) {
    console.error("Fetch Receipts Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving filtered client records."
    });
  }
};















// import ExcelJS from 'exceljs';
// Adjust the schema import path according to your structure

// API Endpoint Route Handler: Matches GET /api/data/export-excel
export const exportToExcelLedger = async (req, res) => {
  try {
    const { clientName, startDate, endDate } = req.query;

    if (!clientName) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing parameter 'clientName'. Cannot compile spreadsheet report without explicit boundary." 
      });
    }

    // Build the dynamic retrieval parameters query matrix matching current workspace view
    let queryCriteria = { clientName };

    if (startDate || endDate) {
      queryCriteria.createdAt = {};
      if (startDate) {
        queryCriteria.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        queryCriteria.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    // Fetch the target filtered records from MongoDB collection
    const records = await DynamicReceipt.find(queryCriteria).sort({ createdAt: -1 });

    // Initialize an in-memory instance of ExcelJS Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${clientName.substring(0, 20)} Ledger`);

    // Define standard spreadsheet metadata column grids layout schemas 
    worksheet.columns = [
      { header: 'System Record ID', key: '_id', width: 26 },
      { header: 'Compliance Client Name', key: 'clientName', width: 22 },
      { header: 'Data Processing Status', key: 'status', width: 18 },
      { header: 'System Upload Date', key: 'createdAt', width: 24 },
      { header: 'Original Document S3 URL Link', key: 's3Url', width: 55 }
    ];

    // Collect all dynamic unstructured data field sub-keys present across all records
    // This maps changing JSON fields dynamically into neat separate Excel spreadsheet columns
    let dynamicFieldColumnsMap = new Set();
    records.forEach(rec => {
      if (rec.extractedData && typeof rec.extractedData === 'object') {
        Object.keys(rec.extractedData).forEach(key => {
          dynamicFieldColumnsMap.add(key);
        });
      }
    });

    // Append compiled dynamic sub-keys straight onto the Excel columns blueprint array
    dynamicFieldColumnsMap.forEach(fieldName => {
      worksheet.columns = [
        ...worksheet.columns,
        { header: fieldName, key: fieldName, width: 18 }
      ];
    });

    // Format headers layout styling grid row block manually for high contrast readability
    worksheet.getRow(1).font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' } // Professional Corporate Midnight Blue Color Accent
    };

    // Flatten data records inside the loop to align rows seamlessly 
    records.forEach(record => {
      const standardDateString = record.createdAt ? new Date(record.createdAt).toISOString().replace('T', ' ').substring(0, 19) : 'N/A';
      
      let baseRowObject = {
        _id: record._id.toString(),
        clientName: record.clientName,
        status: record.status,
        createdAt: standardDateString,
        s3Url: record.s3Url
      };

      // Inline dynamic key fields assignment unpacker
      if (record.extractedData && typeof record.extractedData === 'object') {
        Object.keys(record.extractedData).forEach(fieldName => {
          baseRowObject[fieldName] = record.extractedData[fieldName] || "";
        });
      }

      worksheet.addRow(baseRowObject);
    });

    // Terminate browser download payload streaming protocols configuration mappings
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Tax_Ledger_${encodeURIComponent(clientName)}.xlsx`);

    // Stream download file out directly to client buffer stream pipelines channel
    await workbook.xlsx.write(res);
    return res.end();

  } catch (error) {
    console.error("Spreadsheet serialization execution fault error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server processing failure occurred while formatting Excel document stream." 
    });
  }
};
