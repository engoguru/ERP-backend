import jwt from "jsonwebtoken";

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
    const token = req.cookies?.companyKey;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing",
      });
    }

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

