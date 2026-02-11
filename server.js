import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./utils/errorHandler.js";
import licenseRoutes from "./routes/license.routes.js";
import connectDB from "./config/db.js";
import companyConfigureRoutes from "./routes/companyConfigure.routes.js";
import leadRoute from "./routes/lead.routes.js";
import leavesRoute from "./routes/employees/leaves.routes.js";
import payrollRoute from "./routes/employees/payroll.routes.js";
import attendanceRoute from "./routes/employees/attendance.routes.js";
import eventRoute from "./routes/employees/event.routes.js";
import employeeRoute from "./routes/employees/employee.routes.js";
import companyRoutes from "./routes/company.routes.js";
import { authorization } from "./utils/authorization.js";
import { roleAllowed } from "./utils/roleAllowed.js";
import ipRoutes from "./routes/employees/ip.routes.js";
import { redisConnect } from "./config/redis.js";
import startPayrollWorker from "./workers/payroll.worker.js";


// import "./jobs/payroll.job.js"
import { startPayrollCron } from "./jobs/payroll.job.js";
import{startActiveUser} from "./jobs/active.user.js"
import Issueroute from "./routes/employees/issue.routes.js";
import chatRoute from "./routes/chatbot.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ────────── DATABASE ──────────
// if (process.env.NODE_ENV !== "test") {
//     connectDB();
// }

// ────────── GLOBAL MIDDLEWARE ──────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://13.205.63.37:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json()); // parses JSON bodies
app.use(express.urlencoded({ extended: true }));

// ────────── ROUTES ──────────
app.get("/health", (req, res) => {
    res.send("Hello! I am fit.");
});

app.use("/api/companyRegister",companyRoutes)

app.use("/api/license", licenseRoutes);
app.use("/api/companyConfigure",   companyConfigureRoutes);
app.use("/api/lead", leadRoute);
app.use("/api/leaves", leavesRoute);
app.use("/api/payroll", payrollRoute);
app.use("/api/attendance", attendanceRoute);
app.use("/api/event", eventRoute);
app.use("/api/employee", employeeRoute);

app.use("/api/issue",Issueroute)

app.use("/api/ip",ipRoutes)

app.use("/api/chat",chatRoute)

// ────────── ERROR HANDLER ──────────
app.use(errorHandler);

// ────────── EXPORT APP FOR TESTING ──────────
export default app;

startPayrollWorker()
startActiveUser()
startPayrollCron()
// ────────── START SERVER ONLY IF NOT TEST ──────────
if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      await connectDB();       // Connect your database
      await redisConnect();    // Connect Redis
      console.log("All services connected!");

      // Start server only after connections succeed
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("Failed to connect services:", err);
      process.exit(1); // Exit if critical services fail
    }
  })();
} else {
  // If in test mode, start the server without connecting to DB/Redis
  app.listen(PORT, () => {
    console.log(`Server running in TEST mode on http://localhost:${PORT}`);
  });
}
