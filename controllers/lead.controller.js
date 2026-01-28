import companyConfigureModel from "../models/companyConfigure.model.js";
import EmployeeModel from "../models/employees/employee.model.js";
import leadModel from "../models/lead.model.js";
import mongoose from "mongoose";

export const leadCreate = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Request body cannot be empty");
      error.statusCode = 400;
      return next(error);
    }

    const { employeeCode } = req.user;

    const licenseData = await EmployeeModel
      .findOne({ employeeCode })
      .populate("licenseId", "_id")
      .lean();

    if (!licenseData?.licenseId) {
      const error = new Error("License not found");
      return next(error);
    }

    const id = licenseData.licenseId._id;

    // Simply save fields key=>value directly
    const newLead = await leadModel.create({
      licenseId: id,
      fields: req.body
    });

    return res.status(201).json({
      success: true,
      data: newLead
    });
  } catch (error) {
    return next(error);
  }
};

export const leadUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      const error = new Error("Lead ID is required");
      error.statusCode = 400;
      return next(error);
    }

    // Build update object — update fields dynamically
    const updateData = req.body;

    const updatedLead = await leadModel.findOneAndUpdate(
      { _id: id },      // filter by licenseId
      { $set: updateData },   // merge fields instead of overwriting
      {
        new: true,            // return updated document
        runValidators: true   // enforce schema validators
      }
    );

    if (!updatedLead) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      data: updatedLead
    });
  } catch (error) {
    return next(error);
  }
};


export const leadView = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 50;
    const skip = (page - 1) * itemsPerPage;

    const { employeeCode, id: employeeId, role } = req.user;

    // Get licenseId for logged-in employee
    const licenseData = await EmployeeModel
      .findOne({ employeeCode })
      .populate("licenseId", "_id")
      .lean();

    if (!licenseData?.licenseId) {
      return next(new Error("License not found"));
    }

    const licenseId = licenseData.licenseId._id;

    // Base query
    let query = { licenseId };

    // Role-based filtering
    if (role !== "Admin") {
      query.whoAssignedwho = {
        $elemMatch: { assignedTo: employeeId }
      };
    }

    const total = await leadModel.countDocuments(query);

    const leads = await leadModel
      .find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

      // console.log(leads,"ppp")
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

    // Fetch lead with all normal populates
    let lead = await leadModel.findById({_id:id}).populate({
        path: "whoAssignedwho.assignedTo",
        select: "name employeeCode"
      })
      .populate({
        path: "followUp.addedBy",
        select: "name employeeCode"
      })
      .lean();

    if (!lead) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      return next(error);
    }
// console.log(lead,"oppoo")
    // Post-process assignments: populate assignedBy only if logged-in user
    lead.whoAssignedwho = await Promise.all(
      lead.whoAssignedwho.map(async (a) => {
        if (a.assignedBy === employeeId) {
          // Populate logged-in user's assignedBy
          const assignedByObj = await EmployeeModel
            .findById(a.assignedBy)
            .select("name employeeCode")
            .lean();
          return { ...a, assignedBy: assignedByObj };
        }
        return a; // keep ID for others
      })
    );

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




// export const  leadCreate=async(req,res,next)=>{
//     try {
        
//     } catch (error) {
        
//     }
// }