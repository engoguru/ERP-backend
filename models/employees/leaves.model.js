import mongoose from "mongoose";
import companyConfigureModel from "../companyConfigure.model.js";
import eventModel from "./event.model.js";
const leavesSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee_Table",
    required: true
  },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },

  // for fast monthly filtering
  month: { type: Number, required: true }, // 0-11
  year: { type: Number, required: true },

  leaveType: {
    type: String,
    enum: ["Short Leave", "Paid Leave", "Half Day", "Round Mark", "Unpaid Leave"],
    required: true
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee_Table"
  },

  totalday: {
    totalPaid: { type: Number, default: 0 },
    totalUnpaid: { type: Number, default: 0 }
  },

  reason: { type: String, default: "" },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Reject"],
    default: "Pending"
  },

  licenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LicenseTable",
    required: true
  }
});

const getBusinessDays = (from, to, weeklyOff = [], holidays = []) => {
  let count = 0;
  const current = new Date(from);
  const end = new Date(to);

  while (current <= end) {
    const day = current.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeeklyOff = weeklyOff.includes(day);
    const isHoliday = holidays.some(h => new Date(h).toDateString() === current.toDateString());

    if (!isWeeklyOff && !isHoliday) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};



leavesSchema.pre("save", async function () {
  try {
    //  Set month/year
    if (!this.month) this.month = this.fromDate.getMonth();
    if (!this.year) this.year = this.fromDate.getFullYear();

    this.totalday = { totalPaid: 0, totalUnpaid: 0 };

    //  Fetch company policy
    const companyConfig = await companyConfigureModel.findOne({ licenseId: this.licenseId });
    if (!companyConfig) throw new Error("Company policy not found");
// console.log(companyConfig?.holiday?.monthlyPolicy,"thyh")
    const policy = companyConfig?.holiday?.monthlyPolicy || {};
    const weeklyOffs = companyConfig?.holiday?.weeklyOff?.days || [];

    //  Fetch holidays from Event_Table for this license and month
    const holidaysEvents = await eventModel.find({
      licenseId: this.licenseId,
      startDate: { $lte: this.toDate },
      endDate: { $gte: this.fromDate },
    }).select("startDate endDate");

    // flatten all holiday dates
    const holidays = [];
    holidaysEvents.forEach(e => {
      let current = new Date(e.startDate);
      const end = new Date(e.endDate);
      while (current <= end) {
        holidays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    // 3️⃣ Calculate total business days
    const totalBusinessDays = getBusinessDays(this.fromDate, this.toDate, weeklyOffs, holidays);

    // 4️⃣ Helper to get used approved leaves
    const usedLeaves = async (leaveType) => {
      const result = await mongoose.model("Leave_Table").aggregate([
        {
          $match: {
            employeeId: this.employeeId,
            leaveType,
            licenseId: this.licenseId,
            month: this.month,
            year: this.year,
            status: "Approved"
          }
        },
        { $group: { _id: null, total: { $sum: "$totalday.totalPaid" } } }
      ]);
      return result[0]?.total || 0;
    };

    // 5️⃣ Determine allowed leave & deduction per type
    let allowed = 0, deduction = 1;
    switch (this.leaveType) {
      case "Paid Leave":
        allowed = policy.paidLeaveDays || 0;
        deduction = 1;
        break;
      case "Short Leave":
        allowed = policy.shortLeaveCount || 0;
        deduction = policy.shortLeaveEquivalent || 0.25;
        break;
      case "Half Day":
        allowed = policy.halfDayCount || 0;
        deduction = policy.halfDayEquivalent || 0.5;
        break;
      case "Round Mark":
        allowed = policy.roundMarkCount || 0;
        deduction = policy.roundMarkMinutes || 15;
        break;
      case "Unpaid Leave":
        this.totalday.totalUnpaid = totalBusinessDays;
        return;
    }


    // 6️⃣ Calculate paid/unpaid
    const used = await usedLeaves(this.leaveType);
    const remainingAllowed = Math.max(0, allowed - used);

    if (totalBusinessDays <= remainingAllowed) {
      this.totalday.totalPaid = totalBusinessDays * deduction;
      this.totalday.totalUnpaid = 0;
    } else {
      this.totalday.totalPaid = remainingAllowed * deduction;
      this.totalday.totalUnpaid = (totalBusinessDays - remainingAllowed) * deduction;
    }
// console.log("policy:", policy, "allowed:", allowed, "used:", used, "totalBusinessDays:", totalBusinessDays);
  } catch (err) {
    console.error("Leave calculation error:", err);
    throw err;
  }
});



const LeaveModel = mongoose.model("Leave_Table", leavesSchema);
export default LeaveModel;
