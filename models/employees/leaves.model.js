import mongoose from "mongoose";
import companyConfigureModel from "../companyConfigure.model.js";

const leavesSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee_Table",
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  leaveType: {
    type: String,
    enum: ["Short Leave", "Paid Leave", "Half Day", "Round Mark"],
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

// Helper: inclusive days between from and to dates
const getDiffDays = (from, to) => {
  const diff = Math.floor((new Date(to) - new Date(from)) / 86400000);
  return diff >= 0 ? diff + 1 : 1; // at least 1 day
};

// ===== Pre-save hook to calculate leave totals =====
leavesSchema.pre("save", async function (next) {
  try {
    this.totalday = { totalPaid: 0, totalUnpaid: 0 };

    const diffDays = getDiffDays(this.fromDate, this.toDate);

    // Fetch company leave policy
    const companyConfig = await companyConfigureModel.findOne({ licenseId: this.licenseId });
    if (!companyConfig) return next(new Error("Company leave policy not found!"));

    const policy = companyConfig.monthlyPolicy || {};

    switch (this.leaveType) {

      // ===== PAID LEAVE =====
      case "Paid Leave": {
        const allowedPaid = policy.paidLeaveDays || 0;

        const usedPaid = await mongoose.model("Leave_Table").aggregate([
          { $match: { employeeId: this.employeeId, leaveType: "Paid Leave", licenseId: this.licenseId } },
          { $group: { _id: null, total: { $sum: "$totalday.totalPaid" } } }
        ]);
        const used = usedPaid[0]?.total || 0;

        if (used + diffDays <= allowedPaid) {
          this.totalday.totalPaid = diffDays;
        } else {
          this.totalday.totalPaid = Math.max(0, allowedPaid - used);
          this.totalday.totalUnpaid = diffDays - this.totalday.totalPaid;
        }
        break;
      }

      // ===== SHORT LEAVE =====
      case "Short Leave": {
        const maxShort = policy.shortLeaveCount || 0;
        const equivalent = policy.shortLeaveEquivalent || 0.25;

        const usedShort = await mongoose.model("Leave_Table").aggregate([
          { $match: { employeeId: this.employeeId, leaveType: "Short Leave", licenseId: this.licenseId } },
          { $group: { _id: null, total: { $sum: "$totalday.totalPaid" } } }
        ]);
        const used = usedShort[0]?.total || 0;
        const allowedInDays = maxShort * equivalent;

        if (used + diffDays * equivalent <= allowedInDays) {
          this.totalday.totalPaid = diffDays * equivalent;
        } else {
          const remaining = Math.max(0, allowedInDays - used);
          this.totalday.totalPaid = remaining;
          this.totalday.totalUnpaid = diffDays * equivalent - remaining;
        }
        break;
      }

      // ===== HALF DAY =====
      case "Half Day": {
        const maxHalf = policy.halfDayCount || 0;
        const equivalent = policy.halfDayEquivalent || 0.5;

        const usedHalf = await mongoose.model("Leave_Table").aggregate([
          { $match: { employeeId: this.employeeId, leaveType: "Half Day", licenseId: this.licenseId } },
          { $group: { _id: null, total: { $sum: "$totalday.totalPaid" } } }
        ]);
        const used = usedHalf[0]?.total || 0;
        const allowedInDays = maxHalf * equivalent;

        if (used + equivalent <= allowedInDays) {
          this.totalday.totalPaid = equivalent;
        } else {
          const remaining = Math.max(0, allowedInDays - used);
          this.totalday.totalPaid = remaining;
          this.totalday.totalUnpaid = equivalent - remaining;
        }
        break;
      }

      // ===== UNPAID LEAVE =====
      case "Unpaid Leave": {
        const allowedPaid = policy.paidLeaveDays || 0;

        const usedPaid = await mongoose.model("Leave_Table").aggregate([
          { $match: { employeeId: this.employeeId, leaveType: "Paid Leave", licenseId: this.licenseId } },
          { $group: { _id: null, total: { $sum: "$totalday.totalPaid" } } }
        ]);
        const used = usedPaid[0]?.total || 0;

        if (used < allowedPaid) {
          const remainingPaid = allowedPaid - used;
          if (diffDays <= remainingPaid) {
            this.totalday.totalPaid = diffDays;
          } else {
            this.totalday.totalPaid = remainingPaid;
            this.totalday.totalUnpaid = diffDays - remainingPaid;
          }
        } else {
          this.totalday.totalPaid = 0;
          this.totalday.totalUnpaid = diffDays;
        }
        break;
      }

      // ===== ROUND MARK =====
      case "Round Mark": {
        const allowedCount = policy.roundMarkCount || 0;
        const perMarkMinutes = policy.roundMarkMinutes || 15;

        const usedMarks = await mongoose.model("Leave_Table").aggregate([
          { $match: { employeeId: this.employeeId, leaveType: "Round Mark", licenseId: this.licenseId } },
          { $group: { _id: null, total: { $sum: "$totalday.totalPaid" } } }
        ]);
        const used = usedMarks[0]?.total || 0;

        const totalMinutes = perMarkMinutes * getDiffDays(this.fromDate, this.toDate);
        if (used + totalMinutes <= allowedCount * perMarkMinutes) {
          this.totalday.totalPaid = totalMinutes;
        } else {
          const excess = used + totalMinutes - allowedCount * perMarkMinutes;
          this.totalday.totalPaid = Math.max(0, totalMinutes - excess);
          this.totalday.totalUnpaid = excess;
        }
        break;
      }

      default:
        break;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const leavesModel = mongoose.model("Leave_Table", leavesSchema);
export default leavesModel;
