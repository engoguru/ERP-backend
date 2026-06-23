import paymentModel from "../../models/snc/sncpayment.model.js"

export const createPayment = async (req, res) => {
  try {
 
    const { id, licenseId } = req.user
    const { paymentMode, sncId, Amount } = req.body;

    // basic validation
    if (!paymentMode || !Amount) {
      return res.status(400).json({
        success: false,
        message: "paymentMode and Amount are required",
      });
    }

 

    const payment = await paymentModel.create({
      sncId,
      licenseId,
      createdBy:id,
      paymentMode,
      Amount,
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// View All Proposals
export const viewAllPayment = async (req, res) => {
    try {
        const { id } = req.params
        //  console.log(id)
        const payment = await paymentModel
            .find({ sncId: id })
            .sort({ createdAt: -1 });


        return res.status(200).json({
            success: true,
            total: payment.length,
            data: payment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
