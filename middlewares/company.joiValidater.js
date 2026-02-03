import Joi from "joi";

const branchSchemaJoi = Joi.object({

    nickName: Joi.string().min(2).max(70).optional(),

companyPhone: Joi.object({
    phone: Joi.string()
        .pattern(/^\+?[0-9]{7,15}$/)
        .required()
        .messages({ 'string.pattern.base': 'Invalid phone number' }),
    isVerified: Joi.boolean().optional()
}).required(),


 companyEmail: Joi.object({
    email: Joi.string()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        .required()
        .messages({ 'string.pattern.base': 'Invalid Email' }),
    isVerified: Joi.boolean().optional()
}).required(),



    companyWebUrl: Joi.object({
        website: Joi.string().uri().optional(),
        instagram: Joi.string().uri().optional(),
        facebook: Joi.string().uri().optional(),
        linkedin: Joi.string().uri().optional(),
        twitter: Joi.string().uri().optional(),
        youtube: Joi.string().uri().optional()
    }).optional(),

    headOffice: Joi.boolean().optional(),

    address: Joi.string().max(255).optional()
})

export const companySchemaJoi = Joi.object({
    companyName: Joi.string()
        .min(2)
        .max(70)
        .required(),

   registrationNumber: Joi.string()
  .pattern(/^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/)
  .length(21)
  .required()
  .messages({
    'string.pattern.base': 'Invalid Indian company registration number (CIN)',
    'string.length': 'CIN must be exactly 21 characters'
  }),


    registrationDate: Joi.date()
        .max('now')
        .required()
        .messages({
            'date.max': 'Registration date cannot be in the future'
        }),

    gstNumber: Joi.string()
        .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid GST number'
        }),

    panCard: Joi.array().items(
        Joi.object({
            url: Joi.string().uri().optional(),
            public_Id: Joi.string().optional()
        })
    ).min(1).required(),


    companyLogo: Joi.object({
        url: Joi.string().uri().optional(),
        public_Id: Joi.string().optional()
    }).required(),

    companyBranch: Joi.array()
        .items(branchSchemaJoi)
        .min(1)
        .required()

})