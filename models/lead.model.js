
import mongoose from "mongoose";

const OnConfirmedSchema = new mongoose.Schema({
  contact: {
    name: String,
    phone: String,
  },
  totalAmount: Number,
  paidAmount: Number,
  unpaidAmount: Number,
  nameOfService: String,
  description: String,
  OnConfirmedFiles: [
    {
      public_id: String,
      url: String,
    },
  ],
  status: [
    {
      label: {
        default:"Pending",
        type: String,
        enum: ["Pending", "Ongoing", "Completed"],

      },
      date: {
        type: Date,
        default: Date.now
      },
       addedBy:{
         type: mongoose.Schema.Types.ObjectId, ref: "Employee_Table"
       }
    }
  ],
  totalTime: {
    type: Number, // in days
  },
  addedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee_Table" },
    name: String,
  },
  date: { type: Date, default: Date.now },
});


const leadSchema = new mongoose.Schema({
  licenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LicenseTable", // reference to your License model
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  fields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  whoAssignedwho: [
    {
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee_Table",

      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee_Table",

      },
      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  followUp: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee_Table",

      },
      // Use Mixed type so any shape can be stored (text, image links, numbers, objects)
      messageContent: {
        type: mongoose.Schema.Types.Mixed,

      },
      nextFollowUpDate: Date,
      status: {
        type: String,
        enum: ["pending", "completed", "missed"],
        default: "pending"
      },
      completedAt: Date
    },
  ],
  OnConfirmed: [OnConfirmedSchema],
  statusRecord: [
    {
      roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee_Table", required: true },
      status: { type: String, required: true },
      changedAt: { type: Date, default: Date.now }
    }
  ],
  roleID: { type: mongoose.Schema.Types.ObjectId, ref: "Role", }

}, { timestamps: true });

const leadModel = mongoose.model("leadTable", leadSchema);
export default leadModel;
