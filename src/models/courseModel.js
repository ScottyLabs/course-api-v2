import mongoose from "mongoose";

const lecture = [
  {
    times: [
      {
        days: [Number],
        begin: String,
        end: String,
        building: String,
        room: String,
        location: String,
      },
    ],
    name: String,
    instructors: [String],
    location: String,
  },
];

const section = [
  {
    times: [
      {
        days: [Number],
        begin: String,
        end: String,
        building: String,
        room: String,
        location: String,
      },
    ],
    name: String,
    instructors: [String],
    location: String,
    lecture: String
  },
];

export const courseSchema = new mongoose.Schema({
  courseID: String,
  desc: String,
  prereqs: [String],
  prereqString: String,
  coreqs: [String],
  crosslisted: [String],
  name: String,
  units: String,
  department: String,
});

export const scheduleSchema = new mongoose.Schema({
  courseID: String,
  year: Number,
  semester: {
    type: String,
    enum: ["fall", "spring", "summer"],
  },
  session: {
    type: String,
    enum: [null, "summer all", "summer one", "summer two", "qatar summer"],
  },
  lectures: lecture,
  sections: section,
});
