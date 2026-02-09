import mongoose, { isValidObjectId } from "mongoose";
import eventModel from "../../models/employees/event.model.js";

/**
 * CREATE EVENT
 */
export const eventCreate = async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Form is empty!" });
        }
        const { startDate, endDate, employeeId, licenseId } = req.body;

        const existingEvent = await eventModel.findOne({
            employeeId,
            licenseId,
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) },
        });

        if (existingEvent) {
            return res.status(400).json({ message: " Event Already exist !" });
        }
        const eventData = await eventModel.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: eventData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE EVENT
 */
export const eventUpdate = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid Event ID" });
        }

        const updatedEvent = await eventModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: updatedEvent
        });
    } catch (error) {
        next(error);
    }
};

/**
 * VIEW SINGLE EVENT
 */
export const eventViewOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid Event ID" });
        }

        const event = await eventModel
            .findById(id)
            .populate("licenseId")
            .populate("employeeId");

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};


// view  company specific 
export const eventView = async (req, res, next) => {
    try {

        const { page = 1, limit = 100 } = req.query;
        const licenseId=req.user.licenseId
        const filter = {};
        if (licenseId && isValidObjectId(licenseId)) {
            filter.licenseId = licenseId;
        }

        const events = await eventModel
            .find(filter)
            .select("eventName startDate endDate totaldays description licenseId")
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ startDate: -1 });

        const total = await eventModel.countDocuments(filter);

        return res.status(200).json({
            success: true,
            type: "basic",
            total,
            page: Number(page),
            limit: Number(limit),
            data: events
        });
    } catch (error) {
        next(error);
    }
};

/**
 * VIEW ALL EVENTS (Admin / Detailed View)
 */
export const eventViewAll = async (req, res, next) => {
    try {
        const { page = 1, limit = 100 } = req.query;

        const filter = {};
        if (licenseId && isValidObjectId(licenseId)) {
            filter.licenseId = licenseId;
        }

        const events = await eventModel
            .find(filter)
            .populate("employeeId", "name email")
            .populate("licenseId", "planName companyName")
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ startDate: -1 });

        const total = await eventModel.countDocuments(filter);

        return res.status(200).json({
            success: true,
            type: "detailed",
            total,
            page: Number(page),
            limit: Number(limit),
            data: events
        });
    } catch (error) {
        next(error);
    }
};


/**
 * DELETE EVENT
 */
export const eventdelete = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid Event ID" });
        }

        const deletedEvent = await eventModel.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * EVENT TRIGGER (Example: Activate / Notify)
 */
export const eventTrigger = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid Event ID" });
        }

        const event = await eventModel.findById(id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Example trigger logic (customize for SaaS)
        event.triggeredAt = new Date();
        await event.save();

        return res.status(200).json({
            success: true,
            message: "Event triggered successfully",
            data: event
        });
    } catch (error) {
        next(error);
    }
};
