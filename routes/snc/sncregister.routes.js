import express from "express";
import { allSncEligible, sncRegister, sncUpdate, sncViewAll, sncviewAllId, sncViewOne } from "../../controllers/snc/sncregister.controller.js";
import multer from "multer";
import { PutBucketAbacCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { generateUploadURL,s3 } from "../../config/awsS3.js";
import { authorization } from "../../utils/authorization.js";
const sncregisterRouter = express.Router()
const upload = multer({ Storage: multer.memoryStorage() })


const uploadDocs = async(req,res,next) => {
 try {
    if (req.files && req.files.docs && req.files.docs.length > 0) {
      const uploadedFiles = [];

      for (const file of req.files.docs) {
        const key = `service/${Date.now()}-${file.originalname}`;
        const params = {
          Bucket: "ngo-guru-bucket",
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype
        };

        await s3.send(new PutObjectCommand(params));
        const url = await generateUploadURL(key, file.mimetype);

        uploadedFiles.push({ url, public_id: key });
      }

      // Attach uploaded files to body for controller
      req.body.docs = uploadedFiles;
    }

    next();
  } catch (error) {
    console.error("UploadDocs Error:", error);
    return res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message
    });
  }
}


sncregisterRouter.post("/register",authorization, upload.fields([{ name: "docs" }]),uploadDocs , sncRegister)
sncregisterRouter.get("/allEligible",authorization,allSncEligible)
sncregisterRouter.get("/sncId",sncviewAllId)

sncregisterRouter.get("/viewOne/:id",authorization, sncViewOne)

sncregisterRouter.put("/update/:id",authorization,upload.fields([{name: "docs"}]), uploadDocs,   sncUpdate) 


export default sncregisterRouter