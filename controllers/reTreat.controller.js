export const registerTreat = async (req, res) => {
 console.log("listen")

  // try {
  //   const {
  //     name,
  //     email,
  //     contact,
  //     source,
  //     paidAmount = 0,
  //     totalAmount,
  //     service,
  //     status = "Pending"
  //   } = req.body;

  //   //  Validation
  //   if (!name || !email || !contact || !source || !totalAmount || !service) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "All required fields must be provided"
  //     });
  //   }

  //   //  Check duplicate email/contact
  //   const existing = await reTreatModel.findOne({
  //     $or: [{ email }, { contact }]
  //   });

  //   if (existing) {
  //     return res.status(409).json({
  //       success: false,
  //       message: "User with this email or contact already exists"
  //     });
  //   }

  //   //  Create
  //   const newTreat = await reTreatModel.create({
  //     name,
  //     email,
  //     contact,
  //     source,
  //     paidAmount,
  //     totalAmount,
  //     service,
  //     status,
  //     employeeId: req.user?._id,
  //     licenseId: req.user?.licenseId
  //   });

  //   return res.status(201).json({
  //     success: true,
  //     message: "Retreat registered successfully",
  //     data: newTreat
  //   });

  // } catch (error) {
  //   return res.status(500).json({
  //     success: false,
  //     message: error.message
  //   });
  // }
};

export const getAllTreats = async (req, res) => {
  try {
    const data = await reTreatModel
      .find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getTreatById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await reTreatModel.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found"
      });
    }

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const updateTreat = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await reTreatModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const deleteTreat = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await reTreatModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





export const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, action } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const treat = await reTreatModel.findById(id);

    if (!treat) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found"
      });
    }

    treat.feedback.push({
      message,
      action: action || "Pending",
      submittedBy: req.user?._id
    });

    await treat.save();

    res.status(200).json({
      success: true,
      message: "Feedback added",
      data: treat
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};