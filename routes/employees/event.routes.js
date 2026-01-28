import express from "express";
import { eventCreate, eventdelete, eventUpdate, eventView, eventViewAll, eventViewOne } from "../../controllers/employees/event.controller.js";
import { eventSchemaJoi } from "../../middlewares/employees/event.joivalidateer.js";

const eventRoute=express.Router();
// middleware/validate.js
import mongoose from "mongoose";
import { authorization } from "../../utils/authorization.js";


const validate = (req,res,next)  => {
  try {
    // Assign string IDs for validation
    req.body.licenseId =req.user.licenseId;
    req.body.employeeId = req.user.id;

    console.log("Middleware body:", req.body);

    // Validate
    const { error } = eventSchemaJoi.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ success: false, errors });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Invalid ID format" });
  }
};



eventRoute.post("/create",authorization,validate,eventCreate)

eventRoute.put("/update/:id", validate,eventUpdate)
eventRoute.get("/view",authorization,eventView)
eventRoute.get("/viewAll",eventViewAll)
eventRoute.get("/viewOne/:id",eventViewOne)
eventRoute.delete("/delete/:id",eventdelete)



export default eventRoute