import mongoose from "mongoose";
import { courseSchema } from "../models/courseModel.js";
import { standardizeID, singleToArray } from "../api/util.js";

const Course = mongoose.model("Course", courseSchema);
const resultFilter = "-_id -__v";

/**
 * Get a course by course ID.
 * Sends the course object via response object.
 * @param {Object} req request object
 * @param {string} req.params.courseID course ID
 * @param {Object} res response object
 */
export const getCourseWithID = (req, res) => {
  let id = standardizeID(req.params.courseID);
  Course.findOne({ courseID: id }, (err, course) => {
    if (err) return res.status(500).send(err);
    if (!course) return res.status(404).send({ message: "Unknown course ID" });
    return res.json(course);
  }).select(resultFilter);
};

/**
 * Get courses by different parameters.
 * Sends the course objects via response object.
 * @param {Object} req request object
 * @param {String[]} [req.query.prereqs] prerequisite courses by course IDs
 * @param {String[]} [req.query.coreqs] corequisite courses by course IDs
 * @param {String} [req.query.courseID] course ID of course
 * @param {String} [req.query.name] name of course
 * @param {String} [req.query.department] department of course
 * @param {String} [req.query.units] number of units
 * @param {Object} res response object
 */
export const getCourses = (req, res) => {
  let requestParams = [
    "name",
    "courseID",
    "department",
    "units",
    "prereqs",
    "coreqs",
  ];
  let queryBody = new Object();
  for (var key in req.query) {
    if (requestParams.includes(key)) {
      if (key === "courseID") {
        queryBody["courseID"] = {
          $in: singleToArray(req.query.courseID).map(standardizeID),
        };
      } else if (key === "prereqs") {
        queryBody["prereqs"] = { $in: singleToArray(req.query.prereqs) };
      } else if (key === "coreqs") {
        queryBody["prereqs"] = { $in: singleToArray(req.query.coreqs) };
      } else {
        queryBody[key] = req.query[key];
      }
    } else {
      return res.status(400).json({ message: "Bad Request", invalidKey: key });
    }
  }
  Course.find(queryBody, (err, course) => {
    if (err) return res.status(500).send(err);
    return res.json(course);
  }).select(resultFilter);
};
