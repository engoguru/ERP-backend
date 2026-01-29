import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, generateUploadURL } from "../../config/awsS3.js";
import { createEmployee, loginEmployee, searchEmployeeByName, viewEmployee, viewOneEmployee } from "../../controllers/employees/employee.controller.js";
import { employeeSchemaJoi } from "../../middlewares/employees/employee.joivalidater.js";
import { authorization } from "../../utils/authorization.js";

const employeeRoute = express.Router();

// ---------------- Multer setup ----------------
// In-memory storage for direct S3 upload
const storage = multer.memoryStorage();
const multerUploader = multer({ storage });

// ---------------- Validation Middleware ----------------
const validate = (req, res, next) => {
  const { error } = employeeSchemaJoi.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, errors });
  }
  next();
};

// ---------------- S3 Upload Middleware ----------------
// const uploadFilesMiddleware = async (req, res, next) => {
//   try {

    
//     const files = req.files || {};
//     const fileKeys = {};

//     for (const fieldName of Object.keys(files)) {
//       const file = files[fieldName][0]; // only first file per field
//       const key = `employees/${req.body.employeeCode}/${Date.now()}-${file.originalname}`;

//       // Upload file to S3
//       await s3.send(
//         new PutObjectCommand({
//           Bucket: "ngo-guru-bucket",
//           Key: key,
//           Body: file.buffer,
//           ContentType: file.mimetype,
//         })
//       );

//       // Generate signed URL
//       const url = await generateUploadURL(key, file.mimetype);
//       // console.log(url, "fdhv")
//       fileKeys[fieldName] = { url, public_id: key };
//     }

//     // Attach file URLs to request body
//     // Merge uploaded files into existing req.body
//     req.body = { ...req.body, ...fileKeys };

//     // console.log(fileKeys, req.body, "gfhg")
//     next();
//   } catch (err) {
//     console.error("File upload error:", err);
//     return res.status(500).json({
//       message: "Failed to upload files",
//       error: err.message,
//     });
//   }
// };
const uploadFilesMiddleware = async (req, res, next) => {
  try {
    const files = req.files || {};
    const fileKeys = {};

    for (const fieldName of Object.keys(files)) {
      const uploadedFiles = files[fieldName]; // array of files

      // If only one file (profilePic)
      if (uploadedFiles.length === 1) {
        const file = uploadedFiles[0];
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

        fileKeys[fieldName] = {
          url,
          public_id: key
        };
      } 
      // If multiple files (pan, aadhar)
      else {
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

          fileKeys[fieldName].push({
            url,
            public_id: key
          });
        }
      }
    }

    // Merge uploaded files into req.body
    req.body = { ...req.body, ...fileKeys };

    next();
  } catch (err) {
    console.error("File upload error:", err);
    return res.status(500).json({
      message: "Failed to upload files",
      error: err.message,
    });
  }
};


// ---------------- Fields ----------------
// Correct fields for employee files
const uploadFields = multerUploader.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "pan", maxCount: 5 },      // array
  { name: "aadhar", maxCount: 5 },   // array
]);




// ---------------- Route ----------------
employeeRoute.post(
  "/create",
  validate,           // Validate input first
  uploadFields,       // Parse multipart/form-data
  uploadFilesMiddleware, // Upload files to S3 and attach URLs
  createEmployee      // Controller saves employee
);


employeeRoute.get("/reportingManager", searchEmployeeByName)

employeeRoute.get("/view",authorization,  viewEmployee);

employeeRoute.get("/view/:id", viewOneEmployee)


employeeRoute.post("/login",loginEmployee)


employeeRoute.get("/get",authorization, (req, res) => {
 
  try {
    // req.user contains decoded info from JWT
    const user = req.user;
// console.log(user)
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data:user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

employeeRoute.post("/logout", authorization, (req, res) => {
  try {
    res.clearCookie("companyKey_keys", {
      httpOnly: true,
      sameSite: "strict"
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message
    });
  }
});



export default employeeRoute;
