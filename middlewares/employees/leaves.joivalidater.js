import Joi from "joi";

export const leavesSchemaJoi = Joi.object({
  employeeId: Joi.string().trim().required(),

  fromDate: Joi.date().required(),

  toDate: Joi.date()
    .required()
    .min(Joi.ref("fromDate"))
    .messages({ "date.min": "`toDate` must be greater than or equal to `fromDate`" }),

  leaveType: Joi.string()
    .valid("Short Leave", "Paid Leave", "Half Day", "Round Mark" )
    .required(),

  approvedBy: Joi.string().optional(),

  totalday: Joi.object({
    totalPaid: Joi.number().min(0).default(0),
    totalUnpaid: Joi.number().min(0).default(0)
  }).optional(),

  status: Joi.string().valid("Pending", "Approved", "Reject").default("Pending"),

  licenseId: Joi.string().trim().required()
});
