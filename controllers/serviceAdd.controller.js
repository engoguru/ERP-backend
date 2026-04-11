import { generateUploadURL } from "../config/awsS3.js";
import serviceModel from "../models/serviceAdd.model.js";


export const createService = async (req, res) => {
  try {
    const { id:treateId } = req.params;
    const { id, licenseId } = req.user;

    const newService = await serviceModel.create({
      ...req.body,
      reTreat_Id: treateId,     // override anything from body
      license_Id: licenseId,
      createdBy_Id: id
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: newService
    });

  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};



export const updateService = async (req, res) => {
    try {
        const { id } = req.params;          // get the service ID from the URL
        const updateData = { ...req.body }; // clone req.body to manipulate

        // Check if docs is present in request body
        if (updateData.docs && Array.isArray(updateData.docs)) {
            // Find the existing service first
            const service = await serviceModel.findById(id);
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }

            // Append new docs to existing docs array
            service.docs.push(...updateData.docs);

            // Remove docs from updateData to avoid replacing the array
            delete updateData.docs;

            // Update other fields if any
            Object.assign(service, updateData);

            // Save the updated service
            const updatedService = await service.save();
            return res.status(200).json(updatedService);
        }

        // If no docs in body, just update normally
        const updatedService = await serviceModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json({
          success:true,
          updatedService
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// with clinet
   
export const getAllService = async (req, res) => {
  try {
    const { id } = req.params;
    const { licenseId } = req.user;

    const services = await serviceModel.find({
      reTreat_Id: id,
      license_Id: licenseId,
    }).sort({ createdAt: -1 });

    const updatedServices = await Promise.all(
      services.map(async (service) => {
        const docsWithUrls = await Promise.all(
          (service.docs || []).map(async (doc) => {
            const url = await generateUploadURL(doc.publicId);

            return {
              ...doc.toObject(),
              url,
            };
          })
        );
// generateUploadURL
        return {
          ...service.toObject(),
          docs: docsWithUrls,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "All services",
      data: updatedServices,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


export const getOneService = async (req, res) => {
  try {
    const { id: serviceId } = req.params;

    const data = await serviceModel.findOne({ _id: serviceId });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const docsWithUrls = await Promise.all(
      (data.docs || []).map(async (doc) => {
        const url = await generateUploadURL(doc.publicId);

        return {
          ...doc.toObject(),
          url,
        };
      })
    );

    const updatedService = {
      ...data.toObject(),
      docs: docsWithUrls,
    };

    return res.status(200).json({
      success: true,
      message: "Service found",
      data: updatedService,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

   