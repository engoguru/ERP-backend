import Joi from "joi";

const objectId = Joi.string().length(24).hex();

export const payrollSchemaJoi = Joi.object({
  employeeId: objectId.required(),

  earnings: Joi.object({
    basic: Joi.number().min(0).optional(),
    hra: Joi.number().min(0).optional(),
    bonus: Joi.number().min(0).optional(),
    otherAllowance: Joi.number().min(0).optional(),
    grossSalary: Joi.forbidden() // calculated by backend
  }).optional(),

  deductions: Joi.object({
    pf: Joi.number().min(0).optional(),
    esi: Joi.number().min(0).optional(),
    professionalTax: Joi.number().min(0).optional(),
    gratuity: Joi.number().min(0).optional(),
    totalDeduction: Joi.forbidden() // calculated by backend
  }).optional(),

  totalEmployeeWorkingDays: Joi.number().min(0).optional(),
  currentMonthWorkingDays: Joi.number().min(0).optional(),

  leaveDays: Joi.object({
    unpaidLeave: Joi.number().min(0).optional(),
    unpaidshortLeave: Joi.number().min(0).optional(),
    unpaidhalfDay: Joi.number().min(0).optional(),
    unpaidroundMark: Joi.number().min(0).optional()
  }).optional(),

  lopDays: Joi.number().min(0).optional(),

  netSalary: Joi.forbidden(), // calculated by backend

  extraDay: Joi.number().min(0).optional(),
  bonus: Joi.number().min(0).optional(),

  paymentStatus: Joi.string()
    .valid("Pending", "Paid", "On Hold")
    .optional(),

  paymentDate: Joi.date().optional(),
  remarks: Joi.string().allow("").optional(),
  licenseId: objectId.required()
});
