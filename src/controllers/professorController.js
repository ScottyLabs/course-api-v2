import mongoose from "mongoose";
import { profSchema } from "../models/profModel.js";

const Prof = mongoose.model("Professor", profSchema);
const resultFilter = "-_id -__v";

/**
 * Gets all Professors and sends via response object.
 * @param {Object} req request object
 * @param {String} [req.query.instructor] Instructor  DOES THIS WORK?
 * @param {String} [req.query.andrewID] Andrew ID
 * @param {Object[]} [req.query.courses] Courses
 * @param {Number} [req.query.respectForStudents] Respect For Students
 * @param {Number} [req.query.interestInLearning] Interest in Learning
 * @param {Number} [req.query.providesFeedback] Provide Feedback
 * @param {Object} res response object
 */
export const getProfs = (req, res) => {
  let requestParams = ["andrewID", "courses", "name"];
  let queryBody = new Object();
  for (var key in req.query) {
    if (requestParams.includes(key)) {
      if (key === "name") {
        queryBody["name"] = {
          $regex: new RegExp(req.query[key]),
          $options: "i",
        };
      } else {
        queryBody[key] = req.query[key];
      }
    } else {
      return res.status(400).json({ message: "Bad Request", invalidKey: key });
    }
  }
  console.log(queryBody);
  Prof.find(queryBody, (err, result) => {
    if (err) return res.status(500).send(err);
    return res.json(result);
  }).select(resultFilter);
};
