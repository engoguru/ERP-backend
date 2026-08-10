import mongoose from "mongoose";

const ngoOrgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    ngoName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "NGO-Org",
  }
);

const NgoOrg = mongoose.model("NgoOrg", ngoOrgSchema);

export default NgoOrg;