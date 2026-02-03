import Joi from "joi";

export const leavesSchemaJoi = Joi.object({
  employeeId: Joi.string().trim().required(),

  fromDate: Joi.date().required(),

  toDate: Joi.date()
    .min(Joi.ref("fromDate"))
    .required()
    .messages({
      "date.min": "`toDate` must be >= `fromDate`"
    }),

  leaveType: Joi.string()
    .valid("Short Leave", "Paid Leave", "Half Day", "Round Mark", "Unpaid Leave")
    .required(),

  approvedBy: Joi.string().optional(),

  reason: Joi.string().allow("").optional(),

  licenseId: Joi.string().trim().required()
})
  .options({ stripUnknown: true });
