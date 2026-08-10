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
import Roleroute from "./routes/role.routes.js";
import departmentRoute from "./routes/department.routes.js";
import idRouter from "./routes/idCard.routes.js";
import reTreatRoute from "./routes/reTreat.routes.js";
import serviceAddRoute from "./routes/serviceAdd.routes.js";
import sncregisterRouter from "./routes/snc/sncregister.routes.js";
import sncServiceRouter from "./routes/snc/sncservice.routes.js";
import proposalRoutes from "./routes/snc/sncproposal.routes.js";
import paymentRoute from "./routes/snc/sncpayment.routes.js";
import routerData from "./routes/dataentry.routes.js";
import NgoOrg from "./models/ngoOrg.model.js";
import crypto from "crypto";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ────────── DATABASE ──────────
// if (process.env.NODE_ENV !== "test") {
//     connectDB();
// }

// ────────── GLOBAL MIDDLEWARE ──────────
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://13.205.63.37:5173",
//   "https://ngoguru.in/"
// ];
const allowedOrigins = [
  "http://localhost:5173",      // for local dev
  "http://13.205.63.37:5173",  // direct EC2 access (dev/testing)
  "https://ngoguru.in",        // production domain without www
  "https://www.ngoguru.in",    // production domain with www
  "https://ngoguru.info",      // main production domain
  "https://www.ngoguru.info"   // www production domain
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
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     console.log("Blocked CORS origin:", origin);
//     return callback(null, false);
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

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


app.use("/api/role",Roleroute)
app.use("/api/department",departmentRoute)

app.use("/api/chat",chatRoute)

app.use("/api/id",idRouter)

app.use("/api/treat",reTreatRoute)

app.use("/api/service",serviceAddRoute)

app.use("/api/sncregister",sncregisterRouter)

app.use("/api/sncService",sncServiceRouter)

app.use("/api/sncProposal",proposalRoutes)

app.use("/api/payment",paymentRoute)


app.use("/api/data",routerData)
// ────────── ERROR HANDLER ──────────
app.use(errorHandler);

// payu



const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT;
console.log(PAYU_KEY,PAYU_SALT)
const PAYU_PAYMENT_URL = "https://secure.payu.in/_payment";
// const PAYU_PAYMENT_URL = "https://test.payu.in/_payment";

/**
 * Generate PayU request hash
 *
 * key|txnid|amount|productinfo|firstname|email|
 * udf1|udf2|udf3|udf4|udf5||||||SALT
 */
function generateHash(params) {
  const hashString =
    `${params.key}|` +
    `${params.txnid}|` +
    `${params.amount}|` +
    `${params.productinfo}|` +
    `${params.firstname}|` +
    `${params.email}|` +
    `${params.udf1 || ""}|` +
    `${params.udf2 || ""}|` +
    `${params.udf3 || ""}|` +
    `${params.udf4 || ""}|` +
    `${params.udf5 || ""}` +
    `||||||${PAYU_SALT}`;

  return crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");
}

/**
 * Create PayU payment
 */

app.post("/ngo-org/formData", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      ngoName,
    } = req.body;

    // Validation
    if (!name || !email || !phone || !ngoName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create NGO/Organization
    // NgoOrg
    const ngoOrg = await NgoOrg.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      ngoName: ngoName.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "NGO/Organization saved successfully",
      data: ngoOrg,
    });
  } catch (error) {
    console.error("NGO Org Create Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});




app.post("/payment/create", async (req, res) => {
  console.log("PAYMENT CREATE HIT");
  console.log("Request body:", req.body);
   try {
    const {
      amount,
      productInfo,
      firstname,
      email,
      phone,
      ngoId,
    } = req.body;

    if (
      !amount ||
      !productInfo ||
      !firstname ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment details",
      });
    }

    const txnid =
      "TXN_" +
      Date.now() +
      "_" +
      crypto.randomBytes(4).toString("hex");

    const paymentData = {
      key: process.env.PAYU_KEY,

      txnid,

      amount: Number(amount).toFixed(2),

      productinfo: productInfo,

      firstname,

      email,

      phone,

      udf1: ngoId || "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: "",

      /*
       * These must eventually be publicly accessible
       * for PayU to redirect/callback.
       */
      surl:
        `${process.env.BACKEND_URL}/api/payment/success`,

      furl:
        `${process.env.BACKEND_URL}/api/payment/failure`,
    };

    console.log("Payment data before hash:", {
      ...paymentData,
      key: "***",
    });

    paymentData.hash = generateHash(paymentData);

    console.log("Transaction ID:", txnid);

    return res.status(200).json({
      success: true,
      paymentUrl: PAYU_PAYMENT_URL,
      paymentData,
    });
  } catch (error) {
    console.error("PAYU CREATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment",
    });
  }
});
/**
 * PayU redirects here after successful payment.
 */
app.post("/api/payment/success", (req, res) => {
  console.log("PAYU SUCCESS");
  console.log(req.body);

  // IMPORTANT:
  // Verify the response hash and transaction details
  // before marking your order as paid.

  res.redirect(
    `${process.env.FRONTEND_URL}/payment-success?txnid=${encodeURIComponent(
      req.body.txnid || ""
    )}`
  );
});

/**
 * PayU redirects here after failed payment.
 */
app.post("/api/payment/failure", (req, res) => {
  console.log("PAYU FAILURE");
  console.log(req.body);

  res.redirect(
    `${process.env.FRONTEND_URL}/payment-failure?txnid=${encodeURIComponent(
      req.body.txnid || ""
    )}`
  );
});



//payu

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
