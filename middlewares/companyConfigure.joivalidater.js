import Joi from "joi";

export const companyConfigureSchemaJoi = Joi.object({
  leadForm: Joi.array()
    .items(Joi.object().unknown(true)) // allow any keys inside each leadForm item
    .optional(),

  roles: Joi.array()
    .items(
      Joi.object({
        department: Joi.string().trim().optional(),
        roles: Joi.array().items(Joi.string().trim()).optional()
      })
    )
    .optional(),

  permissions: Joi.array()
    .items(
      Joi.object({
        department: Joi.string().trim().optional(),
        roleName: Joi.string().trim().optional(),
        permission: Joi.array().items(Joi.string().trim()).optional()
      })
    )
    .optional(),

  // Holiday / Leave Policy
 holiday: Joi.object({
  weeklyOff: Joi.object({
    count: Joi.number().integer().min(0).default(2),
    days: Joi.array()
      .items(
        Joi.string().valid(
          "Sunday", "Monday", "Tuesday",
          "Wednesday", "Thursday", "Friday", "Saturday"
        )
      )
      .optional(),
    isPaid: Joi.boolean().default(true)
  }),

  monthlyPolicy: Joi.object({
    paidLeaveDays: Joi.number().integer().min(0).default(0),
    paidLeaveDeduction: Joi.number().min(0).default(0),        // ✅ Add this
    shortLeaveCount: Joi.number().integer().min(0).default(0),
    shortLeaveEquivalent: Joi.number().min(0).default(0.25),
    shortLeaveDeduction: Joi.number().min(0).default(0),        // ✅ Add this
    halfDayCount: Joi.number().integer().min(0).default(0),
    halfDayEquivalent: Joi.number().min(0).default(0.5),
    halfDayDeduction: Joi.number().min(0).default(0),           // ✅ Add this
    roundMarkCount: Joi.number().integer().min(0).default(0),
    roundMarkMinutes: Joi.number().integer().min(0).default(15),
    roundMarkDeduction: Joi.number().min(0).default(0)          // ✅ Add this
  }).optional()
}).optional()


 
});
