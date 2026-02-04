import express from "express";

import { leavesCreate, leavesDelete, leavesUpdate, leavesView, leavesViewOne } from "../../controllers/employees/leaves.controller.js";
import { leavesSchemaJoi } from "../../middlewares/employees/leaves.joivalidater.js";
import { authorization } from "../../utils/authorization.js";




const leavesRoute= express.Router();


// middleware/validate.js
export const validate = () => (req, res, next) => {
  // console.log("dhweuhdo")
  const { error } = leavesSchemaJoi.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, errors });
  }
  next();
};

/* ================= Leaves Routes ================= */
leavesRoute.post("/create",authorization, validate(),leavesCreate);
// leavesRoute.post("/create",(req,res)=>{
//   console.log("jgejg")
// })

leavesRoute.put("/update/:id",authorization, leavesUpdate);

leavesRoute.get("/view",authorization, leavesView);

leavesRoute.get("/view/:id",authorization, leavesViewOne);

leavesRoute.delete("/leaves/:id", leavesDelete);

export default leavesRoute;
