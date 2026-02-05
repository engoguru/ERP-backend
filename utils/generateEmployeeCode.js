import EmployeeModel from "../models/employees/employee.model.js";

export const generateEmployeeCode = async (licenseId) => {
  const prefix = "EMP";

  // Get last employee sorted by createdAt
  const lastEmployee = await EmployeeModel
    .findOne({licenseId:licenseId}, { employeeCode: 1 })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1;

  if (lastEmployee?.employeeCode) {
    const match = lastEmployee.employeeCode.match(/\d+/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }

  // Pad with zeros → EMP001
  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
};
