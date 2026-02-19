import companyConfigureModel from "../models/companyConfigure.model.js";
import EmployeeModel from "../models/employees/employee.model.js";

import mongoose from "mongoose";

export const companyConfigureCreate = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Request body cannot be empty");
      error.statusCode = 400;
      return next(error);
    }

    const { role, employeeCode } = req.user;
    if (role !== "Admin") {
      const error = new Error("not allowed");
      error.statusCode = 400;
      return next(error);
    }

    const licenseData = await EmployeeModel
      .findOne({ employeeCode })
      .populate("licenseId", "licenseId _id");

    // attach licenseId to body (syntax fix)
    req.body = {
      ...req.body,
      licenseId: licenseData.licenseId._id,
    };

    // Check if config already exists for this license (syntax fix)
    const existing = await companyConfigureModel.findOne({
      licenseId: licenseData.licenseId._id,
    });

    if (existing) {
      const error = new Error("Configuration for this company already exists");
      error.statusCode = 409;
      return next(error);
    }

    const newConfig = await companyConfigureModel.create(req.body);

    return res.status(201).json({
      success: true,
      data: newConfig,
    });

  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "Duplicate configuration for this company";
    }
    return next(error);
  }
};


export const companyConfigureUpdate = async (req, res, next) => {
  try {
    // console.log(req.body)
    const { role, employeeCode } = req.user;

    if (role !== "Admin") {
      const error = new Error("Not allowed");
      error.statusCode = 403;
      return next(error);
    }

    if (req.body.licenseId) {
      const error = new Error("Cannot update licenseId field");
      error.statusCode = 400;
      return next(error);
    }

    const licenseData = await EmployeeModel
      .findOne({ employeeCode })
      .populate("licenseId", "licenseId _id");

    if (!licenseData || !licenseData.licenseId) {
      const error = new Error("License not found");
      error.statusCode = 404;
      return next(error);
    }


    const filter = { licenseId: licenseData.licenseId._id };

    // Fetch existing config
    const existingConfig = await companyConfigureModel.findOne(filter);

    if (!existingConfig) {
      const error = new Error("Configuration not found");
      error.statusCode = 404;
      return next(error);
    }

    let incomingRoles = [];

    if (Array.isArray(req.body.roles)) {
      incomingRoles = req.body.roles.slice(1); // skip Admin
    }

    incomingRoles.forEach((incomingDept) => {
      const existingDept = existingConfig.roles.find(
        (r) => r.department === incomingDept.department
      );

      if (existingDept) {
        // Add only new roles
        incomingDept.roles.forEach((role) => {
          if (!existingDept.roles.includes(role)) {
            existingDept.roles.push(role);
          }
        });
      } else {
        // Department does not exist → add whole object
        existingConfig.roles.push({
          department: incomingDept.department,
          roles: incomingDept.roles,
          _id: incomingDept._id || new mongoose.Types.ObjectId()
        });
      }
    });


    // Merge permissions (push new ones)
    // const incomingPermissions = req.body.permissions || [];

    // incomingPermissions.forEach((incomingPerm) => {
    //   const existingPerm = existingConfig.permissions.find(
    //     (p) =>
    //       p.department === incomingPerm.department &&
    //       p.roleName === incomingPerm.roleName
    //   );

    //   if (existingPerm) {
    //     // Add only new permissions
    //     incomingPerm.permission.forEach((perm) => {
    //       // if (!existingPerm.permission.includes(perm)) {
    //         existingPerm.permission.push(perm);
    //       // }
    //     });
    //   } else {
    //     // New role permission
    //     existingConfig.permissions.push({
    //       department: incomingPerm.department,
    //       roleName: incomingPerm.roleName,
    //       permission: incomingPerm.permission,
    //       _id: incomingPerm._id || new mongoose.Types.ObjectId()
    //     });
    //   }
    // });

    // Incoming permissions from request
    const incomingPermissions = req.body.permissions || [];

    // Replace existing permissions with incoming ones
    incomingPermissions.forEach((incomingPerm) => {
      const existingIndex = existingConfig.permissions.findIndex(
        (p) =>
          p.department === incomingPerm.department &&
          p.roleName === incomingPerm.roleName
      );

      if (existingIndex !== -1) {
        // Overwrite the permissions array completely
        existingConfig.permissions[existingIndex].permission = incomingPerm.permission;
      } else {
        // Add new role permission
        existingConfig.permissions.push({
          department: incomingPerm.department,
          roleName: incomingPerm.roleName,
          permission: incomingPerm.permission,
          _id: incomingPerm._id || new mongoose.Types.ObjectId(),
        });
      }
    });


    if (req.body.leadForm) {
      existingConfig.leadForm = req.body.leadForm
    }
    // const incomingPermissions = req.body.permissions || [];

    // // Combine without duplicates (optional behavior)
    // const mergedPermissions = [
    //   ...existingConfig.permissions,
    //   ...incomingPermissions
    // ];

    // const updatedConfig = await companyConfigureModel.findOneAndUpdate(
    //   filter,
    //   {
    //     ...req.body,
    //     permissions: mergedPermissions
    //   },
    //   {
    //     new: true,
    //     runValidators: true
    //   }
    // );

    // if (!updatedConfig) {
    //   const error = new Error("Configuration not found");
    //   error.statusCode = 404;
    //   return next(error);
    // }

    // return res.status(200).json({
    //   success: true,
    //   data: updatedConfig
    // });
    await existingConfig.save();

    return res.status(200).json({
      success: true,
      data: existingConfig
    });

  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "Duplicate configuration field conflict";
    }
    return next(error);
  }
};



export const companyConfigureViewOne = async (req, res, next) => {
  try {
    const { role, employeeCode } = req.user;

    // if (role !== "Admin") {
    //   const error = new Error("not allowed");
    //   error.statusCode = 400;
    //   return next(error);
    // }

    const licenseData = await EmployeeModel
      .findOne({ employeeCode })
      .populate("licenseId", "licenseId _id");
    // console.log(licenseData,"pp")

    if (!licenseData || !licenseData.licenseId) {
      const error = new Error("License not found");
      error.statusCode = 404;
      return next(error);
    }

    const config = await companyConfigureModel
      .findOne({ licenseId: licenseData.licenseId._id })
      .lean()
      .exec();

    if (!config) {
      const error = new Error("Configuration not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      data: config,
    });

  } catch (error) {
    return next(error);
  }
};


export const companyConfigureViewAll = async (req, res, next) => {
  try {
    const { page = 1, itemsPerPage = 50, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(itemsPerPage);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (search) {
      // simple text search over roles or perms
      filter.$or = [
        { "leadForm.fieldKey": { $regex: search, $options: "i" } },
        { "permissions.department": { $regex: search, $options: "i" } },
        { "permissions.roleName": { $regex: search, $options: "i" } }
      ];
    }

    const total = await companyConfigureModel.countDocuments(filter);

    const data = await companyConfigureModel
      .find(filter)
      .skip(skip)
      .limit(limitNum)
      .populate("licenseId")
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      page: pageNum,
      itemsPerPage: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: data
    });

  } catch (error) {
    return next(error);
  }
};


export const companyConfigureViewByLicense = async (req, res, next) => {
  try {
    const { licenseId } = req.params;

    const config = await companyConfigureModel
      .findOne({ license: licenseId })
      .populate("license")
      .lean()
      .exec();

    if (!config) {
      const error = new Error("Configuration not found for this license");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      data: config
    });

  } catch (error) {
    return next(error);
  }
};

export const companyConfigureDelete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await companyConfigureModel.findByIdAndDelete(id);

    if (!deleted) {
      const error = new Error("Configuration not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: "Configuration deleted successfully"
    });

  } catch (error) {
    return next(error);
  }
};
