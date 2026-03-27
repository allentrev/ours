import { Request, Response } from "express";
import RefData from "../models/refData.model.js";
import { RefDataDocument } from "../types/refData.js";

export const getAllRefData = async (req: Request, res: Response) => {
    try {
        console.log("refData.controller, getAllRefData");
        const refData: RefDataDocument[] = await RefData.find().sort({
            refKey: 1,
        });
        res.status(200).json(refData);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch refData", error });
    }
};

export const getPageRefData = async (
    req: Request<{ webPage: string }>,
    res: Response
) => {
    try {
        const wWebPage = req.params.webPage;
        const refData: RefDataDocument[] = await RefData.find({
            webPage: wWebPage,
        })
        .sort({ refKey: 1});
        console.log(
            "refData.controller, getPageRefData",
            wWebPage,
            `${refData.length} records`
        );
        res.status(200).json(refData);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch page refData",
            error,
        });
    }
};

export const getRefData = async (
    req: Request<{ refKey: string }>,
    res: Response
) => {
    try {
        const refKey = req.params.refKey;
        console.log("refData.controller, getRefData", refKey);
        const refData: RefDataDocument | null = await RefData.findOne({
            refKey,
        });
        if (!refData)
            return res.status(404).json({ message: "RefData not found" });
        res.status(200).json(refData);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch refData", error });
    }
};

export const createRefData = async (
    req: Request<{}, {}, Partial<RefDataDocument>>,
    res: Response
) => {
    try {
        console.log("refData.controller, createRefData", req.body);
        const newRefData = new RefData(req.body);
        const savedRefData: RefDataDocument = await newRefData.save();
        console.log("refData created");
        res.status(201).json(savedRefData);
    } catch (error) {
        console.error("refData Save Failed:", error);
        res.status(500).json({ message: "Error creating refData", error });
    }
};

export const updateRefData = async (
    req: Request<{ refKey: string }, {}, Partial<RefDataDocument>>,
    res: Response
) => {
    try {
        const refKey = req.params.refKey;
        const updateData = req.body;
        console.log("refData.controller, updateRefData", refKey, updateData);

        const updatedRefData: RefDataDocument | null =
            await RefData.findOneAndUpdate({ refKey }, updateData, {
                new: true,
            });

        if (!updatedRefData)
            return res.status(404).json({ message: "RefData not found" });
        res.status(200).json(updatedRefData);
    } catch (error) {
        console.error("Error updating RefData:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const updateAllRefData = async (
    req: Request<{}, {}, Partial<RefDataDocument>[]>,
    res: Response
) => {
    const updatedRecords = req.body;
    if (!Array.isArray(updatedRecords)) {
        return res.status(400).json({
            error: "Request body must be an array of refData records",
        });
    }

    try {
        const bulkOps = updatedRecords.map(
            (record: Partial<RefDataDocument>) => ({
                updateOne: {
                    filter: { refKey: record.refKey },
                    update: {
                        $set: {
                            webPage: record.webPage,
                            name: record.name,
                            value: record.value,
                        },
                    },
                    upsert: false,
                },
            })
        );

        if (bulkOps.length > 0) {
            await RefData.bulkWrite(bulkOps);
        }

        res.status(200).json({ message: "RefData updated successfully" });
    } catch (error) {
        console.error("Error updating refData:", error);
        res.status(500).json({ error: "Failed to update refData" });
    }
};

export const deleteRefData = async (
    req: Request<{ refKey: string }>,
    res: Response
) => {
    try {
        console.log("refData.controller, deleteRefData");
        const refKey = req.params.refKey;

        const deletedRefData = await RefData.findOneAndDelete({ refKey });

        if (!deletedRefData) {
            return res
                .status(404)
                .json({ message: "RefData not found or already deleted" });
        }

        res.status(200).json({ message: "RefData has been deleted" });
    } catch (error) {
        console.error("Error deleting RefData:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
