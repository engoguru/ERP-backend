// routes/attendance.routes.js
import express from "express";

import { attendanceSchemaJoi } from "../../middlewares/employees/attendance.joivalidater.js";
import { attendanceCreate, attendanceDelete, attendanceUpdate, attendanceView, attendanceViewOne } from "../../controllers/employees/attendance.controller.js";


const attendanceRoute = express.Router();

// middleware/validate.js
export const validate = () => (req, res, next) => {
  const { error } = attendanceSchemaJoi.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, errors });
  }
  next();
};


// CRUD Routes
attendanceRoute.post("/attendance",validate, attendanceCreate);
attendanceRoute.put("/attendance/:id", validate, attendanceUpdate);
attendanceRoute.get("/attendance", attendanceView);
attendanceRoute.get("/attendance/:id", attendanceViewOne);
attendanceRoute.delete("/attendance/:id", attendanceDelete);

export default attendanceRoute;
