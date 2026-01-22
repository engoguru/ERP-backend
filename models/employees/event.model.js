import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totaldays: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    licenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LicenseTable",
        required: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee_Table",
        required: true
    },
});

const eventModel = mongoose.model("Event_Table", eventSchema);

export default eventModel;