import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    licenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LicenseTable",
      required: true,
      index: true,
    },
    resolveBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee_Table",
      default: null,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee_Table",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status:{
        type: String,
        enum:["Pending","Resolve"],
        default:"Pending"
    }
  },
  { timestamps: true }
);

const issueModel= mongoose.model("Issue_Table", issueSchema);
export default issueModel
