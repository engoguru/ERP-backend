import express from "express";
// import {
//   createIssue,
//   getAllIssues,
//   getIssueById,
//   updateIssue,
//   deleteIssue,
// } from "../controllers/issue.controller.js";

import { createIssue, getAllIssues, updateIssue } from "../../controllers/employees/issue.controller.js";
import { authorization } from "../../utils/authorization.js";

const Issueroute = express.Router();

// router.use(protect); // auth middleware

Issueroute.post("/create",authorization, createIssue);
Issueroute.get("/view", authorization, getAllIssues);
// router.get("/:id", getIssueById);
Issueroute.put("/update/:id",authorization,updateIssue);
// router.delete("/:id", deleteIssue);

export default Issueroute;
