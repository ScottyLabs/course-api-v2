import mongoose from "mongoose";
import { scheduleSchema } from "../models/courseModel.js";
import { standardizeID, singleToArray } from "../api/util.js";

const Schedule = mongoose.model("Schedule", scheduleSchema);
const resultFilter =
  "-_id -lectures._id -lectures.times._id -sections._id -sections.times._id -__v";

// TODO: Currently unused
export const getSchedule = (req, res) => {
  let courseID = standardizeID(req.params.courseID);
  let semester = req.params.semester;
  let year = req.params.year;

  Schedule.findOne({ courseID, semester, year }, (err, schedule) => {
    if (err) return res.status(500).send(err);
    if (!schedule) {
      return res
        .status(404)
        .send({ message: "Unknown course ID, semester & year" });
    }
    return res.json(schedule);
  }).select(resultFilter);
};

/**
 * Get a schedule by the filter parameters. Empty filter will return all.
 * Sends the course object via response object.
 * @param {Object} req request object
 * @param {string} req.params.courseID course ID
 * @param {string} req.params.semester semester to filter
 * @param {string} req.params.year year to filter
 * @param {Object} res response object
 */
export const getSchedules = (req, res) => {
  let requestParams = ["courseID", "semester", "year"];
  let queryBody = new Object();

  for (const key in req.query) {
    if (requestParams.includes(key)) {
      if (key == "courseID") {
        queryBody["courseID"] = {
          $in: singleToArray(req.query.courseID).map(standardizeID),
        };
      } else if (key == "semester") {
        queryBody["semester"] = { $in: singleToArray(req.query.semester) };
      } else if (key == "year") {
        queryBody["year"] = { $in: singleToArray(req.query.year) };
      }
    } else {
      return res.status(400).json({ message: "Bad Request", invalidKey: key });
    }
  }

  Schedule.find(queryBody, (err, schedules) => {
    if (err) return res.status(500).send(err);
    return res.json(schedules);
  }).select(resultFilter);
};
