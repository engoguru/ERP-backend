
import LicenseModel from "../models/license.model.js";
import jwt from "jsonwebtoken";


const generateNumericPart = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateLicenseIdFromName = async (companyName) => {
    // Normalize and get letters only
    const prefix = (companyName || "")
        .toUpperCase()
        .replace(/[^A-Z]/g, "") // Remove everything except letters
        .slice(0, 4);          // Take first 4 letters

    let licenseId;
    let exists = true;

    while (exists) {
        const numericPart = generateNumericPart(); // 6 digits
        licenseId = `${prefix}${numericPart}`;     // e.g. TEST123456

        exists = await LicenseModel.exists({ licenseId });
    }

    return licenseId;
};

export const licenseCreate = async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            const error = new Error("Empty request body");
            error.statusCode = 400;
            return next(error);
        }
        const checkExisting = await LicenseModel.findOne({
            $or: [
                { companyName: req.body.companyName },
                { gstNumber: req.body.gstNumber },
                { registrationNumber: req.body.registrationNumber },
                { "companyPhone.phone": req.body.companyPhone.phone },
                { "companyEmail.email": req.body.companyEmail.email }
            ]
        });

        if (checkExisting) {
            const duplicates = [];

            if (checkExisting.companyName === req.body.companyName) {
                duplicates.push("companyName");
            }
            if (checkExisting.gstNumber === req.body.gstNumber) {
                duplicates.push("gstNumber");
            }
            if (checkExisting.registrationNumber === req.body.registrationNumber) {
                duplicates.push("registrationNumber");
            }
            if (
                checkExisting.companyPhone &&
                checkExisting.companyPhone.phone === req.body.companyPhone?.phone
            ) {
                duplicates.push("phone");
            }
            if (
                checkExisting.companyEmail &&
                checkExisting.companyEmail.email === req.body.companyEmail?.email
            ) {
                duplicates.push("email");
            }

            const message = duplicates.length
                ? `Duplicate field(s): ${duplicates.join(", ")}`
                : "Duplicate record found";

            const error = new Error(message);
            error.statusCode = 400;
            return next(error);
        }

        const licenseId = await generateLicenseIdFromName(req.body.companyName);

        const newLicense = await LicenseModel.create({
            ...req.body,
            licenseId
        });
        return res.status(201).json({
            success: true,
            data: newLicense
        });
    } catch (error) {
        return next(error); // proper error handling
    }
};

export const licenseUpdate = async (req, res, next) => {
    try {
        const { licenseId } = req.params; // FIXED
        const updates = { ...req.body };

        // prevent updating licenseId
        if (updates.licenseId) {
            const error = new Error("licenseId cannot be updated");
            error.statusCode = 400;
            return next(error);
        }

        const updatedLicense = await LicenseModel.findOneAndUpdate(
            { _id: licenseId },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedLicense) {
            const error = new Error("License not found");
            error.statusCode = 404;
            return next(error);
        }

        return res.status(200).json({
            success: true,
            data: updatedLicense
        });
    } catch (error) {
        return next(error);
    }
};


export const licenseViewOne = async (req, res, next) => {
    try {
        const { licenseId } = req.params; // FIXED

        if (!licenseId) {
            const error = new Error("License ID is required");
            error.statusCode = 400;
            return next(error);
        }

        const license = await LicenseModel.findOne({ _id: licenseId })
            .lean()
            .exec();

        if (!license) {
            const error = new Error("License not found");
            error.statusCode = 404;
            return next(error);
        }

        return res.status(200).json({
            success: true,
            data: license
        });
    } catch (error) {
        return next(error);
    }
};


export const licenseViewAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1; // changed from req.body.page
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 50; // changed from req.body.itemsPerPage

        const skip = (page - 1) * itemsPerPage;

        const total = await LicenseModel.countDocuments(); // total records

        const data = await LicenseModel.find()
            .skip(skip)
            .limit(itemsPerPage)
            .lean()
            .exec();

        return res.status(200).json({
            success: true,
            page,
            itemsPerPage,
            total,
            totalPages: Math.ceil(total / itemsPerPage),
            data
        });
    } catch (error) {
        next(error); // will be caught by your errorHandler
    }
};







export const licenseValidateToAdmin = async (req, res, next) => {
    try {
        const { companyEmail, companyPhone, licenseId } = req.body;

        // validation
        if (!companyEmail || !companyPhone || !licenseId) {
            return res.status(400).json({
                success: false,
                message: "companyEmail, companyPhone and licenseId are required"
            });
        }

        // find license
        const license = await LicenseModel.findOne({
            licenseId: licenseId,
            "companyEmail.email": companyEmail,
            "companyPhone.phone": companyPhone
        });

        if (!license) {
            return res.status(404).json({
                success: false,
                message: "License not found or details do not match"
            });
        }

        // check email or phone verified
        const isEmailVerified = license.companyEmail?.isVerified;
        const isPhoneVerified = license.companyPhone?.isVerified;

        if (!isEmailVerified && !isPhoneVerified) {
            return res.status(403).json({
                success: false,
                message: "Email or phone must be verified"
            });
        }

        // mock OTP (test only)
        const testOtp = "123456";

        // generate JWT (24h)
        const companyKey = jwt.sign(
            {
                licenseId: license._id,
                companyName: license.companyName
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // res.cookie("companyAdminKey", companyKey, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: "lax",
        //     maxAge: 24 * 60 * 60 * 1000
        // });

        res.cookie("companyAdminKey", companyKey, {
            httpOnly: true,          // cannot be accessed by client-side JS
            secure: true,            // send only over HTTPS
            sameSite: "lax", 
             domain: ".ngoguru.info",        // protects against CSRF, allows top-level navigation
            maxAge: 24 * 60 * 60 * 1000  // 1 day in milliseconds
        });
        return res.status(200).json({
            success: true,
            message: "OTP sent (test mode)",
            testOtp
        });

    } catch (error) {
        console.error("licenseValidateToAdmin error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// here we use aws lambda
export const licenseCheckExpire = async () => {
    try {

    } catch (error) {

    }
}
// here we use aws lambda
export const licenseNotifyExpire = async () => {
    try {

    } catch (error) {

    }
}

export const licenseDelete = async (req, res, next) => {
    try {
        const { licenseId } = req.params; // FIXED

        if (!licenseId) {
            const error = new Error("License ID is required");
            error.statusCode = 400;
            return next(error);
        }

        const result = await LicenseModel.deleteOne({ _id: licenseId });

        if (result.deletedCount === 0) {
            const error = new Error("License not found");
            error.statusCode = 404;
            return next(error);
        }

        return res.status(200).json({
            success: true,
            message: "License deleted successfully"
        });
    } catch (error) {
        return next(error);
    }
};
