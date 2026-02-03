import Joi from "joi";

export const attendanceSchemaJoi = Joi.object({
  employeeId: Joi.string()
    .trim()
    .required()
    .messages({ "any.required": "Employee ID is required" }),

  date: Joi.date()
    .required()
    .messages({ "any.required": "Attendance date is required" }),

  inTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // HH:mm 24-hour format
    .required()
    .messages({ "any.required": "In time is required", "string.pattern.base": "In time must be in HH:mm format" }),

  // outTime: Joi.string()
  //   .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // HH:mm 24-hour format
  //   .required()
  //   .messages({ "any.required": "Out time is required", "string.pattern.base": "Out time must be in HH:mm format" }),

  // workingHour: Joi.number()
  //   .min(0)
  //   .max(24)
  //   .required()
  //   .messages({ "any.required": "Working hour is required", "number.base": "Working hour must be a number" }),

  status: Joi.string()
    .valid("PRESENT", "ABSENT", "LEAVE", "HOLIDAY", "WFH")
    .default("PRESENT"),

  licenseId: Joi.string()
    .trim()
    .required()
    .messages({ "any.required": "License ID is required" })
});
