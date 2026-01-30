import Joi from "joi";
import mongoose from "mongoose";

export const employeeSchemaJoi = Joi.object({
  // Basic Info
  name: Joi.string().min(2).trim().required(),
  employeeCode: Joi.string()
    .uppercase()
    .trim()
    .pattern(/^EMP\d{4}$/)
    .required(),
  department: Joi.string().trim().required(),

  // Contact
  employeeEmail: Joi.object({
    email: Joi.string().email().lowercase().required(),
    isVerified: Joi.boolean().default(false)
  }).required(),

  employeeContact: Joi.object({
    contact: Joi.string().pattern(/^\+?[0-9]{7,15}$/).required(),
    isVerified: Joi.boolean().default(false)
  }).required(),

  // Role & Status
  role: Joi.string().trim().required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
  // profilePic: Joi.object({
  //   url: Joi.string().uri().optional(),
  //   public_id: Joi.string().optional()
  // }).optional(),

  // Salary Structure
  // salaryStructure: Joi.object({
  //   ctc: Joi.number().required(),

  //   // Earnings
  //   basic: Joi.number().default(0),
  //   hra: Joi.number().default(0),
  //   otherAllowance: Joi.number().default(0),

  //   // Deductions
  //   pf: Joi.number().default(0),
  //   esi: Joi.number().default(0),
  //   professionalTax: Joi.number().default(0),
  //   gratuity: Joi.number().default(0),

  //   // Totals (calculated backend)
  //   grossSalary: Joi.number().default(0),
  //   totalDeduction: Joi.number().default(0),
  //   netSalary: Joi.number().default(0),

  //   effectiveFrom: Joi.date().required()
  // }).required(),

  // HR Details
  shiftDetail: Joi.object({
    shiftName: Joi.string().optional(),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional()
  }).optional(),

  dateOfJoining: Joi.date().required(),
  qualification: Joi.string().optional(),
  stationaryAlloted: Joi.array().items(Joi.string()).default([]),
  employeeDescription: Joi.string().optional(),

  // Identification
  pan: Joi.object({ url: Joi.string().uri().optional(), public_id: Joi.string().optional() }).optional(),
  aadhar: Joi.object({ url: Joi.string().uri().optional(), public_id: Joi.string().optional() }).optional(),

  // Address
  permanentAddress: Joi.string().optional(),
  localAddress: Joi.string().optional(),

  // Family
  fatherName: Joi.string().optional(),
  motherName: Joi.string().optional(),

  // Reporting (ObjectId reference)
  // reportingManager: Joi.string().custom((value, helpers) => {
  //   if (!mongoose.Types.ObjectId.isValid(value)) {
  //     return helpers.error("any.invalid");
  //   }
  //   return value;
  // }).optional(),

  // Bank Details
  bankDetail: Joi.array()
    .items(
      Joi.object({
        bankName: Joi.string().min(2).max(50).required(),
        bankIfscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
        branchName: Joi.string().optional(),
        accountNumber: Joi.string().pattern(/^[0-9]{9,18}$/).required(),
        accountType: Joi.string().valid("SAVINGS", "CURRENT", "SALARY").default("SAVINGS")
      })
    )
    .default([]),

  // Leave Balance
  // balanceLeave: Joi.object({
  //   year: Joi.number().required(),
  //   numberOfLeaves: Joi.object({
  //     paidLeave: Joi.number().min(0).default(0),
  //     shortLeave: Joi.number().min(0).default(0),
  //     halfDay: Joi.number().min(0).default(0),
  //     roundMark: Joi.number().min(0).default(0)
  //   })
  // }).optional(),

  // LicenseId (ObjectId reference)
  licenseId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }).required()
});
