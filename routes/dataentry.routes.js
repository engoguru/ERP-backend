import express from 'express';
import multer from 'multer';
import { exportToExcelLedger, getReceiptsByClientAndDate, updateDynamicField, uploadDynamicReceipt, uploadReceipt } from '../controllers/dataentry.controller.js';


const routerData = express.Router();


const upload = multer({ storage: multer.memoryStorage() });

routerData.post('/upload-receipt', upload.array('billImages', 10), uploadReceipt);
// router.post('/upload-receipt', upload.array('billImages', 10), uploadMultipleReceipts);
routerData.post('/upload-receipt2', upload.array('billImages', 10), uploadDynamicReceipt);


routerData.put("/update-dynamic/:id",updateDynamicField)

routerData.get("/data-view",getReceiptsByClientAndDate)


routerData.get("/excel",exportToExcelLedger)




export default routerData;
