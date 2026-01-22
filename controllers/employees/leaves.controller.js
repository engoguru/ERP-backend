import mongoose, { isValidObjectId } from "mongoose";
import leavesModel from "../../models/employees/leaves.model.js";

export const leavesCreate = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty!" });
    }

    const leave = await leavesModel.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Leave request placed successfully!",
      data: leave
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate leave request" });
    }
    next(error);
  }
};


export const leavesUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Leave ID" });
    }

    const updatedLeave = await leavesModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      data: updatedLeave
    });
  } catch (error) {
    next(error);
  }
};



export const leavesViewOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Leave ID" });
    }

    const leave = await leavesModel
      .findById(id)
      .populate("employeeId", "name email")
      .populate("approvedBy", "name email")
      .populate("licenseId");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    return res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};


export const leavesView = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      licenseId,
      employeeId,
      status
    } = req.query;

    const filter = {};

    if (licenseId && isValidObjectId(licenseId)) {
      filter.licenseId = licenseId;
    }

    if (employeeId && isValidObjectId(employeeId)) {
      filter.employeeId = employeeId;
    }

    if (status) {
      filter.status = status;
    }

    const leaves = await leavesModel
      .find(filter)
      .populate("employeeId", "name email")
      .populate("approvedBy", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await leavesModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};



export const leavesDelete = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Leave ID" });
    }

    const deletedLeave = await leavesModel.findByIdAndDelete(id);

    if (!deletedLeave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Leave deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
