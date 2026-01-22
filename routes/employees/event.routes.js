import express from "express";
import { eventCreate, eventdelete, eventUpdate, eventView, eventViewAll, eventViewOne } from "../../controllers/employees/event.controller.js";
import { eventSchemaJoi } from "../../middlewares/employees/event.joivalidateer.js";

const eventRoute=express.Router();
// middleware/validate.js
import mongoose from "mongoose";


const validate = (req,res,next)  => {
  try {
    // Assign string IDs for validation
    req.body.licenseId = "6964954a570d47c5d6edbe95";
    req.body.employeeId = "696b7bf0360a9259fb1248e7";

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



eventRoute.post("/create",validate,eventCreate)

eventRoute.put("/update/:id", validate,eventUpdate)
eventRoute.get("/view",eventView)
eventRoute.get("/viewAll",eventViewAll)
eventRoute.get("/viewOne/:id",eventViewOne)
eventRoute.delete("/delete/:id",eventdelete)



export default eventRoute