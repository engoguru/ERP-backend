import { isValidObjectId } from "mongoose";
import reTreatModel from "../../models/reTreat.model.js";
import sncModel from "../../models/snc/sncregister.model.js";
import sncServiceModel from "../../models/snc/sncservice.model.js";
import { generateUploadURL } from "../../config/awsS3.js";

export const sncServiceCreate = async (req, res) => {
  try {
    const { id: reTreat } = req.params;
    const { id, licenseId } = req.user
    // console.log(req.body,"opo")
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reTreat ID"
      })
    }
    const sncId = await sncModel.findOne({ retreat_id: reTreat }).select(" _id")
    if (sncId) {
      req.body.sncId = sncId._id
    }
    if (req.user) {
      req.body.createdBy = id;
      req.body.licenseId = licenseId;
    }
    // sncServiceModel
    const data = await sncServiceModel.create(req.body)
    return res.status(201).json({
      success: true,
      message: "SNC service created successfully",
      data
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

// user detail for snc

export const sncUserDetail = async (req, res) => {
  try {

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SNC ID"
      })
    }
    const data = await reTreatModel.findById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No reTreat data found for the given SNC ID"
      })
    }
    return res.status(200).json({
      success: true,
      message: "SNC user details fetched successfully",
      data
    })


  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const sncServiceViewAllByUser = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SNC ID"
      })
    }
    const page = req.query.pag || 1
    const limit = req.query.limit || 100
    const skip = (page - 1) * limit
    const data = await sncServiceModel.find({ sncId: id }).skip(skip).limit(limit).sort({ createdAt: -1 })
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "No SNC Service data found for the given SNC ID"

      })
    }
    return res.status(200).json({
      success: true,
      message: "Data Found",
      data: data
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: ""
    })
  }
}

export const sncServiceViewOne = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SNC Service ID",
      });
    }

    const data = await sncServiceModel.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No SNC Service data found for the given ID",
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
      message: "SNC Service details fetched successfully",
      data,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const sncServiceOneUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SNC Service ID"
      });
    }
    if (req.body.assigned) {
      req.body.assigned = JSON.parse(req.body.assigned);
    }
    const {
      serviceName,
      totalAmount,
      paidAmount,
      unpaidAmount,
      gstAmount,
      otherExpanses,
      status,
      docs,
      allowedby,
      assigned
    } = req.body;

    const data = await sncServiceModel.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No SNC Service data found for the given ID"
      });
    }

    const updateFields = {
      serviceName,
      totalAmount,
      paidAmount,
      unpaidAmount,
      gstAmount,
      otherExpanses,
      status,
      allowedby,
      assigned
    };

    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] !== undefined) {
        data[key] = updateFields[key];
      }
    });

    if (Array.isArray(docs)) {
      data.docs = [...(data.docs || []), ...docs];
    }

    await data.save();

    return res.status(200).json({
      success: true,
      message: "SNC Service data updated successfully",
      data
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};



// here we view all services by checking id isniode the assigned


export const viewAllservices = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    // Admin: fetch all active services
    if (role === "Admin") {
      const services = await sncServiceModel.find({
        assigned: {
          $elemMatch: {
            status: "Active",
          },
        },
      }).populate({
        path: "sncId",
        populate: {
          path: "retreat_id",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Services fetched successfully",
        count: services.length,
        data: services,
      });
    }

    // Validate user ID for non-admin users
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    // Fetch services assigned to the user
    const services = await sncServiceModel.find({
      assigned: {
        $elemMatch: {
          userId: id,
          status: "Active",
        },
      },
    }).select();

    return res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};