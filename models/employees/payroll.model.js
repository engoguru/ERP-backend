// employeeId (ref)

import mongoose from "mongoose";

import leavesModel from "./leaves.model.js";
import AttendanceModel from "./attendance.model.js";
import EmployeeModel from "./employee.model.js";
import eventModel from "./event.model.js";
import companyConfigureModel from "../companyConfigure.model.js";



const payrollSchema = new mongoose.Schema(
    {
        // References
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee_Table",
            required: true
        },

        // Earnings (Snapshot from salary structure)
        earnings: {
            basic: {
                type: Number,
                default: 0
            },
            hra: {
                type: Number,
                default: 0
            },
            bonus: {
                type: Number,
                default: 0
            },
            otherAllowance: {
                type: Number,
                default: 0
            },
            grossSalary: {
                type: Number,
                default: 0
            }
        },

        // Deductions
        deductions: {
            pf: {
                type: Number,
                default: 0
            },
            esi: {
                type: Number,
                default: 0
            },
            professionalTax: {
                type: Number,
                default: 0
            },
            gratuity: {
                type: Number,
                default: 0
            },
            totalDeduction: {
                type: Number,
                default: 0
            }
        },

        // Attendance 
        totalEmployeeWorkingDays: {
            type: Number,
            default: 0
        },
        currentMonthWorkingdays: {
            type: Number,
            default: 0
        },
        leaveDays: {
            UnpaidLeave: { type: Number, default: 0 },
            // remaining paid leaves
            UnpaidshortLeave: { type: Number, default: 0 },     // remaining short leaves
            UnpaidhalfDay: { type: Number, default: 0 },        // remaining half days
            UnpaidroundMark: { type: Number, default: 0 }       // remaining round mark occurrences
        },
        lopDays: {
            type: Number,
            default: 0
        }, // Loss of Pay

        // Final Pay
        netSalary: {
            type: Number,
            default: 0
        },

        extraDay: {
            type: Number,
            default: 0
        },
        bonus: {
            type: Number,
            default: 0
        },
        // Payment Info
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "On Hold"],
            default: "Pending"
        },

        paymentDate: {
            type: Date,
            default: Date.now
        },

        remarks: {
            type: String
        },
        licenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LicenseTable",
            required: true
        }
    },
    { timestamps: true }
);

payrollSchema.pre("save", function () {
  this.deductions.totalDeduction =
    this.deductions.pf +
    this.deductions.esi +
    this.deductions.professionalTax +
    this.deductions.gratuity;
});




const payrollModel = mongoose.model("Payroll", payrollSchema);
export default payrollModel;
