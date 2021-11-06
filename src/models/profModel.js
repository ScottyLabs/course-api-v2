import mongoose from "mongoose";

export const profSchema = new mongoose.Schema({
  instructor: String,
  andrewID: String,
  courses: [
    {
      courseID: String, 
      hrsPerWeek: Number,
      teaching: Number,
      overall: Number,
      semesters: [{year: String, semester: String}]
    }],
  respectForStudents: Number,
  interestInLearning: Number,
  providesFeedback: Number,
})