import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import redis from "../config/redis.js";
    // console.log( process.env.JWT_SECRET,"kk")
export const authorization = async (req, res, next) => {
  try {
    // console.log("jjj")
    // Correct spelling + correct cookie name
    const token = req.cookies?.companyKey_keys;
// console.log(token,"fhd")
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check Redis for token
    // console.log(decoded,token,"hjg")
    const redisKey = `employee:${decoded.id}:token`;
    const redisToken = await redis.get(redisKey);
  // console.log(redisToken,"po")
    if (!redisToken || redisToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    req.user = decoded; // attach decoded user to request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};


export const authorizationCompany = async (req, res, next) => {
  try {
    // Correct spelling + correct cookie name
    const token = req.cookies?.companyAdminKey;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing",
      });
    }
// console.log(token,"kk")
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach decoded user to request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

