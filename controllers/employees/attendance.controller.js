// controllers/attendance.controller.js
import companyConfigureModel from "../../models/companyConfigure.model.js";
import AttendanceModel from "../../models/employees/attendance.model.js";
import mongoose from "mongoose";
import eventModel from "../../models/employees/event.model.js";

// CREATE Attendance
export const attendanceCreate = async (req, res) => {
    try {
        const attendance = new AttendanceModel(req.body);
        await attendance.save();
        res.status(201).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// UPDATE Attendance
export const attendanceUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await AttendanceModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Attendance not found" });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// VIEW ALL Attendances
export const attendanceView = async (req, res) => {
    try {
        const attendances = await AttendanceModel.find();
        res.json({ success: true, data: attendances });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// VIEW ONE Attendance

// export const attendanceViewOne = async (req, res) => {
//   try {
//     const { id } = req.params; // employeeId
//     const { year = new Date().getFullYear() } = req.query;
//     const licenseId = req.user.licenseId;

//     // 1️⃣ Company config
//     const companyConfigure = await companyConfigureModel.findOne({ licenseId });

//     const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//     // Convert weekly off days to numbers (Mongo compatible)
//     const weekOffDayNumbers =
//       companyConfigure?.holiday?.weeklyOff?.days?.map(
//         (d) => DAY_NAMES.indexOf(d) + 1
//       ) || [];

//     const attendanceSummary = await AttendanceModel.aggregate([
//       {
//         $match: {
//           employeeId: new mongoose.Types.ObjectId(id),
//           licenseId: new mongoose.Types.ObjectId(licenseId),
//           date: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },

//       // Month & weekday
//       {
//         $addFields: {
//           monthYear: { $dateToString: { format: "%Y-%m", date: "$date" } },
//           dayOfWeek: { $dayOfWeek: "$date" }, // 1-7
//         },
//       },

//       // Fest events lookup
//       {
//         $lookup: {
//           from: "events",
//           let: { month: "$monthYear", license: "$licenseId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$licenseId", "$$license"] },
//               },
//             },
//           ],
//           as: "festOffEvents",
//         },
//       },

//       // Leaves lookup
//       {
//         $lookup: {
//           from: "leaves",
//           let: { emp: "$employeeId" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$employeeId", "$$emp"] } } },
//           ],
//           as: "leaves",
//         },
//       },

//       // Group month-wise
//       {
//         $group: {
//           _id: "$monthYear",

//           attendance: {
//             $push: {
//               date: "$date",
//               intime: "$inTime",
//               outtime: "$outTime",
//               status: "$status",
//             },
//           },

//           totalEmployeeWorkingDays: {
//             $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] },
//           },

//           totalFixedOff: {
//             $sum: {
//               $cond: [{ $in: ["$dayOfWeek", weekOffDayNumbers] }, 1, 0],
//             },
//           },

//           festOffEvents: { $first: "$festOffEvents" },
//           leaves: { $first: "$leaves" },
//         },
//       },

//       // Final calculations
//       {
//         $addFields: {
//           totalFestOff: { $size: "$festOffEvents" },

//           totalPaidLeaves: {
//             $size: {
//               $filter: {
//                 input: "$leaves",
//                 as: "l",
//                 cond: { $eq: ["$$l.status", "PAID"] },
//               },
//             },
//           },

//           totalUnpaidLeaves: {
//             $size: {
//               $filter: {
//                 input: "$leaves",
//                 as: "l",
//                 cond: { $eq: ["$$l.status", "UNPAID"] },
//               },
//             },
//           },

//           totalHalfDays: {
//             $size: {
//               $filter: {
//                 input: "$leaves",
//                 as: "l",
//                 cond: { $eq: ["$$l.leaveType", "HALF"] },
//               },
//             },
//           },
//         },
//       },

//       {
//         $project: {
//           _id: 0,
//           monthYear: "$_id",
//           totalEmployeeWorkingDays: 1,
//           totalFixedOff: 1,
//           totalFestOff: 1,
//           totalPaidLeaves: 1,
//           totalUnpaidLeaves: 1,
//           totalHalfDays: 1,
//           attendance: 1,
//         },
//       },

//       { $sort: { monthYear: 1 } },
//     ]);

//     if (!attendanceSummary.length) {
//       return res.status(404).json({
//         success: false,
//         message: "Attendance not found for this year",
//       });
//     }

//     res.json({ success: true, data: attendanceSummary });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



export const attendanceViewOne = async (req, res) => {
  try {
    const { id } = req.params;              // employeeId
    const { year = new Date().getFullYear() } = req.query;
    const licenseId = req.user.licenseId;

    /* ------------------ VALIDATION ------------------ */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid employee id" });
    }

    /* ------------------ COMPANY CONFIG ------------------ */
    const companyConfig = await companyConfigureModel.findOne({ licenseId });

    if (!companyConfig) {
      return res.status(404).json({ success: false, message: "Company configuration not found" });
    }

    const weekOffDays = companyConfig.holiday.weeklyOff.days; // ["Sunday","Saturday"]
    const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const weekOffIndexes = weekOffDays.map(d => DAY_NAMES.indexOf(d));

    /* ------------------ GET MONTHS WITH ATTENDANCE ------------------ */
    const months = await AttendanceModel.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(id),
          licenseId: new mongoose.Types.ObjectId(licenseId),
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    if (!months.length) {
      return res.status(404).json({
        success: false,
        message: "No attendance data found for this year"
      });
    }

    /* ------------------ ATTENDANCE (MONTH-WISE) ------------------ */
    const attendanceAgg = await AttendanceModel.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(id),
          licenseId: new mongoose.Types.ObjectId(licenseId),
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $addFields: {
          monthYear: { $dateToString: { format: "%Y-%m", date: "$date" } }
        }
      },
      {
        $group: {
          _id: "$monthYear",
          attendance: {
            $push: {
              date: "$date",
              inTime: "$inTime",
              outTime: "$outTime",
              status: "$status",
              workingHour: "$workingHour"
            }
          },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] }
          }
        }
      }
    ]);

    /* ------------------ UTIL: FIXED OFF COUNT ------------------ */
    const getFixedOffCount = (year, month) => {
      const totalDays = new Date(year, month, 0).getDate();
      let fixedOff = 0;

      for (let d = 1; d <= totalDays; d++) {
        const dayIndex = new Date(year, month - 1, d).getDay();
        if (weekOffIndexes.includes(dayIndex)) fixedOff++;
      }

      return { totalDays, fixedOff };
    };

    /* ------------------ FINAL RESPONSE BUILD ------------------ */
    const response = [];

    for (const m of months) {
      const [y, mon] = m._id.split("-").map(Number);

      const { totalDays, fixedOff } = getFixedOffCount(y, mon);

      const attendanceMonth = attendanceAgg.find(a => a._id === m._id);

      /* -------- FEST OFF (EVENTS) -------- */
      const festOff = await eventModel.countDocuments({
        licenseId,
        startDate: { $lte: new Date(y, mon, 0) },
        endDate: { $gte: new Date(y, mon - 1, 1) }
      });

      const companyWorkingDays = totalDays - fixedOff - festOff;

      response.push({
        monthYear: m._id,
        totalCompanyWorkingDays: companyWorkingDays,
        totalEmployeeWorkingDays: attendanceMonth?.presentDays || 0,
        totalFixedOff: fixedOff,
        totalFestOff: festOff,
        attendance: attendanceMonth?.attendance || []
      });
    }

    /* ------------------ SEND RESPONSE ------------------ */
    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("Attendance View Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



// DELETE Attendance
export const attendanceDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await AttendanceModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Attendance not found" });
        res.json({ success: true, message: "Attendance deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
