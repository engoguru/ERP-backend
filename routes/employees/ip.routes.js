import express from "express";
const ipRoutes=express.Router()
import { createIp, } from "../../controllers/employees/ip.controller.js";




ipRoutes.post("/create", createIp);
// ipRoutes.get("/", getAllIps);
// ipRoutes.get("/:id", verifyLoginIp);
// router.put("/:id", updateIp);
// router.delete("/:id", deleteIp);

export default ipRoutes;
