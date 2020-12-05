import mongoose from "mongoose";
import { scheduleSchema } from "../models/courseModel.js";
import fs from "fs";
import { standardizeID } from "../api/util.js";

const Schedule = mongoose.model("Schedule", scheduleSchema);
const resultFilter =
  "-_id -lectures._id -lectures.times._id -sections._id -sections.times._id -__v";

const singleToArray = (param) => {
  if (param instanceof Array) {
    return param;
  } else {
    return [param];
  }
};

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

export const getSchedules = (req, res) => {
  let requestParams = ["courseID", "semester", "year"];
  let queryBody = new Object();

  for (const key in req.body) {
    if (requestParams.includes(key)) {
      if (key == "courseID") {
        queryBody["courseID"] = {
          $in: singleToArray(req.body.courseID).map(standardizeID),
        };
      } else if (key == "semester") {
        queryBody["semester"] = { $in: singleToArray(req.body.semester) };
      } else if (key == "year") {
        queryBody["year"] = { $in: singleToArray(req.body.year) };
      }
    } else {
      res.json({ message: "bad query", invalidKey: key });
    }
  }

  Schedule.find(queryBody, (err, schedules) => {
    if (err) return res.status(500).send(err);
    return res.json(schedules);
  }).select(resultFilter);
};
