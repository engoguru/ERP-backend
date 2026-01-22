import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema({
    licenseId: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9]{10}$/, "License ID must be exactly 10 characters (A-Z, 0-9 only)"],
        immutable: true
    },
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 70
    },
    gstNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Please enter a valid GST number"]
    },
    registrationNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[A-Z0-9-]+$/i,
        validate: {
            validator: function (v) {
                return /^[A-Z][0-9]{3,}$/.test(v);
            },
            message: props => `${props.value} is not a valid registration number!`
        }
    },
    companyPhone: {
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number']
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    companyEmail: {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    maxUser: {
        type: Number,
        default: 10
    },
    activeUser: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        default: "ACTIVE"
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const LicenseModel = mongoose.model("LicenseTable", licenseSchema);

export default LicenseModel;
