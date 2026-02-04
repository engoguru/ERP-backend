import companyModel from "../models/company.model.js";


import { PutObjectCommand } from "@aws-sdk/client-s3";

import { generateUploadURL, s3 } from "../config/awsS3.js";
import LicenseModel from "../models/license.model.js";



/**
 * Controller: Create a new company
 * Assumes:
 *   - req.body contains validated data
 *   - Uploaded files already injected with URL and public_Id
 */

export const companyCreate = async (req, res) => {
  try {
    // console.log(req.body,"jyoiregjh")
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


export const companyViewOne = async (req, res) => {
  try {
    const { licenseId } = req.user;

    if (!licenseId) {
      return res.status(400).json({ message: "License ID not found for user" });
    }

    const checkLicenseId = await LicenseModel.findById(licenseId);

    if (!checkLicenseId) {
      return res.status(404).json({ message: "License not found" });
    }

    const companyDetail = await companyModel.findOne({ gstNumber: checkLicenseId.gstNumber });

    if (!companyDetail) {
      return res.status(404).json({ message: "Company details not found" });
    }

    // Fix assignment issue
    const publicId = companyDetail.companyLogo?.public_Id;
    if (publicId) {
      companyDetail.companyLogo.url = await generateUploadURL(publicId);
    }

    return res.status(200).json({ data: companyDetail });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const companyViewAll = () => {
  try {

  } catch (error) {

  }
}
export const companyUpdate = () => {
  try {

  } catch (error) {

  }
}



export const companydelete = () => {
  try {

  } catch (error) {

  }
}


