import express from "express";
import { createIDCard, exportLeadsToExcel, seminarData } from "../controllers/idCard.controller.js";
const idRouter=express.Router();
// authorization
idRouter.post("/",createIDCard)
idRouter.get("/excel",exportLeadsToExcel)
idRouter.get("/seminarData",seminarData)


export default idRouter