import mongoose from "mongoose";

const ipSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee_Table",
      required: true,
    },
    licenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LicenseTable",
      required: true,
    },
    ip: {
  type: String,
  required: true,
  match: [
    /^(?:\d{1,3}\.){3}\d{1,3}$/,
    "Please enter a valid IP address",
  ],
}

  },
  { timestamps: true }
);
ipSchema.index({ licenseId: 1, ip: 1 ,employeeId:1}, { unique: true });

export default mongoose.model("Ip_Table", ipSchema);
