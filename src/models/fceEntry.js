import mongoose from "mongoose";
import {scheduleSchema} from "../models/courseModel.js"
import dotenv from "dotenv";

dotenv.config();
const database = process.env.MONGODB_URI || 'mongodb://localhost:27017';

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
        rating
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
        rating
      };
    }
    
    //pass in year with constructor
    constructor(data, labels, year) {
      // Structure invariants
      console.assert(data instanceof Array, "Data is not an Array");
      console.assert(labels instanceof Array, "Labels is not an Array");
      console.assert(data.length == labels.length, "Array length mismatch" + data); //issues here

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

      //console.log(this._retrieve());

      // this.year = year;
      // this.semester = semester.toLowerCase();
      // this.college = college;
      // this.department = department;
      // this.courseID = this._insertDash(courseID);
      // this.section = section;
      // this.instructor = name.toUpperCase();
      // this.courseName = courseName.toUpperCase();
      // this.level = level;
      // this.possibleRespondents = possibleRespondents;
      // this.numRespondents = numRespondents;
  
      // this.responseRate = this._castToNum(responseRate);
      // this.hrsPerWeek = this._castToNum(hrsPerWeek);
      // this.hrsPerWeek5 = this._castToNum(hrsPerWeek5);
      // this.hrsPerWeek8 = this._castToNum(hrsPerWeek8);
      // this.rating = [];
      // rating.forEach(element => {
      //     this.rating.push(this._castToNum(element));
      // })
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
        const schedule = await Schedule.findOne({courseID: this.courseID, year: this.year, semester: this.semester});
        if (schedule != null) {
            if (schedule.lectures != null) {
                for (let lecture of schedule.lectures) {
                    if (lecture.instructors.map((x) => x.toUpperCase()).includes(this.instructor)) {
                        this.location = lecture.location;
                    }
                }
            }
            if (schedule.locations != null) {
                for (let section of schedule.sections) {
                    if (section.instructors.map((x) => x.toUpperCase()).includes(this.instructor)) {
                        this.location = section.location;
                    }
                }
            }
        }
    }
}