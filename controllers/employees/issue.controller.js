import mongoose from "mongoose";
import issueModel from "../../models/employees/issue.model.js";
// import Issue from "../models/issue.model.js";

/* ================= CREATE ISSUE ================= */
export const createIssue = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id: employeeId, licenseId } = req.user;

    if (!licenseId || !title || !description) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const issue = await issueModel.create({
      licenseId: licenseId,
      title,
      description,
      submittedBy: employeeId,
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET ALL ISSUES ================= */
export const getAllIssues = async (req, res, next) => {
  try {
    const issues = await issueModel.find()
      .populate("licenseId", "name")
      .populate("submittedBy", "name")
      .populate("resolveBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET SINGLE ISSUE ================= */
export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Issue ID" });
    }

    const issue = await issueModel.findById(id)
      .populate("submittedBy", "name")
      .populate("resolveBy", "name");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE ISSUE ================= */
export const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const { id: resolveBy } = req.user;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Issue ID" });
    }

    const issue = await issueModel.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(resolveBy && { resolveBy }),
        ...(status && { status })
      },
      { new: true, runValidators: true }
    );

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= DELETE ISSUE ================= */
export const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Issue ID" });
    }

    const issue = await issueModel.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
