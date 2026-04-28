import { generateUploadURL } from "../../config/awsS3.js";
import reTreatModel from "../../models/reTreat.model.js";
import sncModel from "../../models/snc/sncregister.model.js";


export const allSncEligible = async (req, res) => {
  try {
    const { search } = req.query;
    const escapeRegex = (text) =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let query = {
      "attendance.mark": "Present"
    };

    if (search) {
      const safeSearch = escapeRegex(search.trim());

      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { contact: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const data = await reTreatModel.find(query);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const sncRegister = async (req, res) => {
  try {
    const {
      retreat_id,
      joinStatus,
      sncType,
      totalServiceAmount,
      paidAmount,
      unpaidAmount,
      gstAmount,
      docs
    } = req.body;

    // Basic validation
    if (!retreat_id || !joinStatus || !sncType || totalServiceAmount == null || paidAmount == null || unpaidAmount == null || gstAmount == null) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Optional: extra validation
    if (!["Active", "Inactive"].includes(joinStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    if (!["A", "B", "C"].includes(sncType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid memberType value"
      });
    }
    // sncModel
    // Create new record
    const newSnc = await sncModel.create({
      retreat_id,
      createdBy: req.user?._id, // assuming auth middleware
      licenseId: req.user?.licenseId, // optional if available
      joinStatus,
      sncType,
      totalServiceAmount,
      paidAmount,
      unpaidAmount,
      gstAmount,
      docs
    });

    return res.status(201).json({
      success: true,
      message: "SNC registered successfully",
      data: newSnc
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const sncviewAllId = async (req, res) => {
  try {
    const data = await sncModel.find().select("retreat_id")
    return res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message || "something went wrong"
    })
  }
}

export const sncViewAll = async (req, res) => {
  try {
    const data = await sncModel
      .find()
      .populate("retreat_id")
      .populate("createdBy")
      .populate("licenseId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const sncViewOne = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await sncModel.findOne({ retreat_id: id });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    // Ensure docs exists and is iterable
    if (Array.isArray(data.docs)) {
      data.docs = await Promise.all(
        data.docs.map(async (pic) => {
          const url = await generateUploadURL(pic.public_id);
          return {
            ...pic.toObject?.() || pic,
            url
          };
        })
      );
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const sncUpdate = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      joinStatus,
      sncType,
      totalServiceAmount,
      paidAmount,
      gstAmount,
      unpaidAmount,
      docs
    } = req.body;

   
    const existing = await sncModel.findOne({ retreat_id: id });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    // Optional validation
    if (joinStatus && !["Active", "Inactive"].includes(joinStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    if (sncType && !["A", "B", "C"].includes(sncType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid memberType value"
      });
    }
    console.log(typeof(unpaidAmount))
    if (joinStatus) {
      existing.joinStatus = joinStatus
    }
    if (paidAmount) {
      existing.paidAmount = paidAmount
    }
    if (unpaidAmount !== "") {
      existing.unpaidAmount = unpaidAmount
    }
    if (sncType) {
      existing.sncType = sncType
    }
    if (gstAmount) {
      existing.gstAmount = gstAmount
    }
    if(totalServiceAmount){
      existing.totalServiceAmount = totalServiceAmount
    }
    if (docs) {
      existing.docs = [...existing.docs, ...docs]
    }
    // Recalculate unpaidAmount if amounts are updated

  await existing.save()
    return res.status(200).json({
      success: true,
      message: "Record updated successfully",
     data:existing
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};