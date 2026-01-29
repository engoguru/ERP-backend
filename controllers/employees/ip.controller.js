import ipModel from "../../models/employees/ip.model.js";


export const createIp = async (req, res) => {
  try {
    const { employeeId, licenseId, ip } = req.body;

    const newIp = await ipModel.create({
      employeeId,
      licenseId,
      ip,
    });

    res.status(201).json({
      success: true,
      data: newIp,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This IP is already assigned to this employee and license",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getAllIps = async (req, res) => {
  try {
    const ips = await Ip.find()
      .populate("employeeId")
      .populate("licenseId");

    res.status(200).json({
      success: true,
      count: ips.length,
      data: ips,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const updateIp = async (req, res) => {
  try {
    const updatedIp = await Ip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedIp) {
      return res.status(404).json({
        success: false,
        message: "IP record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedIp,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteIp = async (req, res) => {
  try {
    const deletedIp = await Ip.findByIdAndDelete(req.params.id);

    if (!deletedIp) {
      return res.status(404).json({
        success: false,
        message: "IP record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "IP record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
