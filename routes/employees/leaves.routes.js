import express from "express";

import { leavesCreate, leavesDelete, leavesUpdate, leavesView, leavesViewOne } from "../../controllers/employees/leaves.controller.js";
import { leavesSchemaJoi } from "../../middlewares/employees/leaves.joivalidater.js";




const leavesRoute= express.Router();


// middleware/validate.js
export const validate = () => (req, res, next) => {
  const { error } = leavesSchemaJoi.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, errors });
  }
  next();
};

/* ================= Leaves Routes ================= */
leavesRoute.post("/leaves", validate,leavesCreate);

leavesRoute.put("/leaves/:id", validate, leavesUpdate);

leavesRoute.get("/leaves", leavesView);

leavesRoute.get("/leaves/:id", leavesViewOne);

leavesRoute.delete("/leaves/:id", leavesDelete);

export default leavesRoute;
