// controllers/employees/payroll.controller.js
import mongoose, { isValidObjectId } from "mongoose";
import payrollModel from "../../models/employees/payroll.model.js";

// CREATE payroll

// import { calculatePayroll } from "../services/payroll.service.js";
import { calculatePayroll } from "../../services/payroll.service.js";

export const payrollCreate = async (req, res, next) => {
  try {
    const { employeeId, licenseId, month, year } = req.body;

    const existing = await payrollModel.findOne({
      employeeId,
      licenseId,
      month,
      year
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Payroll already generated"
      });
    }

    const payrollData = await calculatePayroll({
      employeeId,
      licenseId,
      month,
      year
    });

    const payroll = await payrollModel.create({
      employeeId,
      licenseId,
      month,
      year,
      ...payrollData
    });

    res.status(201).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE payroll
export const payrollUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid Payroll ID" });
    }

    const updatedPayroll = await payrollModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPayroll) {
      return res.status(404).json({ success: false, message: "Payroll not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      data: updatedPayroll
    });
  } catch (error) {
    next(error);
  }
};

// VIEW paginated payrolls
export const payrollView = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, licenseId, employeeId, paymentStatus } = req.query;

    const filter = {};
    if (licenseId && isValidObjectId(licenseId)) filter.licenseId = licenseId;
    if (employeeId && isValidObjectId(employeeId)) filter.employeeId = employeeId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const payrolls = await payrollModel
      .find(filter)
      .populate("employeeId", "name email")
      .populate("licenseId", "planName companyName")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ paymentDate: -1 });

    const total = await payrollModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: payrolls
    });
  } catch (error) {
    next(error);
  }
};

// VIEW single payroll
export const payrollViewOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid Payroll ID" });
    }

    const payroll = await payrollModel
      .findById(id)
      .populate("employeeId", "name email")
      .populate("licenseId", "planName companyName");

    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll not found" });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    next(error);
  }
};

// DELETE payroll
export const payrollDelete = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid Payroll ID" });
    }

    const deletedPayroll = await payrollModel.findByIdAndDelete(id);

    if (!deletedPayroll) {
      return res.status(404).json({ success: false, message: "Payroll not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payroll deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
