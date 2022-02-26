import mongoose from "mongoose";
import { profSchema } from "../models/profModel.js";
import { standardizeID, singleToArray } from "../api/util.js";

const Prof = mongoose.model("Professor", profSchema);
const resultFilter = "-_id -__v";

/**
 * Gets a professor by name.
 * Sends professor via response object.
 * @param {Object} req request object
 * @param {string} req.params.name professor name
 * @param {Object} res response object
 */
export const getProfWithName = (req, res) => {
    Prof.findOne({ _id: req.params.name.toUpperCase() }, (err, prof) => {
        if (err) return res.status(500).send(err);
        if (!prof) return res.status(404).send({ message: "Unknown professor name" });
        return res.json(prof);
    }).select(resultFilter);
};

