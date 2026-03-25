
import dotenv from "dotenv";
dotenv.config();

import { generateUploadURL } from "../config/awsS3.js";
import companyConfigureModel from "../models/companyConfigure.model.js";
import EmployeeModel from "../models/employees/employee.model.js";
import leadModel from "../models/lead.model.js";
import mongoose from "mongoose";



// export const leadCreateInside = async (req, res, next) => {
//   try {
//     if (!req.body || Object.keys(req.body).length === 0) {
//       const error = new Error("Request body cannot be empty");
//       error.statusCode = 400;
//       return next(error);
//     }

// // here i ant to check not duplicate number enter and check last 10 only nit include +91 

//     // Simply save fields key=>value directly
//     const newLead = await leadModel.create({
//       licenseId: req.user.licenseId,
//       fields: req.body,
//       source: "Portal"
//     });

//     return res.status(201).json({
//       success: true,
//       data: newLead
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// export const leadCreateInside = async (req, res, next) => {
//   try {
//     if (!req.body || Object.keys(req.body).length === 0) {
//       const error = new Error("Request body cannot be empty");
//       error.statusCode = 400;
//       return next(error);
//     }

//     // Extract phone number from request body
//     const phone = req.body.Contact; // adjust key if your number is under a different field
//     if (!phone) {
//       const error = new Error("Phone number is required");
//       error.statusCode = 400;
//       return next(error);
//     }

//     // Take last 10 digits only
//     const last10 = phone.replace(/\D/g, "").slice(-10); // removes non-digit chars

//     // Check for duplicate in the DB
//     const existingLead = await leadModel.findOne({
//       "fields.Contact": { $regex: `${last10}$` } // match last 10 digits
//     });

//     if (existingLead) {
//       const error = new Error("Phone number already exists");
//       error.statusCode = 400;
//       return next(error);
//     }

//     // Save new lead
//     const newLead = await leadModel.create({
//       licenseId: req.user.licenseId,
//       fields: req.body,
//       source: "Portal"
//     });

//     return res.status(201).json({
//       success: true,
//       data: newLead
//     });
//   } catch (error) {
//     return next(error);
//   }
// };
export const leadCreateInside = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Request body cannot be empty");
      error.statusCode = 400;
      return next(error);
    }

    // Extract phone number from request body
    const phone = req.body.Contact;
    if (!phone) {
      const error = new Error("Phone number is required");
      error.statusCode = 400;
      return next(error);
    }

    // Take last 10 digits only
    const last10 = phone.replace(/\D/g, "").slice(-10);

    // Check for duplicate in the DB
    const existingLead = await leadModel.findOne({
      "fields.Contact": { $regex: `${last10}$` } // match last 10 digits
    });

    if (existingLead) {
      const error = new Error("Phone number already exists");
      error.statusCode = 400;
      return next(error);
    }

    // Make source dynamic (default to 'Portal' if not provided)
    const source = req.body.source || "Portal";

    // Save new lead
    const newLead = await leadModel.create({
      licenseId: req.user.licenseId,
      fields: req.body,
      source: source
    });

    return res.status(201).json({
      success: true,
      data: newLead
    });
  } catch (error) {
    return next(error);
  }
};


export const leadCreate = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Request body cannot be empty");
      error.statusCode = 400;
      return next(error);
    }

    // const { employeeCode } = req.user;0

    // const licenseData = await EmployeeModel
    //   .findOne({ employeeCode })
    //   .populate("licenseId", "_id")
    //   .lean();
    // console.log(req.body)
    if (!req.body.licenseId) {
      const error = new Error("License not found");
      return next(error);
    }

    const id = req.body.licenseId;
    const checkLicense = await LicenseModel.findOne({
      licenseId: id
    })
    // console.log(checkLicense,"popo")

    // Simply save fields key=>value directly
    const newLead = await leadModel.create({
      licenseId: checkLicense?._id,
      fields: req.body.fields,
      source: "Website"
    });

    return res.status(201).json({
      success: true,
      data: newLead
    });
  } catch (error) {
    return next(error);
  }
};

// export const leadUpdate = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       const error = new Error("Lead ID is required");
//       error.statusCode = 400;
//       return next(error);
//     }

//     // Build update object — update fields dynamically
//     const updateData = req.body;

//     const updatedLead = await leadModel.findOneAndUpdate(
//       { _id: id },      // filter by licenseId
//       { $set: updateData },   // merge fields instead of overwriting
//       {
//         new: true,            // return updated document
//         runValidators: true   // enforce schema validators
//       }
//     );

//     if (!updatedLead) {
//       const error = new Error("Lead not found");
//       error.statusCode = 404;
//       return next(error);
//     }

//     return res.status(200).json({
//       success: true,
//       data: updatedLead
//     });
//   } catch (error) {
//     return next(error);
//   }
// };


// export const leadView = async (req, res, next) => {
//   try {
//     console.log(req.query.searchItem)
//     const page = parseInt(req.query.page) || 1;
//     const itemsPerPage = parseInt(req.query.itemsPerPage) || 50;
//     const skip = (page - 1) * itemsPerPage;

//     const { employeeCode, id: employeeId, role,licenseId } = req.user;


//     // Base query
//     let query = { licenseId };

//     // Role-based filtering
//     const unrestrictedRoles = ["Admin", "Digital Marketer"];

//     if (!unrestrictedRoles.includes(role)) {
//       query.whoAssignedwho = {
//         $elemMatch: { assignedTo: employeeId }
//       };
//     }


//     const total = await leadModel.countDocuments(query);

//     const leads = await leadModel
//       .find(query)
//       .skip(skip)
//       .limit(itemsPerPage)
//       .lean();

//     // console.log(leads,"ppp")
//     return res.status(200).json({
//       success: true,
//       page,
//       itemsPerPage,
//       total,
//       totalPages: Math.ceil(total / itemsPerPage),
//       data: leads
//     });

//   } catch (error) {
//     return next(error);
//   }
// };
// export const leadView = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
//     const skip = (page - 1) * itemsPerPage;

//     const { search, status, date, assigned } = req.query;
//     const { id: employeeId, role, licenseId } = req.user;
//     // console.log(assigned, "pp")
//     let query = { licenseId };

//     // ---------------- ROLE FILTER ----------------
//     const unrestrictedRoles = ["Admin", "Digital Marketer"];

//     if (!unrestrictedRoles.includes(role)) {
//       query.whoAssignedwho = {
//         $elemMatch: { assignedTo: employeeId }
//       };
//     }

//     // ---------------- SEARCH (FIXED) ----------------
//     if (search) {
//       const searchRegex = new RegExp(search, "i");

//       query.$or = [
//         { "fields.Name": searchRegex },
//         { "fields.Email": searchRegex },
//         { "fields.Contact": searchRegex },
//         { "fields.description": searchRegex },
//         { "fields.status": searchRegex },
//         { source: searchRegex }
//       ];
//     }

//     // ---------------- STATUS FILTER ----------------
//     if (status) {
//       query["fields.status"] = status;
//     }
//     if (assigned === "assigned") {
//       query.whoAssignedwho = { $exists: true, $ne: [] };
//     }

//     if (assigned === "unassigned") {
//       query.$or = [
//         { whoAssignedwho: { $exists: false } },
//         { whoAssignedwho: { $size: 0 } }
//       ];
//     }

//     // ---------------- DATE FILTER ----------------
//     if (date) {
//       const start = new Date(date);
//       const end = new Date(date);
//       end.setHours(23, 59, 59, 999);

//       query.createdAt = {
//         $gte: start,
//         $lte: end
//       };
//     }

//     const total = await leadModel.countDocuments(query);

//     const leads = await leadModel
//       .find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(itemsPerPage)
//       .lean();

//     return res.status(200).json({
//       success: true,
//       page,
//       itemsPerPage,
//       total,
//       totalPages: Math.ceil(total / itemsPerPage),
//       data: leads
//     });

//   } catch (error) {
//     return next(error);
//   }
// };
export const leadView = async (req, res, next) => {
  try {
    // ---------------- PAGINATION ----------------
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 100;
    const skip = (page - 1) * itemsPerPage;

    const { search, status, date, assigned, source } = req.query;
    const { id: employeeId, role, licenseId, roleID, permissionArray, department } = req.user;
    //  console.log(source)
    const query = { licenseId };
    const andConditions = [];

    // ---------------- PERMISSION-BASED FILTER ----------------

    if (permissionArray.includes("ldconverter")) {
      andConditions.push({
        "fields.status": { $nin: ["Dump"] }
      });
    }
    else if (permissionArray.includes("ldassign")) {
      andConditions.push({
        $or: [
          { whoAssignedwho: { $exists: false } },
          { whoAssignedwho: { $size: 0 } },
          { "fields.status": "Dump" },
        ],
      });
    }
    else if (permissionArray.includes("ldprocessor")) {
      andConditions.push({ "fields.status": "Confirmed" });
    }
    else if (/Manager/i.test(role.trim())) {
      andConditions.push({
        $or: [
          // { roleID },
          {
            whoAssignedwho: {
              $elemMatch: { assignedTo: employeeId }
            }
          }
        ]
      });
    }

    if (department !== "Admin" && !permissionArray.includes("ldassign") && !permissionArray.includes("ldprocessor")
      && !/Manager/i.test(role.trim())) {
      andConditions.push({ roleID });
    }
    // ---------------- SEARCH FILTER ----------------
    if (search) {
      // Escape special regex characters
      const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapeRegex(search), "i");

      andConditions.push({
        $or: [
          { "fields.Name": searchRegex },
          { "fields.Email": searchRegex },
          { "fields.Contact": searchRegex },
          { "fields.description": searchRegex },
          { "fields.status": searchRegex },
          { source: searchRegex },
        ],
      });
    }

    // ---------------- STATUS FILTER ----------------
    if (status) {
      if (status === "other") {
        andConditions.push({ "fields.status": { $in: ["", null] } });
      } else {
        andConditions.push({ "fields.status": status });
      }
    }

    // ---------------- ASSIGNED FILTER ----------------
    if (assigned === "assigned") {
      andConditions.push({ whoAssignedwho: { $exists: true, $ne: [] } });
    } else if (assigned === "unassigned") {
      andConditions.push({
        $or: [
          { whoAssignedwho: { $exists: false } },
          { whoAssignedwho: { $size: 0 } },
        ],
      });
    }

    // ---------------- DATE FILTER ----------------
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      andConditions.push({
        createdAt: { $gte: start, $lte: end },
      });
    }
    // -------------------source filter---------------
    const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (source) {
      andConditions.push({
        source: { $regex: `.*${escapeRegex(source)}.*`, $options: "i" }
      });
    }

    // Combine all conditions into $and
    if (andConditions.length) {
      query.$and = andConditions;
    }
    // console.log(andConditions,"pp")
    // ---------------- FETCH DATA ----------------
    const total = await leadModel.countDocuments(query);
    const leads = await leadModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    return res.status(200).json({
      success: true,
      page,
      itemsPerPage,
      total,
      totalPages: Math.ceil(total / itemsPerPage),
      data: leads,
    });
  } catch (error) {
    return next(error);
  }
};

export const leadViewOne = async (req, res, next) => {
  try {
    const { id: employeeId } = req.user;
    const { id } = req.params;

    if (!id) {
      const error = new Error("Lead ID is required");
      error.statusCode = 400;
      return next(error);
    }

    // Fetch lead
    let lead = await leadModel.findById(id)
      .populate({
        path: "whoAssignedwho.assignedTo",
        select: "name role department"
      })
      .populate({
        path: "whoAssignedwho.assignedBy",
        select: "name role department"
      })
      .populate({
        path: "followUp.addedBy",
        select: "name role employeeCode"
      })
      .lean();
    // console.log(lead,"rtog")
    // FIRST check if lead exists
    if (!lead) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      return next(error);
    }
    // console.log(lead)
    //Safely generate URLs for confirmed files (overwrite existing url)
    // if (lead?.OnConfirmed) {
    //   await Promise.all(
    //     lead?.OnConfirmed[0]?.OnConfirmedFiles?.map(async (file) => {
    //       file.url = await generateUploadURL(file.public_id);

    //     })
    //   );
    // }
    if (lead?.OnConfirmed?.length) {
      await Promise.all(
        lead.OnConfirmed.map(async (confirmedItem) => {
          if (confirmedItem?.OnConfirmedFiles?.length) {
            await Promise.all(
              confirmedItem.OnConfirmedFiles.map(async (file) => {
                file.url = await generateUploadURL(file.public_id);
              })
            );
          }
        })
      );
    }


    //  Post-process assignments
    if (lead?.whoAssignedwho?.length) {
      lead.whoAssignedwho = await Promise.all(
        lead.whoAssignedwho.map(async (a) => {
          // Since you already populated assignedBy,
          // this comparison must use _id
          if (a.assignedBy?._id?.toString() === employeeId.toString()) {
            return a; // already populated
          }
          return a;
        })
      );
    }

    return res.status(200).json({
      success: true,
      data: lead
    });

  } catch (error) {
    return next(error);
  }
};


// export const leadStatusRecord = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const allStatuses = ["Confirmed", "Interested", "Dump", "Not Connected"];

//     const data = await leadModel.aggregate([
//       // Match leads where this user exists in statusRecord
//       { $match: { "statusRecord.userId": new mongoose.Types.ObjectId(id) } },

//       // Unwind statusRecord to process counts
//       { $unwind: { path: "$statusRecord", preserveNullAndEmptyArrays: true } },

//       // Lookup user info
//       // Lookup user info but only include name
//       {
//         $lookup: {
//           from: "employee_tables", // your employee collection
//           let: { userId: "$statusRecord.userId" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
//             { $project: { name: 1, _id: 1 } } // only include name and _id
//           ],
//           as: "statusRecord.userId"
//         }
//       },
//       { $unwind: { path: "$statusRecord.userId", preserveNullAndEmptyArrays: true } },

//       // Lookup role info
//       // Lookup role info but only include role field
//       {
//         $lookup: {
//           from: "roles", // your role collection
//           let: { roleId: "$statusRecord.roleId" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$_id", "$$roleId"] } } },
//             { $project: { role: 1, _id: 1 } } // only include role and _id
//           ],
//           as: "statusRecord.roleId"
//         }
//       },
//       { $unwind: { path: "$statusRecord.roleId", preserveNullAndEmptyArrays: true } },

//       // Group back by lead
//       {
//         $group: {
//           _id: "$_id",
//           fields: { $first: "$fields" },
//           statusRecord: { $push: "$statusRecord" }
//         }
//       },

//       // Compute statusCounts
//       {
//         $addFields: {
//           statusCounts: allStatuses.reduce((acc, status) => {
//             acc[status] = { $size: { $filter: { input: "$statusRecord", as: "sr", cond: { $eq: ["$$sr.status", status] } } } };
//             return acc;
//           }, {})
//         }
//       }
//     ]);

//   // console.log(data)
//     res.status(200).json({
//       success: true,
//       data
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const leadDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Lead ID is required");
      error.statusCode = 400;
      return next(error);
    }

    const deletedLead = await leadModel.findByIdAndDelete(id);

    if (!deletedLead) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully"
    });
  } catch (error) {
    return next(error);
  }
};

// controllers/lead.controller.js


export const leadUpdate = async (req, res, next) => {
  // console.log(req.body, "uiui")
 
  try {
    const { id, } = req.params;
    // console.log(objId,"ll")
    const { name: empName, id: empId } = req.user
    if (!id) {
      return res.status(400).json({ success: false, message: "Lead ID is required" });
    }

    // Destructure request body
    let { fields, OnConfirmed, statusRecord, status, objId, ...otherFields } = req.body;
    // console.log(status, "status")
    // -----------------------------
    // Parse fields if string (from FormData)
    // -----------------------------
    if (fields && typeof fields === "string") {
      try { fields = JSON.parse(fields); }
      catch { return res.status(400).json({ success: false, message: "Invalid JSON for fields" }); }
    }

    // Parse OnConfirmed if string
    if (OnConfirmed && typeof OnConfirmed === "string") {
      try { OnConfirmed = JSON.parse(OnConfirmed); }
      catch { return res.status(400).json({ success: false, message: "Invalid JSON for OnConfirmed" }); }
    }
    // Add employee info
    if (OnConfirmed && !status) {
      OnConfirmed.addedBy = {
        id: empId,    // reference to employee
        name: empName // store employee name
      };
    }
    // Parse OnConfirmed.contact if string
    if (OnConfirmed?.contact && typeof OnConfirmed.contact === "string") {
      try { OnConfirmed.contact = JSON.parse(OnConfirmed.contact); }
      catch { return res.status(400).json({ success: false, message: "Invalid JSON for OnConfirmed.contact" }); }
    }
    // Build update query
    // -----------------------------
    const updateQuery = {};
    // Parse statusRecord if string
    if (statusRecord && typeof statusRecord === "string") {
      try { statusRecord = JSON.parse(statusRecord); }
      catch {
        console.error("Invalid statusRecord JSON");
        statusRecord = [];
      }
    }
    const statusData = await leadModel.findOne({ _id: id })
    // console.log(statusData)
    if (status && status.length > 0) {
      const latestStatus = status[status.length - 1];
      const statusId = objId; // ID to match

      // Find the object in OnConfirmed array that matches the ID
      const index = statusData?.OnConfirmed.findIndex(
        item => String(item._id) === String(statusId)
      );
      // console.log(index, statusId,objId,latestStatus, "index")
      if (index !== -1) {
        // Calculate totalTime if latest status is Completed
        if (latestStatus.label === "Completed") {
          const firstDate = new Date(statusData?.OnConfirmed[index].status[0].date);
          const completedDate = new Date(latestStatus.date);

          const diffMs = completedDate - firstDate;
          const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          // Update totalTime in the matched object
          statusData.OnConfirmed[index].totalTime = totalDays;
          // updateQuery.$set.OnConfirmed = statusData.OnConfirmed
          await statusData.save()
        }
      }
      // Update status array in the matched object
      statusData.OnConfirmed[index].status = status;
      await statusData.save()
      // updateQuery.$set.OnConfirmed[index] = status
    }
    // -----------------------------


    // Update other normal fields
    if (Object.keys(otherFields).length > 0) {
      updateQuery.$set = otherFields;
    }

    if (fields && Object.keys(fields).length > 0) {
      if (!updateQuery.$set) updateQuery.$set = {};
      updateQuery.$set.fields = fields;
    }

    // -----------------------------
    // Build $push for arrays
    // -----------------------------
    updateQuery.$push = {
      ...updateQuery.$push,
      ...(statusRecord && Array.isArray(statusRecord) && statusRecord.length > 0
        ? { statusRecord: { $each: statusRecord } }
        : {}),
      ...(OnConfirmed &&
        typeof OnConfirmed === "object" &&
        !Array.isArray(OnConfirmed) &&
        Object.keys(OnConfirmed).length > 0 &&
        (OnConfirmed.nameOfService || OnConfirmed.totalAmount) // at least one meaningful field
        ? { OnConfirmed: { $each: [OnConfirmed] } }
        : {}),
    };

    if (Object.keys(updateQuery).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided for update" });
    }

    // -----------------------------
    // Execute update
    // -----------------------------
    // await statusData.save()
    // console.log(statusData,"statuss")
    const updatedLead = await leadModel.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    });

    if (!updatedLead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};
// export const leadUpdate = async (req, res, next) => {
//   // console.log(req.body, "Received request body");

//   try {
//     const { id } = req.params;
//     if (!id) {
//       const error = new Error("Lead ID is required");
//       error.statusCode = 400;
//       return next(error);
//     }

//     // Parse fields if it's a string
//     if (req.body.fields && typeof req.body.fields === "string") {
//       try {
//         req.body.fields = JSON.parse(req.body.fields);
//       } catch (err) {
//         const error = new Error("Invalid JSON format for fields");
//         error.statusCode = 400;
//         return next(error);
//       }
//     }

//     let { OnConfirmed, ...otherFields } = req.body;

//     // Parse OnConfirmed.contact if it's a string
//     if (OnConfirmed?.contact && typeof OnConfirmed.contact === "string") {
//       try {
//         OnConfirmed.contact = JSON.parse(OnConfirmed.contact);

//       } catch (err) {
//         const error = new Error("Invalid JSON format for OnConfirmed.contact");
//         error.statusCode = 400;
//         return next(error);
//       }
//     }



//     // Build update query
//     if (OnConfirmed) {
//       // Ensure addedBy is an object
//       if (!OnConfirmed.addedBy || typeof OnConfirmed.addedBy === "string") {
//         OnConfirmed.addedBy = { userId: OnConfirmed.addedBy || req.user.id, name: req.user.name };
//       } else {
//         // If object exists, safely set properties
//         OnConfirmed.addedBy.userId = req.user.id;
//         OnConfirmed.addedBy.name = req.user.name;
//       }
//     }

//     const updateQuery = {};
//     if (Object.keys(otherFields).length > 0) updateQuery.$set = otherFields;
//     if (OnConfirmed) {
//       updateQuery.$push = {
//         OnConfirmed: Array.isArray(OnConfirmed) ? { $each: OnConfirmed } : { $each: [OnConfirmed] }
//       };
//     }

//     // Execute update
//     const updatedLead = await leadModel.findByIdAndUpdate(
//       id,
//       updateQuery,
//       { new: true, runValidators: true }
//     );

//     if (!updatedLead) {
//       const error = new Error("Lead not found");
//       error.statusCode = 404;
//       return next(error);
//     }

//     return res.status(200).json({
//       success: true,
//       data: updatedLead
//     });

//   } catch (error) {
//     return next(error);
//   }
// };



// export const  leadCreate=async(req,res,next)=>{
//     try {

//     } catch (error) {

//     }
// }

// export const leadUpdate = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Lead ID is required"
//       });
//     }
//     // console.log(req.body,"etjrtjgg")
//     // -----------------------------
//     // Parse fields if string
//     // -----------------------------
//     if (req.body.fields && typeof req.body.fields === "string") {
//       try {
//         req.body.fields = JSON.parse(req.body.fields);
//       } catch (err) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid JSON format for fields"
//         });
//       }
//     }

//     let { OnConfirmed, statusRecord, ...otherFields } = req.body;

//     // -----------------------------
//     // Parse OnConfirmed if string
//     // -----------------------------
//     if (OnConfirmed && typeof OnConfirmed === "string") {
//       try {
//         OnConfirmed = JSON.parse(OnConfirmed);
//       } catch (err) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid JSON format for OnConfirmed"
//         });
//       }
//     }

//     // -----------------------------
//     // Parse OnConfirmed.contact if string
//     // -----------------------------
//     if (OnConfirmed?.contact && typeof OnConfirmed.contact === "string") {
//       try {
//         OnConfirmed.contact = JSON.parse(OnConfirmed.contact);
//       } catch (err) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid JSON format for OnConfirmed.contact"
//         });
//       }
//     }

//     // -----------------------------
//     // Build Update Query
//     // -----------------------------
//     const updateQuery = {};

//     // Update normal fields
//     if (Object.keys(otherFields).length > 0) {
//       updateQuery.$set = otherFields;
//     }
//     console.log(req.body)
// // If it's a string (from FormData), parse it


// if (typeof statusRecord === "string") {
//   try {
//     statusRecord = JSON.parse(statusRecord);
//   } catch (err) {
//     console.error("Invalid statusRecord JSON", err);
//     statusRecord = [];
//   }
// }

// if (Array.isArray(statusRecord) && statusRecord.length > 0) {
//   if (!updateQuery.$push) updateQuery.$push = {};
//   updateQuery.$push.statusRecord = { $each: statusRecord };
// }
//     // -----------------------------
//     // Check if OnConfirmed has at least one valid field
//     // -----------------------------
//     if (OnConfirmed && typeof OnConfirmed === "object") {
//       const hasValidData = Object.values(OnConfirmed).some((value) => {
//         if (Array.isArray(value)) return value.length > 0;

//         if (typeof value === "object" && value !== null) {
//           return Object.values(value).some(
//             (v) => v !== "" && v !== null && v !== undefined
//           );
//         }

//         return value !== "" && value !== null && value !== undefined;
//       });

//       if (hasValidData) {
//         // Add addedBy info
//         OnConfirmed.addedBy = {
//           userId: req.user?.id,
//           name: req.user?.name
//         };

//         updateQuery.$push = {
//           OnConfirmed: { $each: [OnConfirmed] }
//         };
//       }
//     }

//     // If nothing to update
//     if (Object.keys(updateQuery).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid fields provided for update"
//       });
//     }

//     // -----------------------------
//     // Execute Update
//     // -----------------------------
//     const updatedLead = await leadModel.findByIdAndUpdate(
//       id,
//       updateQuery,
//       { new: true, runValidators: true }
//     );

//     if (!updatedLead) {
//       return res.status(404).json({
//         success: false,
//         message: "Lead not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Lead updated successfully",
//       data: updatedLead
//     });

//   } catch (error) {
//     next(error);
//   }
// };


export const leadDashboard = async (req, res) => {
  try {
    const { licenseId } = req.user;

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const [totalleads, monthlyleads, roleWise] = await Promise.all([
      // Total Leads
      leadModel.countDocuments({ licenseId }),

      // Monthly Leads
      leadModel.countDocuments({
        licenseId,
        createdAt: { $gte: startOfMonth },
      }),

      // Role Wise Leads
      leadModel.aggregate([
        {
          $match: {
            licenseId: new mongoose.Types.ObjectId(licenseId),
          },
        },
        {
          $lookup: {
            from: "roles", // Role collection
            localField: "roleID",
            foreignField: "_id",
            as: "roleData",
          },
        },
        {
          $unwind: {
            path: "$roleData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$roleData.role",
            leads: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            role: "$_id",
            leads: 1,
          },
        },
        {
          $sort: { leads: -1 },
        },
      ]),
    ]);

    // console.log(roleWise,totalleads,monthlyleads)
    return res.status(200).json({
      success: true,
      data: {
        totalleads,
        monthlyleads,
        roleWise,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const leadRecord = async (req, res) => {
  try {
    const { id } = req.params; // employee id
    const userObjectId = new mongoose.Types.ObjectId(id);

    /* ----------------------------------
        Assigned Leads (Month wise)
    ---------------------------------- */
    const assignedLeads = await leadModel.aggregate([
      { $unwind: "$whoAssignedwho" },
      { $match: { "whoAssignedwho.assignedTo": userObjectId } },
      {
        $project: {
          _id: 1,
          fields: 1,
          assignedAt: "$whoAssignedwho.assignedAt",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$assignedAt" },
            year: { $year: "$assignedAt" },
          },
          leads: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    /* ----------------------------------
     Leads where user changed status (with populate)
    ---------------------------------- */
    const userStatusLeads = await leadModel.aggregate([
      // Filter statusRecord for this user
      {
        $addFields: {
          userStatusRecords: {
            $filter: {
              input: "$statusRecord",
              cond: { $eq: ["$$this.userId", userObjectId] },
            },
          },
        },
      },
      { $match: { "userStatusRecords.0": { $exists: true } } },

      // Populate only the matching user
      {
        $lookup: {
          from: "employee_tables",
          let: { uid: { $arrayElemAt: ["$userStatusRecords.userId", 0] } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
            { $project: { name: 1, _id: 1 } },
          ],
          as: "userRecords",
        },
      },
      // Populate only the matching role
      {
        $lookup: {
          from: "roles",
          let: { rid: { $arrayElemAt: ["$userStatusRecords.roleId", 0] } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$rid"] } } },
            { $project: { role: 1, _id: 1 } },
          ],
          as: "roleRecords",
        },
      },
      {
        $project: {
          _id: 1,
          fields: 1,
          statusRecord: {
            $map: {
              input: "$userStatusRecords",
              as: "sr",
              in: {
                _id: "$$sr._id",
                status: "$$sr.status",
                changedAt: "$$sr.changedAt",
                userId: { $arrayElemAt: ["$userRecords", 0] },
                roleId: { $arrayElemAt: ["$roleRecords", 0] },
              },
            },
          },
        },
      },
    ]);

    /* ----------------------------------
       Total Status Counts (Last Status)
    ---------------------------------- */
    const totalStatusCounts = {
      Confirmed: 0,
      Interested: 0,
      Dump: 0,
      "Not Connected": 0,
    };

    userStatusLeads.forEach((lead) => {
      const lastStatus =
        lead.statusRecord[lead.statusRecord.length - 1]?.status;
      if (lastStatus && totalStatusCounts[lastStatus] !== undefined) {
        totalStatusCounts[lastStatus] += 1;
      }
    });
    // console.log(totalStatusCounts, "pp", userStatusLeads.length)
    return res.status(200).json({
      success: true,
      data: {
        assignedLeads,
        userStatusLeads,
        totalStatusCounts,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
export const verifyMeta = (req, res) => {
  try {
    // Extract query params
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Log incoming request for debugging
    console.log("Incoming GET verification request:");
    console.log({ mode, token, challenge });
    console.log("ENV Token:", process.env.Meta_Token);

    // Check verification
    if (mode === "subscribe" && token === process.env.Meta_Token) {
      console.log("✅ Verification passed");
      return res.status(200).send(challenge); // Must return challenge exactly
    }

    console.log("❌ Verification failed");
    return res.status(403).send("Forbidden: token or mode mismatch");
  } catch (error) {
    console.error("Error in verification handler:", error);
    return res.sendStatus(500); // Always send a response
  }
};
import axios from "axios";
import LicenseModel from "../models/license.model.js";


// export const metaLeadStore = async (req, res) => {
//   console.log("jhgfg")
//   try {
//     const leadId = req.body.entry[0].changes[0].value.leadgen_id; 
//     if (!leadId) return res.sendStatus(200);

//     // Get licenseId dynamically (query param or map by page/form)
//     const licenseId = req.query.licenseId;
//     if (!licenseId) return res.status(400).send("licenseId required");

//     // Fetch lead data from Meta
//     const leadResponse = await axios.get(
//       `https://graph.facebook.com/v18.0/${leadId}`,
//       {
//         params: {
//           access_token: process.env.Pages_Access_Token,
//         },
//       }
//     );

//     // Map field data
//     const fields = {};
//     leadResponse.data.field_data.forEach((f) => {
//       fields[f.name] = f.values[0];
//     });

//     // Save lead
//     await leadModel.create({
//       licenseId,
//       leadgenId: leadId,
//       fields,
//       whoAssignedwho: [], // empty initially
//       followUp: [],       // empty initially
//     });

//     console.log("Lead saved:", leadId, "for license:", licenseId);
//     res.sendStatus(200);
//   } catch (error) {
//     console.error("Error saving lead:", error.message);
//     res.sendStatus(500);
//   }
// };



// export const metaLeadStore = async (req, res) => {
//   console.log("Received lead webhook");

//   try {
//     const leadId = req.body.entry[0].changes[0].value.leadgen_id;
//     if (!leadId) return res.sendStatus(200);

//     // const licenseId =NGOG101474
//     const licenseId ="NGOG101474"
//     if (!licenseId) return res.status(400).send("licenseId required");

//     // Fetch lead data from Meta
//     const leadResponse = await axios.get(
//       `https://graph.facebook.com/v18.0/${leadId}`,
//       {
//         params: { access_token: process.env.Pages_Access_Token },
//       }
//     );

//     // Map Meta field names to your DB model
//     const fieldMapping = {
//       email: "email",
//       phone_number: "contact",
//       city: "city",
//       state: "state",
//       name_of_your_ngo: "ngoName",
//     };

//     const fields = {};
//     leadResponse.data.field_data.forEach((f) => {
//       const dbField = fieldMapping[f.name];
//       if (dbField) {
//         fields[dbField] = f.values[0];
//       }
//     });

//     // Save lead
//     await leadModel.create({
//       licenseId,
//       leadgenId: leadId,
//       description: "",      // leave description empty
//       ...fields,            // mapped fields
//       whoAssignedwho: [],   // empty initially
//       followUp: [],         // empty initially
//     });

//     console.log("Lead saved:", leadId, "for license:", licenseId);
//     res.sendStatus(200);
//   } catch (error) {
//     console.error("Error saving lead:", error.message);
//     res.sendStatus(500);
//   }
// };




export const metaLeadStore = async (req, res) => {
  console.log("Received lead webhook");

  try {
    const leadId = req.body?.entry?.[0]?.changes?.[0]?.value?.leadgen_id;
    if (!leadId) return res.sendStatus(200);

    const licenseId = "NGOG101474"; // should be ObjectId ideally
    if (!licenseId) return res.status(400).send("licenseId required");

    // Fetch lead data from Meta
    const leadResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${leadId}`,
      {
        params: {
          access_token: process.env.Pages_Access_Token,
        },
      }
    );

    const fieldMapping = {
      email: "email",
      phone_number: "contact",
      city: "city",
      state: "state",
      name_of_your_ngo: "ngoName",
    };

    const fields = {};

    leadResponse.data.field_data.forEach((f) => {
      const dbField = fieldMapping[f.name];
      if (dbField) {
        fields[dbField] = f.values[0];
      }
    });

    await leadModel.create({
      licenseId,
      source: "meta_ads", // required field 
      fields,             // store inside Map
      whoAssignedwho: [],
      followUp: [],
    });

    console.log("Lead saved:", leadId);

    res.sendStatus(200);

  } catch (error) {
    console.error("Error saving lead:", error.response?.data || error.message);
    res.sendStatus(500);
  }
};

export const bulkLeadAssign = async (req, res) => {
  try {
    const { id } = req.user; // logged-in user
    const { leadIds, assignedTo, roleID } = req.body;

    // Validation
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No leads selected",
      });
    }
    //  console.log(leadIds,assignedTo,roleID,"pp")

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assigned employee is required",
      });
    }

    // Bulk update
    const result = await leadModel.updateMany(
      { _id: { $in: leadIds } },
      {
        $push: {
          whoAssignedwho: {
            assignedTo: assignedTo,
            assignedBy: id,
            assignedAt: new Date(),
          },
        },
        roleID: roleID
      }
    );

    // console.log(result,"ogo")
    return res.status(200).json({
      success: true,
      message: "Leads assigned successfully",
      modifiedCount: result,
    });
  } catch (error) {
    console.error("Bulk Assign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
