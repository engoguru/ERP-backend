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

payrollSchema.pre("save", async function (next) {
    try {
        const { employeeId, licenseId } = this;

        /* ================= Date Range (Current Month) ================= */
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const daysInMonth = endOfMonth.getDate();

        /* ================= Employee Salary Structure ================= */
        const employee = await EmployeeModel.findOne({ _id: employeeId, licenseId });
        if (!employee) return next(new Error("Employee not found"));

        const salary = employee.salaryStructure;
        if (!salary) return next(new Error("Employee salary structure missing"));

        // Update Payroll earnings & deductions
        this.earnings = {
            basic: salary.basic,
            hra: salary.hra,
            bonus: salary.bonus || 0,
            otherAllowance: salary.otherAllowance,
            grossSalary: salary.grossSalary
        };

        this.deductions = {
            pf: salary.pf,
            esi: salary.esi,
            professionalTax: salary.professionalTax,
            gratuity: salary.gratuity,
            totalDeduction: salary.totalDeduction
        };

        const netSalary = salary.netSalary;

        /* ================= Company Configuration ================= */
        const companyConfig = await companyConfigureModel.findOne({ licenseId });
        if (!companyConfig) return next(new Error("Company configuration not found"));

        const policy = companyConfig.monthlyPolicy;

        /* ================= Week Off Calculation ================= */
        const weekOffDays = companyConfig.weeklyOff?.days || [];
        const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

        let fixedOffDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), day);
            if (weekOffDays.includes(DAY_NAMES[date.getDay()])) fixedOffDays++;
        }

        /* ================= Holidays ================= */
        const holidayAgg = await eventModel.aggregate([
            {
                $match: {
                    employeeId,
                    licenseId,
                    startDate: { $lte: endOfMonth },
                    endDate: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalHoliday: { $sum: "$totaldays" }
                }
            }
        ]);
        const holidayDays = holidayAgg[0]?.totalHoliday || 0;

        /* ================= Attendance ================= */
        const attendanceCount = await AttendanceModel.countDocuments({
            employeeId,
            licenseId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        /* ================= Leaves ================= */
        const leaveAgg = await leavesModel.aggregate([
            {
                $match: {
                    employeeId,
                    licenseId,
                    status: "Approved",
                    fromDate: { $lte: endOfMonth },
                    toDate: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: "$leaveType",
                    unpaid: { $sum: "$totalday.totalUnpaid" }
                }
            }
        ]);

        let unpaidPaidLeave = 0, unpaidShortLeave = 0, unpaidHalfDay = 0, unpaidRoundMark = 0;

        for (const leave of leaveAgg) {
            switch (leave._id) {
                case "Paid Leave": unpaidPaidLeave = leave.unpaid; break;
                case "Short Leave": unpaidShortLeave = leave.unpaid; break;
                case "Half Day": unpaidHalfDay = leave.unpaid; break;
                case "Round Mark": unpaidRoundMark = leave.unpaid; break;
            }
        }

        /* ================= Company Working Days ================= */
        const companyWorkingDays = daysInMonth - fixedOffDays - holidayDays;
        const extraDaysWorked = Math.max(0, attendanceCount - companyWorkingDays);

        /* ================= Salary Adjustments ================= */
        const perDaySalary = netSalary / daysInMonth;

        const paidLeaveDeduction = unpaidPaidLeave * (policy.paidLeaveDeduction || 0);
        const shortLeaveDeduction = unpaidShortLeave * (policy.shortLeaveDeduction || 0);
        const halfDayDeduction = unpaidHalfDay * (policy.halfDayDeduction || 0);
        const roundMarkDeduction = unpaidRoundMark * (policy.roundMarkDeduction || 0);

        const totalUnpaidDeduction = paidLeaveDeduction + shortLeaveDeduction + halfDayDeduction + roundMarkDeduction;

        const finalSalary = netSalary + extraDaysWorked * perDaySalary - totalUnpaidDeduction;

        /* ================= Assign Payroll Values ================= */
        this.netSalary = Math.round(finalSalary);
        this.extraDay = extraDaysWorked;
        this.totalEmployeeWorkingDays = attendanceCount;
        this.currentMonthWorkingdays = companyWorkingDays;

        this.leaveDays = {
            UnpaidLeave: unpaidPaidLeave,
            UnpaidshortLeave: unpaidShortLeave,
            UnpaidhalfDay: unpaidHalfDay,
            UnpaidroundMark: unpaidRoundMark
        };

        this.lopDays = unpaidPaidLeave + unpaidShortLeave + unpaidHalfDay + unpaidRoundMark;

        next();
    } catch (error) {
        next(error);
    }
});



const payrollModel = mongoose.model("Payroll", payrollSchema);
export default payrollModel;
