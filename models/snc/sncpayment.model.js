
import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
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
    paymentMode: {
        type: String,
        required: true,
        trim: true
    },
    Amount: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const paymentModel = mongoose.model("sncpayment", paymentSchema);
export default paymentModel