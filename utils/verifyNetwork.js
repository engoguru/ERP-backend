import ipModel from "../models/employees/ip.model.js";



export const checkIpAllowed = async (licenseId, clientIp) => {
  const allowedIp = await ipModel.findOne({ licenseId, ip: clientIp });
  return !!allowedIp;
};
