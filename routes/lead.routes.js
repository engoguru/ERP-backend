import express from "express";
import { leadSchemaJoi } from "../middlewares/lead.joiValidater.js";
import { bulkLeadAssign, leadCreate, leadCreateInside, leadDashboard, leadDelete, leadRecord,  leadUpdate, leadView, leadViewOne, metaLeadStore, updateConfirmedService, verifyMeta } from "../controllers/lead.controller.js";
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
// console.log(req.body,req.files)
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


leadRoute.post("  ", leadCreate);
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

// dashbaaort daataa showing
leadRoute.get("/dashboardData", authorization, leadDashboard)


// for asssign leads
leadRoute.post("/assign",authorization,bulkLeadAssign)

// facebook
leadRoute.get("/webhook/meta",verifyMeta)
leadRoute.post("/webhook/meta",metaLeadStore)
// facebook

leadRoute.get("/report/:id",authorization,leadRecord)



// Multer setup (memory storage for direct S3 upload)
const upload = multer({ storage: multer.memoryStorage() });



// Middleware to upload files to S3
export const uploadFileService = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(); // no files to upload
    }

    const uploadedFiles = [];

    // Loop through each uploaded file
    for (const file of req.files) {
      const key = `confirmed-services/${Date.now()}-${file.originalname}`; // generic folder

      // Upload the file buffer directly to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: "ngo-guru-bucket",
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      // Generate signed URL
      const url = await generateUploadURL(key, file.mimetype);

      uploadedFiles.push({
        url,
        public_id: key,
      });
    }

    // Attach uploaded files to req.body.newFiles for controller
    req.body.newFiles = uploadedFiles;

    next();
  } catch (err) {
    console.error("File upload error:", err);
    return res.status(500).json({
      message: "Failed to upload files",
      error: err.message,
    });
  }
};

// Route to update a confirmed service (paid/unpaid + files)
leadRoute.put(
  "/confirmed/:leadId/:serviceId",
  upload.array("files"), // Multer parses multipart/form-data
  uploadFileService,     // Upload to S3
  updateConfirmedService // Update DB
);



export default leadRoute;