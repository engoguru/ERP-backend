
import mongoose from "mongoose";

const sncServiceSchema = new mongoose.Schema({
    sncId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sncRegister"
    },
    licenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LicenseTable"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_table'
    },
    serviceName: {
        type: String,
        required: true,
        trim: true
    },
    totalAmount: {
        type: Number,
        required: true,
        trim: true
    },
    paidAmount: {
        type: Number,
        required: true,
        trim: true
    },
    unpaidAmount: {
        type: Number,
        required: true,
        trim: true
    },

    gstAmount: {
        type: Number,
        tirm: true
    },
    otherExpanses: {
        type: Number,
        trim: true
    },
    status: {
        type: String,
        // enum: ["Pending", "Processing", "complete"],
        default: "Pending"
    },
    docs: [
        {
            url: {
                type: String
            },
            public_id: {
                type: String
            }
        }
    ]
    ,
    allowedby: {
        type: String
    }

})
const sncServiceModel = mongoose.model("sncService", sncServiceSchema)
export default sncServiceModel