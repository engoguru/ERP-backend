import express from "express";
import { companyConfigureSchemaJoi } from "../middlewares/companyConfigure.joivalidater.js";
import { companyConfigureCreate, companyConfigureDelete, companyConfigureUpdate, companyConfigureViewAll, companyConfigureViewByLicense, companyConfigureViewOne } from "../controllers/companyConfigure.controller.js";
import { authorization } from "../utils/authorization.js";
import { roleAllowed } from "../utils/roleAllowed.js";

const companyConfigureRoutes=express.Router()


const companyConfigureValidate=(req, res, next)=>{
    const  {error}= companyConfigureSchemaJoi.validate(req.body,{
        abortEarly:true
    })
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation failed!",
            errors: error.details.map(err => err.message)
        });
    }

    next();
}


companyConfigureRoutes.post("/create" ,authorization, companyConfigureValidate,companyConfigureCreate)


companyConfigureRoutes.get("/view" ,authorization,companyConfigureViewOne)



companyConfigureRoutes.get("/viewaLL" ,companyConfigureViewAll)


companyConfigureRoutes.put("/update" , authorization,companyConfigureValidate,companyConfigureUpdate)


companyConfigureRoutes.get("/viewDetail/id" ,companyConfigureViewByLicense)

companyConfigureRoutes.delete("/delete/:id" , companyConfigureDelete)



export default companyConfigureRoutes;