// upload.js
import multer from "multer";

export const multerUploader = multer({
  storage: multer.memoryStorage(), // files stored in memory buffer
  limits: { fileSize: 5 * 1024 * 1024 } // max 5MB
});
