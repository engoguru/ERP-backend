import express from "express";
import { createIDCard, createIDCardBlank, createIDCardOne, exportLeadsToExcel, seminarData } from "../controllers/idCard.controller.js";
const idRouter=express.Router();
// authorization
idRouter.post("/",createIDCard) //this route create bluk id card with detail
idRouter.get("/blank",createIDCardBlank) //this route create bluk id card with detail
idRouter.get("/one/:id",createIDCardOne) //this route create bluk id card with detail
idRouter.get("/excel",exportLeadsToExcel)
idRouter.get("/seminarData",seminarData)


export default idRouter