import express from "express"
const sncServiceRouter = express.Router()
import { authorization } from "../../utils/authorization.js"
import { sncServiceCreate, sncServiceOneUpdate, sncServiceViewAllByUser, sncServiceViewOne, sncUserDetail } from "../../controllers/snc/sncservice.controller.js"
import multer from "multer"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { generateUploadURL, s3 } from "../../config/awsS3.js"

const upload = multer({ storage: multer.memoryStorage() })

const uploadDocs = async(req, res, next) => {
    try {
        // console.log(req.files)
        if (req.files && req.files.docs && req.files.docs.length > 0) {
            const uploadedFiles = []
            for (const file of req.files.docs) {
                const key = `service/${Date.now()}-${file.originalname}`
                const params = {
                    Bucket: "ngo-guru-bucket",
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype
                }

                await s3.send(new PutObjectCommand(params))
                const url = await generateUploadURL(key, file.mimetype)
                uploadedFiles.push({ url, public_id: key })
            }
            req.body.docs = uploadedFiles
    
        }
               next() 
    } catch (error) {
        console.log(error)
    }
}





sncServiceRouter.post(
  "/create/:id",
  authorization,
  upload.fields([{ name: "docs", maxCount: 10 }]), 
  uploadDocs,
  sncServiceCreate
);

sncServiceRouter.get("/sncUser/:id",authorization,sncUserDetail)

sncServiceRouter.get("/snc/userService/:id",authorization,sncServiceViewAllByUser)

sncServiceRouter.get("/viewOne/:id",authorization,sncServiceViewOne)

sncServiceRouter.put("/updateService/:id",  authorization,  upload.fields([{ name: "docs", maxCount: 10 }]), 
  uploadDocs,
 sncServiceOneUpdate)

export default sncServiceRouter