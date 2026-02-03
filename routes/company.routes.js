import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, generateUploadURL } from "../config/awsS3.js"; // S3 client + signed URL function
import { companyCreate } from "../controllers/company.controller.js";
// import { companyConfigureSchemaJoi } from "../middlewares/company.joiValidater.js";
import { companySchemaJoi } from "../middlewares/company.joiValidater.js";
import { authorization } from "../utils/authorization.js";
import { userDashboard } from "../controllers/employees/employee.controller.js";

const companyRoutes = express.Router();

// ---------------- Multer setup ----------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: "companyLogo", maxCount: 1 },
  { name: "panCard", maxCount: 10 },
]);

// ---------------- Middleware for S3 upload ----------------
const uploadFilesMiddleware = async (req, res, next) => {
  try {
    const files = req.files || {};

    // Parse branches JSON if sent as string
    if (req.body.companyBranch) {
      try {
        req.body.companyBranch = JSON.parse(req.body.companyBranch);
      } catch (err) {
        return res.status(400).json({ message: "Invalid companyBranch JSON" });
      }
    }

    // ----- Company Logo -----
    if (files.companyLogo && files.companyLogo[0]) {
      const file = files.companyLogo[0];
      const key = `company/logo/${Date.now()}-${file.originalname}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: "ngo-guru-bucket",
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      const url = await generateUploadURL(key, file.mimetype);
      req.body.companyLogo = { url, public_Id: key };
      // console.log("Company Logo uploaded:", url);
    } else {
      req.body.companyLogo = null;
    }

    // ----- PAN Cards -----
    if (files.panCard && files.panCard.length > 0) {
      req.body.panCard = await Promise.all(
        files.panCard.map(async (file) => {
          const key = `company/pan/${Date.now()}-${file.originalname}`;

          await s3.send(
            new PutObjectCommand({
              Bucket: "ngo-guru-bucket",
              Key: key,
              Body: file.buffer,
              ContentType: file.mimetype,
            })
          );

          const url = await generateUploadURL(key, file.mimetype);
          console.log("PAN Card uploaded:", url);
          return { url, public_Id: key };
        })
      );
    } else {
      req.body.panCard = [];
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

// ---------------- Validation Middleware ----------------
const companyValidate = (req, res, next) => {
  const { error } = companySchemaJoi.validate(req.body, {
    abortEarly: true,
  });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed!",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

// ---------------- Route ----------------
companyRoutes.post(
  "/create",
  uploadFields,
  uploadFilesMiddleware,
  companyValidate,
  companyCreate
);




export default companyRoutes;
