import express from "express";
import { createDepartment, deleteDepartment, getDepartmentById, getDepartments, updateDepartment } from "../controllers/department.controller.js";
import { authorization } from "../utils/authorization.js";

const departmentRoute=express.Router();



departmentRoute.post("/create",authorization, createDepartment);


departmentRoute.get("/viewAll",getDepartments);

departmentRoute.get("/view/:id",getDepartmentById);

departmentRoute.put("/update/:id",updateDepartment);

departmentRoute.delete("/delete/:id",deleteDepartment)


export default departmentRoute;