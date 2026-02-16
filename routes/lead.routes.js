import express from "express";
import { leadSchemaJoi } from "../middlewares/lead.joiValidater.js";
import { leadCreate, leadCreateInside, leadDashboard, leadDelete, leadUpdate, leadView, leadViewOne } from "../controllers/lead.controller.js";
import { authorization } from "../utils/authorization.js";


import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { generateUploadURL, s3 } from "../config/awsS3.js";
// import { s3, generateUploadURL } from "../../config/awsS3.js";
const leadRoute = express.Router();

// In-memory storage for direct S3 upload
const storage = multer.memoryStorage();
const multerUploader = multer({ storage });

const leadSchemaValidate = (req, res, next) => {
    const { error } = leadSchemaJoi.validate(req.body, {
        abortEarly: true
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









// ---------------- Fields ----------------
// Correct fields for employee files
// const uploadFollowUpFile = multerUploader.single("messageFile");




const uploadFilesMiddleware = async (req, res, next) => {
    try {

        const files = req.files || {};
        const fileKeys = {};

        for (const fieldName of Object.keys(files)) {
            const uploadedFiles = files[fieldName]; // array of files

            fileKeys[fieldName] = [];

            for (const file of uploadedFiles) {
                const key = `employees/${req.body.employeeCode}/${Date.now()}-${file.originalname}`;

                await s3.send(
                    new PutObjectCommand({
                        Bucket: "ngo-guru-bucket",
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    })
                );

                const url = await generateUploadURL(key, file.mimetype);
                // console.log(url, "pp")

                fileKeys[fieldName].push({
                    url,
                    public_id: key
                });
            }

        }

     // Merge uploaded files into req.body.OnConfirmed
    req.body.OnConfirmed = req.body.OnConfirmed || {};
    
    for (const key of Object.keys(fileKeys)) {
      // If the field already exists, append, otherwise assign
      req.body.OnConfirmed[key] = [
        ...(req.body.OnConfirmed[key] || []),
        ...fileKeys[key],
      ];
    }

        next();
    } catch (err) {
        console.error("File upload error:", err);
        return res.status(500).json({
            message: "Failed to upload files",
            error: err.message,
        });
    }
};




const uploadFields = multerUploader.fields([
    { name: "OnConfirmedFiles", maxCount: 10 },

]);


leadRoute.post("/create", leadCreate);
leadRoute.post("/createInside", authorization, leadCreateInside);

leadRoute.get("/view", authorization, leadView);


leadRoute.get("/view/:id", authorization, leadViewOne);


// leadRoute.put(
//   "/update/:id",
// authorization,

//   leadUpdate               // controller
// );
leadRoute.put(
    "/update/:id",
    authorization,
    uploadFields,
    uploadFilesMiddleware,
    leadUpdate               // controller
);


leadRoute.delete("/delete/:id", leadDelete)


leadRoute.get("/dashboardData", authorization, leadDashboard)







export default leadRoute;