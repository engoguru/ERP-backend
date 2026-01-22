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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ────────── DATABASE ──────────
if (process.env.NODE_ENV !== "test") {
    connectDB();
}

// ────────── GLOBAL MIDDLEWARE ──────────
app.use(cors({
  origin: "http://localhost:5173", // your React frontend
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

// ────────── ERROR HANDLER ──────────
app.use(errorHandler);

// ────────── EXPORT APP FOR TESTING ──────────
export default app;

// ────────── START SERVER ONLY IF NOT TEST ──────────
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server started at ${PORT}`);
    });
}
