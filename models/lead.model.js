import mongoose from "mongoose";

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
    },
  ],

}, { timestamps: true });

const leadModel = mongoose.model("leadTable", leadSchema);
export default leadModel;
