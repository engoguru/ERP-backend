import express from "express";
import { nanoid } from 'nanoid'
import { licenseSchemaJoi } from "../middlewares/license.joivalidater.js";
import { licenseCreate, licenseDelete, licenseUpdate, licenseValidateToAdmin, licenseViewAll, licenseViewOne } from "../controllers/license.controller.js";
import { authorizationCompany } from "../utils/authorization.js";
const licenseRoutes = express.Router()

// model.nanoid()

const licenseValidate = async (req, res, next) => {
    const { error } = licenseSchemaJoi.validate(req.body, {
        abortEarly: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation failed!",
            errors: error.details.map(err => err.message)
        });
    }

    next();
};



licenseRoutes.post("/create",licenseValidate,licenseCreate)

licenseRoutes.get("/view/:licenseId", licenseViewOne)


licenseRoutes.get("/view",licenseViewAll)


licenseRoutes.put("/update/:licenseId",licenseUpdate)



licenseRoutes.post("/validate",licenseValidateToAdmin)



licenseRoutes.delete("/delete/:licenseId",licenseDelete)


// licenseRoutes.post("/create",licenseValidate,licenseCreate)

licenseRoutes.get("/get",authorizationCompany, (req, res) => {
 
  try {
    // req.user contains decoded info from JWT
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});


export default licenseRoutes;