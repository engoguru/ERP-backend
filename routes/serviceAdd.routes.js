import express from "express";
import { createService, getAllService, getOneService, updateService } from "../controllers/serviceAdd.controller.js";
const serviceAddRoute = express.Router()
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { generateUploadURL, s3 } from "../config/awsS3.js";
import { authorization } from "../utils/authorization.js";
const upload = multer({ storage: multer.memoryStorage() })


const uploadDocs = async (req, res, next) => {

    try {

        if (req?.files?.docs?.length > 0) {


            const uploadFile = []
            for (const file of req.files.docs) {
                const key = `service/${Date.now()}-${file.originalname}`
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
                uploadFile.push({
                    url: url,
                    publicId: key
                })
            }

            req.body.docs = uploadFile

        }
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


serviceAddRoute.post("/create/:id", authorization, upload.fields([{ name: "docs" }]), uploadDocs, createService)

serviceAddRoute.get("/getOne/:id", authorization, getOneService)

serviceAddRoute.get("/getAll/:id", authorization, getAllService)

serviceAddRoute.put("/update/:id",authorization, upload.fields([{ name: "docs" }]), uploadDocs,updateService)


export default serviceAddRoute; 