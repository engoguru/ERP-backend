import express from "express";
const reTreatRoute=express.Router()
import {registerTreat} from "../controllers/reTreat.controller.js"
import { authorization } from "../utils/authorization.js";

reTreatRoute.post("/create",authorization ,  registerTreat)

export default reTreatRoute