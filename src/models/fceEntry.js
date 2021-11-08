import mongoose from "mongoose";
import { scheduleSchema } from "../models/courseModel.js";
import dotenv from "dotenv";

dotenv.config();
const database = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

export class FCEEntry {
  _castToNum(val) {
    if (val == undefined || val == "") {
      return "0";
    } else {
      return val;
    }
  }

  _insertDash(courseID) {
    if (courseID.length < 5) {
      courseID = `0${courseID}`;
    }

    if (courseID.charAt(2) != "-") {
      return courseID.substring(0, 2) + "-" + courseID.substring(2);
    }
    return courseID;
  }

  _retrieve() {
    let {
      year, //new change
      semester,
      college,
      instructor,
      andrewID,
      location,
      department,
      courseID,
      courseName,
      level,
      numRespondents,
      possibleRespondents,
      responseRate,
      hrsPerWeek,
      rating,
    } = this;
    return {
      year, //new change
      semester,
      college,
      instructor,
      andrewID,
      location,
      department,
      courseID,
      courseName,
      level,
      numRespondents,
      possibleRespondents,
      responseRate,
      hrsPerWeek,
      rating,
    };
  }

  //pass in year with constructor
  constructor(data, labels, year) {
    // Structure invariants
    console.assert(data instanceof Array, "Data is not an Array");
    console.assert(labels instanceof Array, "Labels is not an Array");
    console.assert(
      data.length == labels.length,
      "Array length mismatch " + data
    );

    let labelCount = 0;
    this.rating = [];
    this["year"] = year;
    for (let label of labels) {
      switch (label) {
        case "semester":
          this[label] = data[labelCount].toLowerCase();
          break;
        case "andrewID":
          this[label] = data[labelCount].toLowerCase();
          break;
        case "college":
        case "department":
        case "section":
        case "location":
        case "level":
        case "possibleRespondents":
        case "numRespondents":
          this[label] = data[labelCount].trim();
          break;
        case "instructor":
        case "courseName":
          this[label] = data[labelCount].toUpperCase();
          break;
        case "courseID":
          this[label] = this._insertDash(data[labelCount]);
          break;
        case "responseRate":
        case "hrsPerWeek":
          this[label] = this._castToNum(data[labelCount]);
          break;
        default:
          if (label.includes("rating")) {
            this.rating.push(this._castToNum(data[labelCount]));
          }
          break;
      }
      labelCount++;
    }
  }

  /*
      Rating:
          Interest in student learning
          Clearly explain course requirements
          Clear learning objectives & goals
          Instructor provides feedback to students to improve
          Demonstrate importance of subject matter
          Explains subject matter of course
          Show respect for all students
          Overall teaching rate
          Overall course rate
      */
  getCriteriaMiscLabels() {
    var labels = [
      "Interest in student learning",
      "Clearly explain course requirements",
      "Clear learning objectives & goals",
      "Instructor provides feedback to students to improve",
      "Demonstrate importance of subject matter",
      "Explains subject matter of course",
      "Show respect for all students",
      "Overall teaching rate",
      "Overall course rate",
    ];
    return labels;
  }

  //find out where in this that's casting courseID to an int
  async addLocation() {
    try {
      const schedule = await Schedule.findOne({
        courseID: `${this.courseID}`,
        year: this.year,
        semester: this.semester,
      });
      console.log({
        courseID: `${this.courseID}`,
        year: this.year,
        semester: this.semester,
      }, this.section);
      if (schedule != null) {
        if (schedule.lectures != null) {
          for (let lecture of schedule.lectures) {
            if (
              lecture.name === this.section ||
              lecture.instructors
                .map((x) => x.toUpperCase())
                .includes(this.instructor)
            ) {
              this.location = lecture.location;
              console.log(this.location);
              return;
            }
          }
        }
        if (schedule.sections != null) {
          for (let section of schedule.sections) {
            if (
              section.name === this.section ||
              section.instructors
                .map((x) => x.toUpperCase())
                .includes(this.instructor)
            ) {
              this.location = section.location;
              console.log(this.location);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}
