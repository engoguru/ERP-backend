import dotenv from "dotenv";
dotenv.config();
import { Worker } from "bullmq";
import { PAYROLL_QUEUE } from "../config/payrollBullMq.js";
import { calculatePayroll } from "../services/payroll.service.js";
import payrollModel from "../models/employees/payroll.model.js";
// import redis from "../config/redis.js";
import redis from "../config/redis.js";

export default function startPayrollWorker() {
  const payrollWorker = new Worker(
    PAYROLL_QUEUE,
    async (job) => {
      try {
        const { employeeId, licenseId, month, year } = job.data;

        // ------------------------------
        // Idempotency check
        // ------------------------------
        const exists = await payrollModel.exists({
          employeeId,
          licenseId,
          month,
          year,
        });

        if (exists) {
          console.log(`Payroll already exists for Employee ${employeeId} Month ${month}/${year}`);
          return;
        }

        // ------------------------------
        // Call service to calculate payroll
        // ------------------------------
        const payrollData = await calculatePayroll({ employeeId, licenseId, month, year });

        // ------------------------------
        // Create payroll document
        // ------------------------------
        await payrollModel.create({
          employeeId,
          licenseId,
          month,
          year,
          paymentStatus: "Pending",
          earnings: payrollData.earnings,
          deductions: payrollData.deductions,
          totalEmployeeWorkingDays: payrollData.totalEmployeeWorkingDays,
          currentMonthWorkingdays: payrollData.currentMonthWorkingdays,
          leaveDays: payrollData.leaveDays,
          lopDays: payrollData.lopDays,
          netSalary: payrollData.netSalary,
          extraDay: payrollData.extraDay,
          bonus: payrollData.bonus,
          remarks: payrollData.remarks || "",
        });

        console.log(`Payroll created for Employee ${employeeId} Month ${month}/${year}`);

      } catch (error) {
        console.error("Payroll worker failed", error);
        throw error; // ensures BullMQ marks the job as failed
      }
    },
    {
      connection:redis
,
     
    }
  );

  // ------------------------------
  // Event listeners
  // ------------------------------
  payrollWorker.on("completed", (job) => console.log(`Job completed: ${job.id}`));
  payrollWorker.on("failed", (job, err) => console.error(`Job failed: ${job.id}`, err));

  console.log("Payroll worker started");
}
