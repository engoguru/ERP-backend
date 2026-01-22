import mongoose from "mongoose";

const companyConfigureSchema = new mongoose.Schema(
  {
    leadForm: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    roles: [
      {
        department: { type: String },
        roles: { type: [String], default: [] }
      }
    ],

    permissions: [
      {
        department: { type: String },
        roleName: { type: String },
        permission: {
          type: [String],
          default: []
        }
      }
    ],

    holiday: {
  // Weekly Off Configuration
  weeklyOff: {
    count: { type: Number, default: 2 },
    days: [
      {
        type: String,
        enum: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ]
      }
    ],
    isPaid: { type: Boolean, default: true }
  },

  // Monthly Leave / Attendance Policy
  monthlyPolicy: {
  mode: {
    type: String,
    enum: ["Paid Leave", "Short Leave", "Half Day", "Round Mark"],
   
  },

  // ===== PAID LEAVE =====
  paidLeaveDays: {
    type: Number,
    default: 0
  },
  paidLeaveDeduction: {   // deduction amount per extra day beyond allowed
    type: Number,
    default: 0
  },

  // ===== SHORT LEAVE =====
  shortLeaveCount: {
    type: Number,
    default: 0
  },
  shortLeaveEquivalent: {
    type: Number,
    default: 0.25 // 1 short leave = 0.25 day
  },
  shortLeaveDeduction: {   // deduction per extra short leave (can be fractional)
    type: Number,
    default: 0
  },

  // ===== HALF DAY =====
  halfDayCount: {
    type: Number,
    default: 0
  },
  halfDayEquivalent: {
    type: Number,
    default: 0.5
  },
  halfDayDeduction: {     // deduction per extra half day
    type: Number,
    default: 0
  },

  // ===== ROUND MARK (Late/Early grace) =====
  roundMarkCount: {
    type: Number,
    default: 0
  },
  roundMarkMinutes: {
    type: Number,
    default: 15 // minutes
  },
  roundMarkDeduction: {   // deduction per extra round mark (minutes)
    type: Number,
    default: 0
  }
}

}
,

    licenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LicenseTable",
      // unique: true,
      required: true
    }
  },
  { timestamps: true }
);

const companyConfigureModel = mongoose.model(
  "CompanyConfigureTable",
  companyConfigureSchema
);

export default companyConfigureModel;
