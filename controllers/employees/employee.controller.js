
import EmployeeModel from "../../models/employees/employee.model.js";
import { generateUploadURL, s3 } from "../../config/awsS3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import { generateEmployeeCode } from "../../utils/generateEmployeeCode.js";

import jwt from "jsonwebtoken";
import companyConfigureModel from "../../models/companyConfigure.model.js";
import { checkIpAllowed } from "../../utils/verifyNetwork.js";
import redis from "../../config/redis.js";
import AttendanceModel from "../../models/employees/attendance.model.js";
import LicenseModel from "../../models/license.model.js";
// import { verifyNetwork } from "../../utils/verifyNetwork.js";


const getClientIp = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  // Normalize IPv4 mapped IPv6 addresses
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

  // Remove zone index if present (like %20)
  ip = ip.split("%")[0];

  return ip;
};


export const createEmployee = async (req, res) => {


  try {
    if (req.body.employeeCode) {
      req.body.employeeCode = await generateEmployeeCode();
    }
    // Parse JSON fields sent via FormData
    if (req.body.salaryStructure && typeof req.body.salaryStructure === "string") {
      req.body.salaryStructure = JSON.parse(req.body.salaryStructure);
    }
    if (req.body.shiftDetail && typeof req.body.shiftDetail === "string") {
      req.body.shiftDetail = JSON.parse(req.body.shiftDetail);
    }
    if (req.body.employeeEmail && typeof req.body.employeeEmail === "string") {
      req.body.employeeEmail = JSON.parse(req.body.employeeEmail);
    }
    if (req.body.employeeContact && typeof req.body.employeeContact === "string") {
      req.body.employeeContact = JSON.parse(req.body.employeeContact);
    }
    if (req.body.bankDetail && typeof req.body.bankDetail === "string") {
      req.body.bankDetail = JSON.parse(req.body.bankDetail);
    }
    if (req.body.emgContact && typeof req.body.emgContact === "string") {
      req.body.emgContact = JSON.parse(req.body.emgContact);
    }


    // // Validate and convert ObjectIds
    // if (req.body.reportingManager) {
    //   if (mongoose.Types.ObjectId.isValid(req.body.reportingManager)) {
    //     req.body.reportingManager = new mongoose.Types.ObjectId(req.body.reportingManager);
    //   } else {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Invalid reportingManager ID",
    //     });
    //   }
    // }

    if (req.body.licenseId) {
      if (mongoose.Types.ObjectId.isValid(req.body.licenseId)) {
        req.body.licenseId = new mongoose.Types.ObjectId(req.body.licenseId);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid licenseId",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "licenseId is required",
      });
    }

    // Ensure salaryStructure totals exist
    if (req.body.salaryStructure) {
      const s = req.body.salaryStructure;
      s.basic = Number(s.basic) || 0;
      s.hra = Number(s.hra) || 0;
      s.otherAllowance = Number(s.otherAllowance) || 0;
      s.pf = Number(s.pf) || 0;
      s.esi = Number(s.esi) || 0;
      s.professionalTax = Number(s.professionalTax) || 0;
      s.gratuity = Number(s.gratuity) || 0;

      s.grossSalary = s.basic + s.hra + s.otherAllowance;
      s.totalDeduction = s.pf + s.esi + s.professionalTax;
      s.netSalary = s.grossSalary - s.totalDeduction;
    }

    const employee = new EmployeeModel(req.body);
    const savedEmployee = await employee.save();

    return res.status(201).json({ success: true, data: savedEmployee });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field}`,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

export const viewEmployee = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Ensure valid page & limit
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;



    const { employeeCode } = req?.user;

    const licenseData = await EmployeeModel
      .findOne({employeeCode })
      .populate("licenseId", "_id")
      .lean();

    if (!licenseData?.licenseId) {
      const error = new Error("License not found");
      return next(error);
    }

    const id = licenseData.licenseId._id;



    // Calculate total documents
    const total = await EmployeeModel.countDocuments({ licenseId: id });

    // Fetch data with pagination & sorting
    const employees = await EmployeeModel.find({ licenseId: id })
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};


export const searchEmployeeByName = async (req, res, next) => {
  try {
    const { name } = req.query;
    // const { licenseId } = req.user;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name query parameter is required",
      });
    }

    // Find employees by partial, case-insensitive name match
    const employees = await EmployeeModel.find(
      {
        // licenseId: licenseId,
        name: { $regex: name, $options: "i" }
      },
      { _id: 1, name: 1 }
    ).lean();


    return res.status(200).json({
      success: true,
      total: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Error searching employees:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching employees",
      error: error.message,
    });
  }
};

// login Work Started here
const incrementActiveUser = async (licenseId) => {
  const updated = await LicenseModel.findOneAndUpdate(
    {
      _id: licenseId,
      $expr: { $lt: ["$activeUser", "$maxUser"] } // check activeUser < maxUser
    },
    { $inc: { activeUser: 1 } }, // increment by 1
    { new: true } // return updated document
  );

  if (!updated) {
    // either license not found OR activeUser already >= maxUser
    return 0;
  }

  return updated.activeUser;
};

const calculateLoginTime = async (licenseId, id) => {
  //  const { id, licenseId } = req.user;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
// console.log(licenseId,id,"ioi")
  const attendance = await AttendanceModel.findOne({
    employeeId: id,
    licenseId,
    date: today
  });
  // console.log(attendance,"atn")

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: "Attendance record not found for today"
    });
  }

  if (!attendance.inTime) {
    return res.status(400).json({
      success: false,
      message: "Cannot calculate working hours: inTime missing"
    });
  }

  const outTime = new Date();
  const inTime = new Date(attendance.inTime);
  const workingHour = (outTime - inTime) / (1000 * 60 * 60); // hours
  attendance.outTime = outTime;
  attendance.workingHour = Number(workingHour.toFixed(2));

  await attendance.save();
}

export const loginEmployee = async (req, res, next) => {
  try {
    const { email, contact, licenseId } = req.body;

    // Validation
    if (!email || !contact) {
      return res.status(400).json({
        success: false,
        message: "Email, contact, and licenseId are required",
      });
    }




    // Find employee under license
    const checkEmployee = await EmployeeModel.findOne({
      "employeeEmail.email": email,
      "employeeContact.contact": contact,
    }).populate("licenseId", "licenseId expiresAt companyName _id");
    // console.log(checkEmployee, "ygg")
    if (!checkEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }



    // Check license matches
    if (checkEmployee?.licenseId?.licenseId !== licenseId) {
      return res.status(403).json({
        success: false,
        message: "License ID does not match",
      });
    }
    const companyConfig = await companyConfigureModel.findOne({
      licenseId: checkEmployee.licenseId?._id
    })


    // Find matching permission from company data
    const matchedPermission = companyConfig?.permissions.find(
      (perm) =>
        perm.roleName?.trim().toLowerCase() === checkEmployee.role?.trim().toLowerCase() &&
        perm.department?.trim().toLowerCase() === checkEmployee.department?.trim().toLowerCase()
    );

    // Extract permission array or return empty array if no match
    const permissionArray = matchedPermission ? matchedPermission.permission : [];

    // console.log(permissionArray,"companyCon",companyConfig); // ["read", "write"]
    // Check license expiration
    const expireDate = checkEmployee.licenseId?.expiresAt;
    if (!expireDate || new Date() > new Date(expireDate)) {
      return res.status(403).json({
        success: false,
        message: "License has expired",
      });
    }

    // Check if email or contact is verified
    if (!checkEmployee.employeeEmail?.isVerified && !checkEmployee.employeeContact?.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email or contact must be verified",
      });
    }


    // console.log(activeCount);
    // Mock OTP for demo/test
    const testOtp = "123456";

    // Generate JWT (24h)
    const companyKey = jwt.sign(
      {
        id: checkEmployee._id,
        name: checkEmployee.name,
        employeeCode: checkEmployee.employeeCode,
        department: checkEmployee.department,
        role: checkEmployee.role,
        email: checkEmployee.employeeEmail.email,
        contact: checkEmployee.employeeContact.contact,
        status: checkEmployee.status,
        licenseId: checkEmployee.licenseId?._id,
        permissionArray: permissionArray

      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Store token in Redis
    // const redisKey = `employee:${checkEmployee._id}:token`;
    // await redis.set(redisKey, companyKey, "EX", 24 * 60 * 60); // 24 hours
    const redisKey = `employee:${checkEmployee._id}:token`;

    // check if token already exists
    const existingToken = await redis.get(redisKey);

    if (existingToken) {
// console.log(redisKey,existingToken,"pp")
      await redis.set(redisKey, companyKey, "EX", 24 * 60 * 60);
      await calculateLoginTime(checkEmployee.licenseId?._id,checkEmployee._id)
    } else {
      // first login
      const activeCount = await incrementActiveUser(checkEmployee.licenseId?._id, checkEmployee._id);
      await redis.set(redisKey, companyKey, "EX", 24 * 60 * 60);
    }

    // Set JWT in cookie
    res.cookie("companyKey_keys", companyKey, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to 00:00:00 for date comparison

    // Check if today's attendance already exists
    let attendance = await AttendanceModel.findOne({
      employeeId: checkEmployee._id,
      licenseId: checkEmployee.licenseId?._id,
      date: today,
    });

    if (attendance) {
      // Already logged in today, maybe update inTime if needed
      attendance.inTime = attendance.inTime || new Date();
    } else {
      // Create new attendance for today
      attendance = new AttendanceModel({
        employeeId: checkEmployee._id,
        licenseId: checkEmployee.licenseId?._id,
        inTime: new Date(),
        date: today,
      });
    }

    // console.log(attendance,"ppp")
    await attendance.save();
    // Success response
    return res.status(200).json({
      success: true,
      message: "OTP sent (test mode)",
      testOtp,
    });
  } catch (error) {
    console.error("loginEmployee error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// login Work End here

export const viewOneEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Employee ID",
      });
    }

    const employee = await EmployeeModel
      .findById(id)
      .populate("reportingManager", "name email employeeCode");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // 🔑 Generate fresh presigned URLs for all files
    if (Array.isArray(employee.pan)) {
      await Promise.all(
        employee.pan.map(async (pan) => {
          if (pan?.public_id) {
            pan.url = await generateUploadURL(pan.public_id);
          }
        })
      );
    }

    if (Array.isArray(employee.aadhar)) {
      await Promise.all(
        employee.aadhar.map(async (aadhar) => {
          if (aadhar?.public_id) {
            aadhar.url = await generateUploadURL(aadhar.public_id);
          }
        })
      );
    }

    if (employee.profilePic?.public_id) {
      employee.profilePic.url = await generateUploadURL(employee.profilePic.public_id);
    }

    // Add more fields if needed: license, documents, etc.

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




export const userDashboard = async (req, res) => {
  try {
    const { licenseId } = req.user;

    // Start of current month
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const [
      totalEmployees,
      monthlyEmployees,
      licenseData,
    ] = await Promise.all([
      EmployeeModel.countDocuments({ licenseId }),

      EmployeeModel.find({
        licenseId,
        createdAt: { $gte: startOfMonth },
      }),

      LicenseModel.findById(licenseId).select("activeUser maxUser"),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        monthlyEmployees,
        license: licenseData,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
