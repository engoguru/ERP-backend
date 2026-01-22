import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid ObjectId");
    }
    return value;
};

export const eventSchemaJoi = Joi.object({
    eventName: Joi.string().trim().required(),

    startDate: Joi.date().required(),

    endDate: Joi.date()
        .greater(Joi.ref("startDate"))
        .required()
        .messages({
            "date.greater": "endDate must be after startDate"
        }),
    totaldays: Joi.optional(),

    description: Joi.string().optional(),

    licenseId: Joi.string().custom(objectId).required(),

    employeeId: Joi.string().custom(objectId).required()
});
