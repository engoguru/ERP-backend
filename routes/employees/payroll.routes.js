// routes/employees/payroll.routes.js
import express from "express";
import {
  payrollCreate,
  payrollUpdate,
  payrollView,
  payrollViewOne,
  payrollDelete
} from "../../controllers/employees/payroll.controller.js";
import { payrollSchemaJoi } from "../../middlewares/employees/payroll.joivalidater.js";



const payrollRoute = express.Router();


// middleware/validate.js
export const validate = () => (req, res, next) => {
  const { error } = payrollSchemaJoi.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, errors });
  }
  next();
};

// CREATE payroll (validate body)
payrollRoute.post("/payroll", validate, payrollCreate);

// UPDATE payroll (validate body)
payrollRoute.put("/payroll/:id", validate, payrollUpdate);

// VIEW paginated payrolls
payrollRoute.get("/payroll", payrollView);

// VIEW single payroll
payrollRoute.get("/payroll/:id", payrollViewOne);

// DELETE payroll
payrollRoute.delete("/payroll/:id", payrollDelete);

export default payrollRoute;
