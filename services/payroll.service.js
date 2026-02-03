
import leavesModel from "../models/employees/leaves.model.js";
import AttendanceModel from "../models/employees/attendance.model.js";
import EmployeeModel from "../models/employees/employee.model.js";
import eventModel from "../models/employees/event.model.js";
import companyConfigureModel from "../models/companyConfigure.model.js";

/**
 * Calculate payroll for a single employee for a given month
 */
export const calculatePayroll = async ({ employeeId, licenseId, month, year }) => {
  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  const daysInMonth = endOfMonth.getDate();

  // Employee
  const employee = await EmployeeModel.findOne({ _id: employeeId, licenseId });
  if (!employee) throw new Error("Employee not found");
  const salary = employee.salaryStructure;
  if (!salary) throw new Error("Salary structure missing");

  // Company Config
  const companyConfig = await companyConfigureModel.findOne({ licenseId });
  if (!companyConfig) throw new Error("Company configuration not found");
  const policy = companyConfig.monthlyPolicy;

  // Weekly Off
  const weekOffDays = companyConfig.weeklyOff?.days || [];
  const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let fixedOffDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (weekOffDays.includes(DAY_NAMES[date.getDay()])) fixedOffDays++;
  }

  // Holidays
  const holidayAgg = await eventModel.aggregate([
    { $match: { employeeId, licenseId, startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: "$totaldays" } } }
  ]);
  const holidayDays = holidayAgg[0]?.total || 0;

  // Attendance
  const attendanceCount = await AttendanceModel.countDocuments({
    employeeId,
    licenseId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });

  // Leaves
  const leaveAgg = await leavesModel.aggregate([
    { $match: { employeeId, licenseId, status: "Approved", fromDate: { $lte: endOfMonth }, toDate: { $gte: startOfMonth } } },
    { $group: { _id: "$leaveType", unpaid: { $sum: "$totalday.totalUnpaid" } } }
  ]);

  let unpaidPaidLeave = 0, unpaidShortLeave = 0, unpaidHalfDay = 0, unpaidRoundMark = 0;
  for (const leave of leaveAgg) {
    if (leave._id === "Paid Leave") unpaidPaidLeave = leave.unpaid;
    if (leave._id === "Short Leave") unpaidShortLeave = leave.unpaid;
    if (leave._id === "Half Day") unpaidHalfDay = leave.unpaid;
    if (leave._id === "Round Mark") unpaidRoundMark = leave.unpaid;
  }

  // Company working days
  const companyWorkingDays = daysInMonth - fixedOffDays - holidayDays;

  // Extra Days
  const extraDaysWorked = Math.max(0, attendanceCount - companyWorkingDays);

  // Per day salary
  const perDaySalary = salary.netSalary / companyWorkingDays;

  // Deduction based on leaves
  const unpaidDeduction =
    unpaidPaidLeave * (policy?.paidLeaveDeduction || 0) +
    unpaidShortLeave * (policy?.shortLeaveDeduction || 0) +
    unpaidHalfDay * (policy?.halfDayDeduction || 0) +
    unpaidRoundMark * (policy?.roundMarkDeduction || 0);

  // Final net salary
  const netSalary = Math.max(0, Math.round(attendanceCount * perDaySalary - unpaidDeduction + extraDaysWorked * perDaySalary));

  return {
    earnings: {
      basic: salary.basic,
      hra: salary.hra,
      bonus: salary.bonus || 0,
      otherAllowance: salary.otherAllowance,
      grossSalary: salary.grossSalary
    },
    deductions: {
      pf: salary.pf,
      esi: salary.esi,
      professionalTax: salary.professionalTax,
      gratuity: salary.gratuity,
      totalDeduction: salary.totalDeduction
    },
    currentMonthSalary: salary.netSalary, // full salary reference
    netSalary,                             // calculated salary
    extraDay: extraDaysWorked,
    totalEmployeeWorkingDays: attendanceCount,
    currentMonthWorkingdays: companyWorkingDays,
    leaveDays: {
      UnpaidLeave: unpaidPaidLeave,
      UnpaidshortLeave: unpaidShortLeave,
      UnpaidhalfDay: unpaidHalfDay,
      UnpaidroundMark: unpaidRoundMark
    },
    lopDays: unpaidPaidLeave + unpaidShortLeave + unpaidHalfDay + unpaidRoundMark
  };
};
