import Joi from "joi";

export const licenseSchemaJoi = Joi.object({
    licenseId: Joi.string()
        .uppercase()
        .pattern(/^[A-Z0-9]{10}$/)
        .forbidden() 
        .messages({
            "string.pattern.base": "License ID must be exactly 10 characters (A-Z, 0-9 only)",
            "string.empty": "License ID is required"
        }),

    companyName: Joi.string()
        .min(2)
        .max(70)
        .required(),

    registrationNumber: Joi.string()
        .pattern(/^[A-Z][0-9]{3,}$/i)
        .required()
        .messages({
            "string.pattern.base": "Invalid registration number"
        }),

    gstNumber: Joi.string()
        .uppercase()
        .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid GST number"
        }),

    companyPhone: Joi.object({
        phone: Joi.string()
            .pattern(/^\+?[0-9]{7,15}$/)
            .required()
            .messages({
                "string.pattern.base": "Invalid phone number"
            }),
        isVerified: Joi.boolean().optional()
    }).required(),

    companyEmail: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                "string.email": "Invalid email address"
            }),
        isVerified: Joi.boolean().optional()
    }).required(),

    maxUser: Joi.number()
        .min(1)
        .max(1000)
        .optional(),

    activeUser: Joi.number()
        .integer()
        .min(0)
        .max(1000)
        .optional(),

    status: Joi.string()
        .valid("ACTIVE", "INACTIVE", "SUSPENDED")
        .optional(),

    expiresAt: Joi.date()
        .greater("now")
        .required()
        .messages({
            "date.greater": "License expiry date must be in the future"
        })
});
