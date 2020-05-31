import mongoose from "mongoose";
import { courseSchema } from "../models/courseModel";
import fs from "fs";
import { standardizeID } from "../api/util.js";

const Course = mongoose.model("Course", courseSchema);
const resultFilter =
  "-_id -__v -lectures._id -lectures.times._id -sections._id -sections.times._id";

export const getCourseWithID = (req, res) => {
  let id = standardizeID(req.params.courseID);
  Course.findOne({ courseID: id }, (err, course) => {
    if (err) return res.status(500).send(err);
    if (!course)
      return res.status(400).send({ message: "Unknown course ID" });
    return res.json(course);
  }).select(resultFilter);
};

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

export const addCourse = (req, res) => {
  let newCourse = new Course(req.body);
  Course.find({ courseID: req.body.courseID }, (err, docs) => {
    if (docs.length > 0) {
      res.send({ message: "Course already exists! Try PUT instead." });
    } else {
      newCourse.save((err, course) => {
        if (err) return res.status(500).send(err);
        return res.json(course);
      });
    }
  });
};

export const addCoursesFromJSON = (req, res) => {
  let data = fs.readFileSync("./data/" + req.body.file);
  let parsed = JSON.parse(data);
  let result = {
    added: [],
    exists: [],
  };
  for (var course in parsed.courses) {
    if (parsed.courses[course].prereqs_obj.reqs_list != null) {
      var prereqs = parsed.courses[course].prereqs_obj.reqs_list[0];
    } else {
      var prereqs = null;
    }
    if (parsed.courses[course].coreqs_obj.reqs_list != null) {
      var coreqs = parsed.courses[course].coreqs_obj.reqs_list[0];
    } else {
      var coreqs = null;
    }
    let courseObj = {
      courseID: course,
      desc: parsed.courses[course].desc,
      prereqs: prereqs,
      coreqs: coreqs,
      name: parsed.courses[course].name,
      units: parsed.courses[course].units,
      department: parsed.courses[course].department,
      lectures: parsed.courses[course].lectures,
      sections: parsed.courses[course].sections,
    };

    Course.find({ courseID: courseObj.courseID }, (err, docs) => {
      if (docs.length == 0) {
        let newCourse = new Course(courseObj);
        newCourse.save((err, course) => {
          if (err) {
            res.send(err);
          }
        });
      }
    });
  }
  res.json({ message: "Successfully added documents" });
};

export const updateCourse = (req, res) => {
  let id = standardizeID(req.params.courseID);
  Course.findOneAndUpdate({ courseID: id }, (err, course) => {
    if (err) return res.status(500).send(err);
    return res.json(course);
  });
};
