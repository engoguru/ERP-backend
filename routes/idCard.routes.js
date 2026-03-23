import express from "express";
import { createIDCard, exportLeadsToExcel } from "../controllers/idCard.controller.js";
const idRouter=express.Router();

idRouter.post("/",createIDCard)
idRouter.get("/excel",exportLeadsToExcel)


export default idRouter