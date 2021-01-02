import mongoose from "mongoose";
import { fceSchema } from "../models/fceModel.js";
import { standardizeID } from "../api/util.js";

const FCE = mongoose.model("FCE", fceSchema);
const resultFilter = "-_id -__v";

/**
 * Gets FCE by course ID, optionally by instructors and semesters.
 * Sends FCE via response object.
 * @param {Object} req request object
 * @param {string} req.params.courseID course ID
 * @param {string|string[]} [req.body.instructors] instructor(s) names
 * @param {string[]} req.body.semesters semesters
 * @param {Object} res response object
 */
export const getFCEWithID = (req, res) => {
  let id = standardizeID(req.params.courseID);
  let query = { courseID: id };
  if (req.body.instructors) {
    query.instructor = { $in: req.body.instructors };
  }
  if (req.body.semesters) {
    query.semester = { $in: req.body.semesters };
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
  for (var key in req.body) {
    if (requestParams.includes(key)) {
      if (key === "courseID") {
        queryBody["courseID"] = {
          $in: singleToArray(req.body.courseID).map(standardizeID),
        };
      } else if (key == "semester") {
        queryBody["semester"] = { $in: singleToArray(req.body.semester) };
      } else if (key == "year") {
        queryBody["year"] = { $in: singleToArray(req.body.year) };
      } else {
        queryBody[key] = req.body[key];
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
