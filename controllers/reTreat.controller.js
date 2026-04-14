
import { generateUploadURL } from "../config/awsS3.js";
import reTreatModel from "../models/reTreat.model.js";
import  { isValidObjectId } from "mongoose";
export const registerTreat = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      source,
      paidAmount = 0,
      totalAmount,
      service,
      docs,
      leadId,
      status = "Pending"
    } = req.body;

    // // Attach uploaded files if any
    // const docs = req.body.docs || [];

    // // Validation
    if (!name || !email || !contact || !source || !totalAmount || !service) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // // Check duplicate email/contact
  const existing = await reTreatModel.findOne({
  email: email,
  contact: contact,
  source: source
});
// console.log(req.user,"pp")
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User with this email or contact already exists"
      });
    }
    // console.log(req.body)
    // // Create record
    const newTreat = await reTreatModel.create({
      name,
      email,
      contact,
      source,
      paidAmount,
      totalAmount,
      service,
      status,
      docs, // store uploaded docs URLs / IDs
      leadId,
      createdBy_Id: req.user?.id,
      licenseId: req.user?.licenseId
    });
// console.log(newTreat)
    return res.status(201).json({
      success: true,
      message: "Retreat registered successfully",
      data: newTreat
    });

  } catch (error) {
    console.error("RegisterTreat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getAllTreats = async (req, res) => {
  try {
    const { page, itemsPerPage, search, status, service } = req.query;

    // if (!req.user?.licenseId) {
    //   return res.status(401).json({ success: false, message: "Unauthorized" });
    // }

    // const query = { licenseId: req.user.licenseId };
let query;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } }, 
        { email: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } }
      ];
    }

    if (status) query.status = status;
    if (service) query.service = { $in: service};

    const pageNum = parseInt(page) || 1;
    const limit = parseInt(itemsPerPage) || 10;
    const skip = (pageNum - 1) * limit;

    const data = await reTreatModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await reTreatModel.countDocuments(query);

    res.status(200).json({
      success: true,
      page: pageNum,
      itemsPerPage: limit,
      total,
      count: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getTreatById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Fetch retreat
    const data = await reTreatModel.findById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found",
      });
    }

    // Generate signed URLs for docs
    const docsWithUrls = await Promise.all(
      (data.docs || []).map(async (doc) => {
        const url=await generateUploadURL(doc.publicId)
        return {
          ...doc.toObject(),
          url,
        };
      })
    );

    // Return response with updated docs
    res.status(200).json({
      success: true,
      data: {
        ...data.toObject(),
        docs: docsWithUrls,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller: updateTreat.js
export const updateTreat = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID!"
      });
    }

    // Fetch existing retreat once
    const existing = await reTreatModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found"
      });
    }

    // Prepare updateData
    const updateData = { ...req.body };

    // -----------------------------
    // Handle feedback append
    // -----------------------------
    if (req.body.feedback) {
      try {
        const newFeedback = JSON.parse(req.body.feedback);
        updateData.feedback = [
          ...(Array.isArray(existing.feedback) ? existing.feedback : []),
          ...(Array.isArray(newFeedback) ? newFeedback : [newFeedback])
        ];
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid feedback format"
        });
      }
    }

    // -----------------------------
    // Handle docs append
    // -----------------------------
    if (req.files && req.files.docs && req.files.docs.length > 0) {
      const newDocs = req.body.docs || []; // uploadDocs2 middleware should set req.body.docs
      updateData.docs = [
        ...(Array.isArray(existing.docs) ? existing.docs : []),
        ...(Array.isArray(newDocs) ? newDocs : [newDocs])
      ];
    }

    // Remove any invalid docs (string instead of object)
    if (updateData.docs && typeof updateData.docs === "string") {
      delete updateData.docs;
    }

    // -----------------------------
    // Update in DB
    // -----------------------------
    const updated = await reTreatModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("UpdateTreat Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const deleteTreat = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await reTreatModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





export const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, action } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const treat = await reTreatModel.findById(id);

    if (!treat) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found"
      });
    }

    treat.feedback.push({
      message,
      action: action || "Pending",
      submittedBy: req.user?._id
    });

    await treat.save();

    res.status(200).json({
      success: true,
      message: "Feedback added",
      data: treat
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};