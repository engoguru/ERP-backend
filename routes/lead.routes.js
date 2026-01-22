import express from "express";
import { leadSchemaJoi } from "../middlewares/lead.joiValidater.js";
import { leadCreate, leadDelete, leadUpdate, leadView, leadViewOne } from "../controllers/lead.controller.js";
import { authorization } from "../utils/authorization.js";


import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { generateUploadURL, s3 } from "../config/awsS3.js";
// import { s3, generateUploadURL } from "../../config/awsS3.js";
const leadRoute= express.Router();

// In-memory storage for direct S3 upload
const storage = multer.memoryStorage();
const multerUploader = multer({ storage });

const leadSchemaValidate=(req,res,next)=>{
    const {error}=leadSchemaJoi.validate(req.body,{
        abortEarly:true
    })

    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation failed!",
            errors: error.details.map(err => err.message)
        });
    }

    next();
}




// ---------------- S3 Upload Middleware ----------------
// const uploadFilesMiddleware = async (req, res, next) => {
//   try {
//     // If no file → skip S3
//     if (!req.file) {
//       return next();
//     }

//     const file = req.file;

//     const key = `leads/${req.body.employeeCode}/${Date.now()}-${file.originalname}`;

//     await s3.send(
//       new PutObjectCommand({
//         Bucket: "ngo-guru-bucket",
//         Key: key,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//       })
//     );

//     // 🔥 IMPORTANT:
//     // Replace messageContent with S3 key
//     req.body.messageContent = key;

//     next();
//   } catch (err) {
//     console.error("File upload error:", err);
//     return res.status(500).json({
//       message: "Failed to upload files",
//       error: err.message,
//     });
//   }
// };





// ---------------- Fields ----------------
// Correct fields for employee files
// const uploadFollowUpFile = multerUploader.single("messageFile");











leadRoute.post("/create", authorization,leadCreate);


leadRoute.get("/view",authorization,leadView);


leadRoute.get("/view/:id",authorization, leadViewOne);


leadRoute.put(
  "/update/:id",
  authorization,
 
  leadUpdate               // controller
);


leadRoute.delete("/delete/:id" ,leadDelete)







export default leadRoute;