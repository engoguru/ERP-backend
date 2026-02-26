import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    licenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LicenseTable",
        // unique: true,
        required: true
    },
  role: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // email used for login
    phone: { type: String, required: true, unique: true }, // phone also can be login
    assign: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Role = mongoose.model("Role", roleSchema);
export default Role;