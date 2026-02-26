import Department from "../models/department.model.js";

// CREATE a new department
export const createDepartment = async (req, res) => {
  try {
    // console.log(req.body,req.user,"op")
    
    const { name} = req.body;
    const {licenseId}=req.user;
    if(!name || !licenseId){
      return res.status(400).json({
        message:"check field !"
      })
    }

    // Check if department exists for this license
    const existingDepartment = await Department.findOne({ name, licenseId });
    if (existingDepartment) {
      return res.status(400).json({ message: "Department already exists for this license." });
    }

    const newDepartment = new Department({ name, licenseId });
    const savedDepartment = await newDepartment.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate("licenseId");
    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET single department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).populate("licenseId");
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE department by ID
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, licenseId } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { name, licenseId },
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json(updatedDepartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE department by ID
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDepartment = await Department.findByIdAndDelete(id);

    if (!deletedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};