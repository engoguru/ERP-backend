import cron from "node-cron";
// import EmployeeModel from "../models/employee.model.js";
import { payrollQueue } from "../config/payrollBullMq.js";
import EmployeeModel from "../models/employees/employee.model.js";
export function startPayrollCron() {
cron.schedule("57 14 * * *", async () => {
  console.log(" Payroll cron triggered");

  try {
    /* ========== Previous Month ========== */
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const month = prevMonthDate.getMonth() + 1;
    const year = prevMonthDate.getFullYear();
  
    /* ========== Active Employees ========== */
    const employees = await EmployeeModel.find({ status: "ACTIVE" })
      .select("_id licenseId");

    console.log(` Employees found: ${employees.length}`,employees);

    /* ========== Enqueue Jobs ========== */
    for (const emp of employees) {
      const existingJob = await payrollQueue.getJob(`payroll12-${emp._id}-${month}-${year}`);
  if (existingJob) {
    await existingJob.remove();
  }
      await payrollQueue.add(
        "calculate-payroll",
        {
          employeeId: emp._id,
          licenseId: emp.licenseId,
          month,
          year
        },
        {
          jobId: `payroll12-${emp._id}-${month}-${year}`,//  dedupe
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false
        }
      );
    }

    console.log(" Payroll jobs queued successfully");
  } catch (error) {
    console.error(" Payroll cron failed", error);
  }
},{
  timezone: "Asia/Kolkata"
})};








