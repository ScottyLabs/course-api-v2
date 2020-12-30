import mongoose from "mongoose";
import { courseSchema } from "../models/courseModel.js";
import fs from "fs";
import { standardizeID } from "../api/util.js";

const Course = mongoose.model("Course", courseSchema);
const resultFilter =
  "-_id -__v";

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
    if (!course)
      return res.status(404).send({ message: "Unknown course ID" });
    return res.json(course);
  }).select(resultFilter);
};

/**
 * Get courses by different parameters.
 * Sends the course objects via response object. 
 * @param {Object} req request object
 * @param {String[]} [req.body.prereqs] prerequisite courses by course IDs
 * @param {String[]} [req.body.coreqs] corequisite courses by course IDs
 * @param {String} [req.body.courseID] course ID of course
 * @param {String} [req.body.name] name of course
 * @param {String} [req.body.department] department of course
 * @param {String} [req.body.units] number of units
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
  for (var key in req.body) {
    if (requestParams.includes(key)) {
      if (key == "prereqs" && req.body.prereqs instanceof Array) {
        queryBody["prereqs"] = { $in: req.body.prereqs };
      } else if (key == "coreqs" && req.body.coreqs instanceof Array) {
        queryBody["coreqs"] = { $in: req.body.coreqs };
      } else {
        queryBody[key] = req.body[key];
        if (key == "courseID") {
          queryBody[key] = standardizeID(queryBody[key]);
        }
      }
    } else {
      res.json({ message: "bad query", invalidKey: key });
    }
  }
  Course.find(queryBody, (err, course) => {
    if (err) return res.status(500).send(err);
    return res.json(course);
  }).select(resultFilter);
};