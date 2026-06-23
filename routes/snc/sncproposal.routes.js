import express from "express"
import { createProposal, viewAllProposal } from "../../controllers/snc/sncproposal.controller.js";
import { authorization } from "../../utils/authorization.js";
const proposalRoutes=express.Router()




proposalRoutes.post("/create",authorization, createProposal)

proposalRoutes.get("/perUser/:id",authorization,viewAllProposal)







export default proposalRoutes;
