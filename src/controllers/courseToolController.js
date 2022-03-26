import mongoose from "mongoose";
import { courseSchema, scheduleSchema } from "../models/courseModel.js";
import { fceSchema } from "../models/fceModel.js";
import { standardizeID, singleToArray } from "../api/util.js";

const Course = mongoose.model("Course", courseSchema);
const Schedule = mongoose.model("Schedule", scheduleSchema);
const FCE = mongoose.model("FCE", fceSchema);

const MAX_LIMIT = 10;
let projection = { _id: false, __v: false };

export const getFilteredCourses = (req, res) => {
  let filterParams = [
    "name",
    "courseID",
    "department",
    "units",
    "prereqs",
    "coreqs",
    "keywords",
  ];

  let requestParams = [
    "page",
    "limit",
    "schedules",
    "schedulesAvailable",
    "fces",
  ];

  let matchQuery = {};

  for (var key in req.query) {
    if (filterParams.includes(key)) {
      if (key === "courseID") {
        matchQuery["courseID"] = {
          $in: singleToArray(req.query.courseID).map(standardizeID),
        };
      } else if (key === "prereqs") {
        matchQuery["prereqs"] = { $in: singleToArray(req.query.prereqs) };
      } else if (key === "coreqs") {
        matchQuery["coreqs"] = { $in: singleToArray(req.query.coreqs) };
      } else if (key === "department") {
        matchQuery["department"] = { $in: singleToArray(req.query.department) };
      } else if (key === "keywords") {
        matchQuery["$text"] = { $search: req.query.keywords };
      } else {
        matchQuery[key] = req.query[key];
      }
    } else if (!requestParams.includes(key)) {
      return res.status(400).json({ message: "Bad Request", invalidKey: key });
    }
  }

  let projection = { _id: false, __v: false };
  if ("keywords" in req.query) projection.score = { $meta: "textScore" };

  let options = { projection };

  if ("keywords" in req.query) options.sort = { score: { $meta: "textScore" } };
  if ("page" in req.query) options.page = req.query.page;

  if ("limit" in req.query)
    options.limit = Math.max(req.query.limit, MAX_LIMIT);
  else options.limit = MAX_LIMIT;

  options.populate = [];

  if ("schedules" in req.query && req.query.schedules)
    options.populate.push({
      path: "schedules",
      model: Schedule,
      select: "-_id",
    });

  if ("schedulesAvailable" in req.query && req.query.schedulesAvailable)
    options.populate.push({
      path: "schedules",
      model: Schedule,
      select: "year semester session -_id",
    });

  // Can only get FCE information if POST request
  if (req.method === "POST") {
    if ("fces" in req.query && req.query.fces) {
      options.populate.push({
        path: "fces",
        model: FCE,
        select: "-_id",
      });
    }
  }

  console.log(options);
  Course.paginate(matchQuery, options)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).send(err));
};

export const getCourseInfo = (req, res) => {
  const courseID = standardizeID(req.params.courseID);

  let options = {};
  if ("schedules" in req.query && req.query.schedules)
    options.populate = { path: "schedules", model: Schedule };

  Course.findOne({ courseID }, "-_id -__v", options)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).send(err));
};

export const getCourses = (req, res) => {
  const courseIDs = singleToArray(req.query.courseID).map(standardizeID);

  let options = { projection, populate: [] };
  if ("schedulesAvailable" in req.query && req.query.schedulesAvailable)
    options.populate.push({
      path: "schedules",
      model: Schedule,
      select: "year semester session -_id",
    });

  if (req.method === "POST") {
    if ("fces" in req.query && req.query.fces) {
      options.populate.push({
        path: "fces",
        model: FCE,
        select: "-_id",
      });
    }
  }

  Course.find(
    {
      courseID: { $in: courseIDs },
    },
    "-__id -__v",
    options
  )
    .then((result) => res.json(result))
    .catch((err) => res.status(500).send(err));
};
