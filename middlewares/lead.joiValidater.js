import Joi from "joi";

export const leadSchemaJoi = Joi.object({

    version: Joi.number()
        .integer()
        .min(1)
        .optional(),

   
});




