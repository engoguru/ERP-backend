import express from "express"
import { authorization } from "../../utils/authorization.js"
import { createPayment, viewAllPayment } from "../../controllers/snc/sncpayment.controller.js"
const paymentRoute=express.Router()


paymentRoute.post("/create", authorization,createPayment)

paymentRoute.get("/viewAllPayment/:id",authorization,viewAllPayment)


export default paymentRoute