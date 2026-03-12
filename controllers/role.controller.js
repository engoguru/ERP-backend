import { json } from "express";
import Role from "../models/role.model.js";
import mongoose from "mongoose";
import Department from "../models/department.model.js";

// CREATE a new Role
export const createRole = async (req, res) => {
    try {
        const { departmentId, role, email, phone, assign, isActive } = req.body;
        const  {licenseId}=req.user;

        // Basic validation
        if (!role || !email || !phone) {
            return res.status(400).json({ message: "Empty field" });
        }

        // Check if email OR phone already exists
        const checkExisting = await Role.findOne({
            $or: [{ email }, { phone }]
        });

        if (checkExisting) {
            return res.status(400).json({
                message: "Email or Phone already exists"
            });
        }

        // Create new role
        const newRole = await Role.create({
            departmentId,
            licenseId,
            role,
            email,
            phone,
            assign,
            isActive,
        });

        res.status(201).json({
            message: "Create Successful!",
            data: newRole
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET all Roles (Production Ready)
export const getRoles = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            isActive,
            sort = "-createdAt"
        } = req.query;

        //  Build filter object
        const filter = {};

        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        if (search) {
            filter.$or = [
                { role: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        // Pagination calculations
        const skip = (Number(page) - 1) * Number(limit);

        //  Query execution
        const [roles, total] = await Promise.all([
            Role.find(filter)
                .populate("departmentId", "name")
                .populate("licenseId", "name")
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),

            Role.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: roles
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
// get rolee based on department
// GET roles by department
export const getRolePerDepartment = async (req, res) => {
  try {
    const { departmentName,departmentId } = req.query;

    if (!departmentName) {
      return res.status(400).json({ message: "Department name is required" });
    }

    // Find department by name
    const department = await Department.findOne({ name: departmentName });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Find roles for this department
    const roles = await Role.find({ departmentId: department._id });

    res.status(200).json({
      success: true,
      department: department.name,
      roles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getRolePerDepartment2 = async (req, res) => {
  try {
    const { departmentId } = req.query;

console.log(departmentId)
    // Find roles for this department
    const roles = await Role.find({ departmentId:departmentId });

    res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET a single Role by ID
export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid role ID" });
        }

        const role = await Role.findById(id)
            .populate("departmentId", "name")
            .populate("licenseId", "name");

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE a Role by ID
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid role ID" });
        }

        const updatedRole = await Role.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedRole) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.status(200).json(updatedRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE a Role by ID
export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid role ID" });
        }

        const deletedRole = await Role.findByIdAndDelete(id);

        if (!deletedRole) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};