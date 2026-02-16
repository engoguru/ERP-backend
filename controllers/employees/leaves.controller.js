import mongoose, { isValidObjectId } from "mongoose";
import leavesModel from "../../models/employees/leaves.model.js";



// export const leavesCreate = async (req, res, next) => {
//   try {
//     if (!req.body || Object.keys(req.body).length === 0) {
//       return res.status(400).json({ message: "Request body is empty!" });
//     }

//     const leave = await leavesModel.create(req.body);

//     return res.status(201).json({
//       success: true,
//       message: "Leave request placed successfully!",
//       data: leave
//     });

//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({ message: "Duplicate leave request" });
//     }
//     next(error);
//   }
// };

// Helper: split leave across months
const splitLeaveByMonth = (fromDate, toDate) => {
  const result = [];

  let start = new Date(fromDate);   // convert string → Date
  const endDate = new Date(toDate); // convert string → Date

  while (start <= endDate) {
    const year = start.getFullYear();
    const month = start.getMonth();

    const endOfMonth = new Date(year, month + 1, 0); // last day of month
    const end = endOfMonth < endDate ? endOfMonth : endDate;

    result.push({
      fromDate: new Date(start),
      toDate: new Date(end),
      month,
      year
    });

    start = new Date(end);
    start.setDate(start.getDate() + 1); // move to next day
  }

  return result;
};

export const leavesCreate = async (req, res) => {
  try {
    // console.log(req.body)
    // Split leave across months
    const leaveDocs = splitLeaveByMonth(req.body.fromDate, req.body.toDate).map(d => ({
      ...req.body,
      fromDate: d.fromDate,
      toDate: d.toDate,
      month: d.month,
      year: d.year
    }));
    // console.log(leaveDocs,"opp")
    // Save each month-wise leave
    const savedLeaves = [];
    for (const doc of leaveDocs) {
      // console.log(doc,"ppp")
      doc.employeeId = req.user.id;
      doc.licenseId = req.user.licenseId;
      const leave = new leavesModel(doc);
      const saved = await leave.save(); // triggers pre-save hook
      savedLeaves.push(saved);
    }

    //  Respond with saved leaves
    res.status(201).json({
      message: "Leave applied successfully (month-wise)",
      data: savedLeaves
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const leavesUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { id: employeeId } = req.user;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Leave ID" });
    }
console.log(status,"oo")
    const updatedLeave = await leavesModel.findByIdAndUpdate(
      id,
      {
        status,
        approvedBy: employeeId,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      data: updatedLeave,
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
    // .populate("licenseId");
    const leave = await leavesModel
      .findById(id)
      .populate("employeeId", "name email")
      .populate("approvedBy", "name email")

    // console.log(leave,id)
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
    const { page = 1, limit = 100, employeeId, status } = req.query;
    const { licenseId } = req.user;

    const filter = {};

    if (licenseId) {
      filter.licenseId = new mongoose.Types.ObjectId(licenseId);
    }

    if (employeeId) {
      filter.employeeId = new mongoose.Types.ObjectId(employeeId);
    }

    if (status) {
      filter.status = status;
    }

    const leaves = await leavesModel
      .find(filter)
      .populate("employeeId", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await leavesModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: leaves,
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
