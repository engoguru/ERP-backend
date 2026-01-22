// controllers/attendance.controller.js
import AttendanceModel from "../../models/employees/attendance.model.js";

// CREATE Attendance
export const attendanceCreate = async (req, res) => {
    try {
        const attendance = new AttendanceModel(req.body);
        await attendance.save();
        res.status(201).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// UPDATE Attendance
export const attendanceUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await AttendanceModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Attendance not found" });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// VIEW ALL Attendances
export const attendanceView = async (req, res) => {
    try {
        const attendances = await AttendanceModel.find();
        res.json({ success: true, data: attendances });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// VIEW ONE Attendance
export const attendanceViewOne = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await AttendanceModel.findById(id);
        if (!attendance) return res.status(404).json({ success: false, message: "Attendance not found" });
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE Attendance
export const attendanceDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await AttendanceModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Attendance not found" });
        res.json({ success: true, message: "Attendance deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
