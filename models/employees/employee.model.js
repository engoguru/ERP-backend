import mongoose from "mongoose";

/** Salary Structure (embedded) */
const salaryStructureSchema = new mongoose.Schema(
  {
    ctc: { type: Number, required: true },

    // Earnings
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },

    // Deductions
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
     esiCode: { type: String, default: "0" },  // use string to avoid precision loss
    pfCode: { type: String, default: "0" },
    professionalTax: { type: Number, default: 0 },
    gratuity: { type: Number, default: 0 },

    // Totals
    grossSalary: { type: Number, default: 0 },
    totalDeduction: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },

    effectiveFrom: { type: Date, required: true }
  },
  { _id: false }
);

/** Auto-calculate totals before saving */
salaryStructureSchema.pre("save", function () {
  this.grossSalary = this.basic + this.hra + this.otherAllowance;
  this.totalDeduction = this.pf + this.esi + this.professionalTax;
  this.netSalary = this.grossSalary - this.totalDeduction;
});

/** Bank Details (embedded) */
const bankSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    bankIfscCode: { type: String, required: true, trim: true, uppercase: true, match: /^[A-Z]{4}0[A-Z0-9]{6}$/ },
    branchName: { type: String, trim: true, default: "" },
    accountNumber: { type: String, required: true, trim: true, match: /^[0-9]{9,18}$/ },
    accountType: { type: String, enum: ["SAVINGS", "CURRENT", "SALARY"], default: "SAVINGS" }
  },
  { _id: false }
);

/** Employee Schema */
const employeeSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true, minlength: 2 },
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^EMP\d{4}$/ // EMP + 4 digits
    },
    department: { type: String, required: true, trim: true },

    // Contact
    employeeEmail: {
      email: { type: String, required: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      isVerified: { type: Boolean, default: false }
    },
    employeeContact: {
      contact: { type: String, required: true, match: /^\+?[0-9]{7,15}$/ },
      isVerified: { type: Boolean, default: false }
    },
    emgContact: {
      contact: {
        type: String,
        required: true,
        match: /^\+?[0-9]{7,15}$/ // phone number
      },
      relation: {
        type: String,
        required: true,
        enum: [
          'Father',
          'Mother',
          'Spouse',
          'Sibling',
          'Friend',
          'Guardian',
          'Other'
        ]
      },
      isVerified: {
        type: Boolean,
        default: false
      }
    }
    ,
  dob: {
  type: Date,
  required: true,
  validate: {
    validator: function (value) {
      return value <= new Date();
    },
    message: 'Date of birth cannot be in the future'
  }
}
,

    bloodGroup: {
      type: String,
      required: true,
      enum: [
        'A+', 'A-',
        'B+', 'B-',
        'AB+', 'AB-',
        'O+', 'O-'
      ]
    }
    ,
    // Role & Status
    role: { type: String, required: true, trim: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    profilePic: { url: String, public_id: String },

    // Salary
    salaryStructure: { type: salaryStructureSchema, required: true },

    // HR Details
    shiftDetail: { shiftName: String, startTime: String, endTime: String },
    dateOfJoining: { type: Date, required: true },
    qualification: String,
    stationaryAlloted: { type: [String], default: [] },
    employeeDescription: String,

    // Identification
    pan: [{ url: String, public_id: String }],
    panNumber: {},
    aadhar: [{ url: String, public_id: String }],
    aadharNumber: {},

    // Address
    permanentAddress: String,
    localAddress: String,

    // Family
    fatherName: String,
    motherName: String,

    // Reporting
    // reportingManager: {  },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee_Table", // 🔥 THIS IS THE KEY
      default: null
    },

    balanceLeave: {
      year: { type: Number, },
      numberOfLeaves: {
        paidLeave: { type: Number, default: 0 },
        shortLeave: { type: Number, default: 0 },
        halfDay: { type: Number, default: 0 },
        roundMark: { type: Number, default: 0 }
      }
    },

    // Bank Details
    bankDetail: { type: [bankSchema], default: [] },

    // License
    licenseId: { type: mongoose.Schema.Types.ObjectId, ref: "LicenseTable", required: true }
  },
  { timestamps: true }
);

const EmployeeModel = mongoose.model("Employee_Table", employeeSchema);
export default EmployeeModel;
