import mongoose from "mongoose";

/** Attendance Schema */
const attendanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee_Table",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        inTime: {
            type: String,
            required: true
        },

        outTime: {
            type: String,
            required: true
        },

        workingHour: {
            type: Number, // store hours as number (e.g., 8.5)
            required: true
        },

        status: {
            type: String,
            enum: ["PRESENT", "ABSENT", "LEAVE", "HOLIDAY", "WFH"], // define possible statuses
            default: "PRESENT"
        },
        licenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LicenseTable", // reference to your License model
            required: true
        }
    },
    { timestamps: true }
);

const AttendanceModel = mongoose.model("Attendance_Table", attendanceSchema);

export default AttendanceModel;
