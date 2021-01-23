import mongoose from "mongoose";
import { fceSchema } from "../models/fceModel.js";
import { standardizeID, singleToArray } from "../api/util.js";

const FCE = mongoose.model("FCE", fceSchema);
const resultFilter = "-_id -__v";

/**
 * Gets FCE by course ID, optionally by instructors and semesters.
 * Sends FCE via response object.
 * @param {Object} req request object
 * @param {string} req.params.courseID course ID
 * @param {string|string[]} [req.query.instructors] instructor(s) names
 * @param {string[]} req.query.semesters semesters
 * @param {Object} res response object
 */
export const getFCEWithID = (req, res) => {
  let id = standardizeID(req.params.courseID);
  let query = { courseID: id };
  if (req.query.instructors) {
    query.instructor = { $in: req.query.instructors };
  }
  if (req.query.semesters) {
    query.semester = { $in: req.query.semesters };
  }

  FCE.find(query, (err, fce) => {
    if (err) return res.status(500).send(err);
    if (!fce) return res.status(404).json({ message: "Unknown course ID" });
    return res.json(fce);
  }).select(resultFilter);
};

/**
 * Gets all FCEs and sends via response object.
 * @param {Object} req request object
 * @param {Object} res response object
 */
export const getFCEs = (req, res) => {
  let requestParams = [
    "name",
    "courseID",
    "year",
    "semester",
    "college",
    "andrewID",
  ];
  let queryBody = new Object();
  for (var key in req.query) {
    if (requestParams.includes(key)) {
      if (key === "courseID") {
        queryBody["courseID"] = {
          $in: singleToArray(req.query.courseID).map(standardizeID),
        };
      } else if (key == "semester") {
        queryBody["semester"] = { $in: singleToArray(req.query.semester) };
      } else if (key == "year") {
        queryBody["year"] = { $in: singleToArray(req.query.year) };
      } else {
        queryBody[key] = req.query[key];
      }
    } else {
      return res.status(400).json({ message: "Bad Request", invalidKey: key });
    }
  }
  FCE.find(queryBody, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  }).select(resultFilter);
};
