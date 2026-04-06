import mongoose from "mongoose";

const reTreatSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leadTable",
    },
    licenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LicenseTable",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Minimum 2 characters required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    contact: {
      type: String,
      required: [true, "Contact is required"],
      trim: true,
      unique: true,
      //   match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      trim: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },
    unpaidAmount: {
      type: Number,
      default: 0,
      min: [0, "Unpaid amount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount must be at least 0"],
    },
    service: {
      type: String,
      required: [true, "Service is required"],
      trim: true,
    },

    docs:[{
      url:{
        type:String
      },
      publicId:{
        type:String
      }
    }],

    status: {
      type: String,
    },
    feedback: [
      {
        message: {
          type: String,
          trim: true,
        },
        action: {
          type: String,
          enum: ["Pending", "Processing", "Complete"],
          default: "Pending",
        },
        submittedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// // Auto-calculate unpaidAmount before saving
// reTreatSchema.pre("save", function (next) {
//   this.unpaidAmount = this.totalAmount - this.paidAmount;
//   next();
// });

const reTreatModel = mongoose.model("Retreat", reTreatSchema);

export default reTreatModel;