
import mongoose from "mongoose"

const proposalSchema = new mongoose.Schema({
        sncId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "snc"
        },
        licenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LicenseTable"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Employee_Table"
        },
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    Fee: {
        type: String,
        required: true
    },
    expanses: {
        type: Number,
        default: 0,
        min: 0

    },
     paidAmount: {
        type: Number,
        default: 0,
        min: 0

    },
     unPaidAmount: {
        type: Number,
        default: 0,
        min: 0

    },
    totalAmount: {
        type: Number,
        default: 0,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },

}, {
    timestamps: true
});

const proposalModel = mongoose.model("Proposal", proposalSchema);
export default proposalModel