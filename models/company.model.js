import mongoose from "mongoose";


const branchSchema = new mongoose.Schema({
    nickName: {
        type: String,
        trim: true
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

    companyWebUrl: {
        website: {
            type: String,
            trim: true,
            match: [/^(https?:\/\/)?([\w-]+)\.([a-z]{2,6})(\/[\w-]*)*\/?$/, 'Invalid website URL']
        },
        instagram: {
            type: String,
            trim: true,
            match: [/^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/, 'Invalid Instagram URL']
        },
        facebook: {
            type: String,
            trim: true,
            match: [/^(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9_.]+\/?$/, 'Invalid Facebook URL']
        },
        linkedin: {
            type: String,
            trim: true,
            match: [/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/, 'Invalid LinkedIn URL']
        },
        twitter: {
            type: String,
            trim: true,
            match: [/^(https?:\/\/)?(www\.)?twitter\.com\/[A-Za-z0-9_]+\/?$/, 'Invalid Twitter URL']
        },
        youtube: {
            type: String,
            trim: true,
            match: [/^(https?:\/\/)?(www\.)?youtube\.com\/.*$/, 'Invalid YouTube URL']
        }
    },

    headOffice: {
        type: Boolean,
        default: false
    },

    address: {
        type: String,
        trim: true
    }
}, { timestamps: true });


const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 70,
        trim: true,
        unique: true
    },
    registrationNumber: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        unique: true,
        match: /^[A-Z0-9-]+$/i,
        validate: {
            validator: function (v) {
                return /^[A-Z][0-9]{3,}$/.test(v);
            },
            message: props => `${props.value} is not a valid registration number!`
        }
    },
    registrationDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {

                return v instanceof Date && !isNaN(v.getTime()) && v <= new Date();
            },
            message: props => `${props.value} is not a valid registration date or is in the future!`
        }
    },
    gstNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true, // convert to uppercase for consistency
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
    },

    panCard: [{
        url: {
            type: String,
            required: true,
            trim: true
        },
        public_Id: {
            type: String,
            required: true,
            trim: true
        }
    }],
    companyLogo: {
        url: {
            type: String,
            required: true,
            trim: true
        },
        public_Id: {
            type: String,
            required: true,
            trim: true
        }
    },
    companyBranch: [branchSchema]
})
const companyModel = mongoose.model("CompanyTable", companySchema);

export default companyModel
