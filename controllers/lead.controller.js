import { generateUploadURL } from "../config/awsS3.js";
import companyConfigureModel from "../models/companyConfigure.model.js";
import EmployeeModel from "../models/employees/employee.model.js";
import leadModel from "../models/lead.model.js";
import mongoose from "mongoose";




export const leadCreateInside = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Request body cannot be empty");
      error.statusCode = 400;
      return next(error);
    }
    // console.log(req.user,"rf")
    // const { employeeCode } = req.user;

    // const licenseData = await EmployeeModel
    //   .findOne({ employeeCode })
    //   .populate("licenseId", "_id")
    //   .lean();
    // console.log(req.body)
    // if (!req.body.licenseId) {
    //   const error = new Error("License not found");
    //   return next(error);
    // }

    // const id = licenseData._id;
    //     const checkLicense=await LicenseModel.findOne({
    // licenseId:id})
    // console.log(checkLicense,"popo")

    // Simply save fields key=>value directly
    const newLead = await leadModel.create({
      licenseId: req.user.licenseId,
      fields: req.body,
      source: "Portal"
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
export const leadView = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
    const skip = (page - 1) * itemsPerPage;

    const { search, status, date, assigned } = req.query;
    const { id: employeeId, role, licenseId } = req.user;
    // console.log(assigned, "pp")
    let query = { licenseId };

    // ---------------- ROLE FILTER ----------------
    const unrestrictedRoles = ["Admin", "Digital Marketer"];

    if (!unrestrictedRoles.includes(role)) {
      query.whoAssignedwho = {
        $elemMatch: { assignedTo: employeeId }
      };
    }

    // ---------------- SEARCH (FIXED) ----------------
    if (search) {
      const searchRegex = new RegExp(search, "i");

      query.$or = [
        { "fields.Name": searchRegex },
        { "fields.Email": searchRegex },
        { "fields.Contact": searchRegex },
        { "fields.description": searchRegex },
        { "fields.status": searchRegex },
        { source: searchRegex }
      ];
    }

    // ---------------- STATUS FILTER ----------------
    if (status) {
      query["fields.status"] = status;
    }
    if (assigned === "assigned") {
      query.whoAssignedwho = { $exists: true, $ne: [] };
    }

    if (assigned === "unassigned") {
      query.$or = [
        { whoAssignedwho: { $exists: false } },
        { whoAssignedwho: { $size: 0 } }
      ];
    }

    // ---------------- DATE FILTER ----------------
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: start,
        $lte: end
      };
    }

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
      data: leads
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
        select: "name employeeCode"
      })
      .populate({
        path: "whoAssignedwho.assignedBy",
        select: "name employeeCode"
      })
      .populate({
        path: "followUp.addedBy",
        select: "name employeeCode"
      })
      .lean();

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

export const leadUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required"
      });
    }

    // -----------------------------
    // Parse fields if string
    // -----------------------------
    if (req.body.fields && typeof req.body.fields === "string") {
      try {
        req.body.fields = JSON.parse(req.body.fields);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for fields"
        });
      }
    }

    let { OnConfirmed, ...otherFields } = req.body;

    // -----------------------------
    // Parse OnConfirmed if string
    // -----------------------------
    if (OnConfirmed && typeof OnConfirmed === "string") {
      try {
        OnConfirmed = JSON.parse(OnConfirmed);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for OnConfirmed"
        });
      }
    }

    // -----------------------------
    // Parse OnConfirmed.contact if string
    // -----------------------------
    if (OnConfirmed?.contact && typeof OnConfirmed.contact === "string") {
      try {
        OnConfirmed.contact = JSON.parse(OnConfirmed.contact);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for OnConfirmed.contact"
        });
      }
    }

    // -----------------------------
    // Build Update Query
    // -----------------------------
    const updateQuery = {};

    // Update normal fields
    if (Object.keys(otherFields).length > 0) {
      updateQuery.$set = otherFields;
    }

    // -----------------------------
    // Check if OnConfirmed has at least one valid field
    // -----------------------------
    if (OnConfirmed && typeof OnConfirmed === "object") {
      const hasValidData = Object.values(OnConfirmed).some((value) => {
        if (Array.isArray(value)) return value.length > 0;

        if (typeof value === "object" && value !== null) {
          return Object.values(value).some(
            (v) => v !== "" && v !== null && v !== undefined
          );
        }

        return value !== "" && value !== null && value !== undefined;
      });

      if (hasValidData) {
        // Add addedBy info
        OnConfirmed.addedBy = {
          userId: req.user?.id,
          name: req.user?.name
        };

        updateQuery.$push = {
          OnConfirmed: { $each: [OnConfirmed] }
        };
      }
    }

    // If nothing to update
    if (Object.keys(updateQuery).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    // -----------------------------
    // Execute Update
    // -----------------------------
    const updatedLead = await leadModel.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead
    });

  } catch (error) {
    next(error);
  }
};


export const leadDashboard = async (req, res) => {
  try {
    const { licenseId } = req.user;

    // Start of current month
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const [
      totalleads,
      monthlyleads
    ] = await Promise.all([
      leadModel.countDocuments({ licenseId }),

      leadModel.find({
        licenseId,
        createdAt: { $gte: startOfMonth },
      }),

      // LicenseModel.findById(licenseId).select("activeUser maxUser"),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalleads,
        monthlyleads,
        // license: licenseData,
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


export const verifyMeta = async (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "Subscribe" && token === process.env.Meta_Token) {
      return res.status(200).send(challenge)
    }

    return res.sendStatus(403)
  } catch (error) {
    console.log(error)
  }
}

import axios from "axios";
import LicenseModel from "../models/license.model.js";


export const metaLeadStore = async (req, res) => {
  try {
    const leadId = req.body.entry[0].changes[0].value.leadgen_id; // FIXED typo
    if (!leadId) return res.sendStatus(200);

    // Get licenseId dynamically (query param or map by page/form)
    const licenseId = req.query.licenseId;
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

    // Map field data
    const fields = {};
    leadResponse.data.field_data.forEach((f) => {
      fields[f.name] = f.values[0];
    });

    // Save lead
    await leadModel.create({
      licenseId,
      leadgenId: leadId,
      fields,
      whoAssignedwho: [], // empty initially
      followUp: [],       // empty initially
    });

    console.log("Lead saved:", leadId, "for license:", licenseId);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving lead:", error.message);
    res.sendStatus(500);
  }
};





export const bulkLeadAssign = async (req, res) => {
  try {
    const { id } = req.user; // logged-in user
    const { leadIds, assignedTo } = req.body;

    // Validation
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No leads selected",
      });
    }

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
  }
);

// console.log(result,"ogo")
    return res.status(200).json({
      success: true,
      message: "Leads assigned successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk Assign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
