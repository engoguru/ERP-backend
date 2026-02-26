import express from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRolePerDepartment,
} from "../controllers/role.controller.js";
import { authorization } from "../utils/authorization.js";

const Roleroute = express.Router();

Roleroute.post("/create",authorization, createRole);        // Create role
Roleroute.get("/get", getRoles);           // Get all roles
// Roleroute.get("/:id", getRoleById);     // Get role by ID
// Roleroute.put("/:id", updateRole);      // Update role
// Roleroute.delete("/:id", deleteRole);   // Delete role

Roleroute.get("/viewViaDepartment",getRolePerDepartment)

export default Roleroute;