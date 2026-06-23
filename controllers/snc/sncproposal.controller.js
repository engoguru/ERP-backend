import proposalModel from "../../models/snc/sncproposal.model.js";


// Create Proposal
export const createProposal = async (req, res) => {
    try {
        // console.log(req.body, "po")
        const {
            sncId,
            projectName,
            Fee,
            expanses,
            totalAmount,
            paidAmount,
            unPaidAmount
        } = req.body;
        const { licenseId,
            id, } = req.user
        if (!projectName || !Fee) {
            return res.status(400).json({
                success: false,
                message: "Project Name and Fee are required"
            });
        }


        const proposal = await proposalModel.create({
            sncId,
            licenseId,
            createdBy: id,
            projectName,
            Fee,
            expanses,
            totalAmount,
            paidAmount,
            unPaidAmount
        });

        return res.status(201).json({
            success: true,
            message: "Proposal created successfully",
            data: proposal
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// View All Proposals
export const viewAllProposal = async (req, res) => {
    try {
        const { id } = req.params
        //  console.log(id)
        const proposals = await proposalModel
            .find({ sncId: id })
            .sort({ createdAt: -1 });


        return res.status(200).json({
            success: true,
            total: proposals.length,
            data: proposals
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// View One Proposal
export const viewOneProposal = async (req, res) => {
    try {

        const { id } = req.params;

        const proposal = await proposalModel
            .findById(id)
            .populate("sncId")
            .populate("licenseId")
            .populate("createdBy");

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: proposal
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Update Proposal
export const updateProposal = async (req, res) => {
    try {

        const { id } = req.params;

        const proposal = await proposalModel.findById(id);

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        const {
            projectName,
            Fee,
            expanses,
            status,
            sncId,
            licenseId,
            createdBy
        } = req.body;

        if (projectName) proposal.projectName = projectName;
        if (Fee) proposal.Fee = Fee;
        if (expanses !== undefined) proposal.expanses = expanses;
        if (status) proposal.status = status;
        if (sncId) proposal.sncId = sncId;
        if (licenseId) proposal.licenseId = licenseId;
        if (createdBy) proposal.createdBy = createdBy;

        proposal.totalAmount =
            Number(proposal.Fee) +
            Number(proposal.expanses);

        await proposal.save();

        return res.status(200).json({
            success: true,
            message: "Proposal updated successfully",
            data: proposal
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Delete Proposal
export const deleteProposal = async (req, res) => {
    try {

        const { id } = req.params;

        const proposal = await proposalModel.findById(id);

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        await proposal.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Proposal deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};