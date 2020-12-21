import mongoose from "mongoose";
import { fceSchema } from "../models/fceModel";
import { parseFCEData } from "../api/parser";
import { standardizeID } from "../api/util.js";

const FCE = mongoose.model("FCE", fceSchema);
const resultFilter = "-_id -__v";

export const getFCEWithID = (req, res) => {
  let id = standardizeID(req.params.courseID);
  let query = { courseID: id };
  if (req.body.instructors) {
    query.instructor = { $in: req.body.instructors };
  }
  if (req.body.semesters) {
    query.semester = { $in: req.body.semesters };
  }
  
  FCE.findOne(query, (err, fce) => {
    if (err) return res.status(500).send(err);
    if (!fce) return res.status(404).json({ message: "Unknown course ID" });
    return res.json(fce);
  }).select(resultFilter);
};

export const getFCEs = (req, res) => {
  FCE.find({}, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  }).select(resultFilter);
};
