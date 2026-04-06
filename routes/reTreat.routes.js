import express from "express";
const reTreatRoute = express.Router()
import { getAllTreats, getTreatById, registerTreat, updateTreat } from "../controllers/reTreat.controller.js"
import { authorization } from "../utils/authorization.js";
import multer from "multer";
import { generateUploadURL, s3 } from "../config/awsS3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
// Multer setup (memory storage for direct S3 upload)
const upload = multer({ storage: multer.memoryStorage() });
const uploadDocs = async (req, res,next) => {
//   console.log(req.files)
    try {

        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            })
        }
        const uploadFile = []
        for (const file of req.files.docs) {
            //    console.log(file)
            const key = `camp/${Date.now()}-${file.originalname}`
            const params = {
                Bucket: "ngo-guru-bucket",
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype

            }
            await s3.send(
                new PutObjectCommand(params)
            )
            const url = await generateUploadURL(key, file.mimetype)
            // console.log(url)
            uploadFile.push({
                url: url,
                publicId: key
            })
        }
        // console.log(uploadFile)
        req.body.docs = uploadFile


        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "File upload failed",
            error: error.message
        })
    }
}


reTreatRoute.post(
  "/create",
  upload.fields([{ name: "docs" }]), // multer middleware
  uploadDocs,                        // middleware
  registerTreat                       // final handler
);


reTreatRoute.get("/getAll",getAllTreats)

reTreatRoute.get("/get/:id",getTreatById)

reTreatRoute.put("/update/:id",updateTreat)

export default reTreatRoute  