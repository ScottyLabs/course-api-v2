import mongoose from "mongoose";

export const profSchema = new mongoose.Schema({
  instructor: String,
  andrewID: String,
  courses: [{courseID: String, year: String, semester: String}]
})