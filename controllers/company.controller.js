import companyModel from "../models/company.model.js";


import { PutObjectCommand } from "@aws-sdk/client-s3";

import { generateUploadURL,s3 } from "../config/awsS3.js";



/**
 * Controller: Create a new company
 * Assumes:
 *   - req.body contains validated data
 *   - Uploaded files already injected with URL and public_Id
 */
export const companyCreate = async (req, res) => {
  try {
    console.log(req.body,"jyoiregjh")
    // Simply save req.body to MongoDB
    const savedCompany = await companyModel.create(req.body);

    return res.status(201).json({
      message: "Company created successfully",
      company: savedCompany,
    });
  } catch (err) {
    console.error("Error creating company:", err);

    // Handle duplicate registrationNumber or other Mongoose errors if needed
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate entry detected",
        error: err.keyValue,
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


export const companyViewOne=()=>{
    try {
        
    } catch (error) {
        
    }
}
export const companyViewAll=()=>{
    try {
        
    } catch (error) {
        
    }
}
export const companyUpdate=()=>{
    try {
        
    } catch (error) {
        
    }
}


export const companydelete=()=>{
    try {
        
    } catch (error) {
        
    }
}