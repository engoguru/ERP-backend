import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  licenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LicenseTable",

    required: true
  }
}, { timestamps: true });

const Department = mongoose.model("Department", departmentSchema);
export default Department;