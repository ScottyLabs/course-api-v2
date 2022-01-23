import mongoose from "mongoose";

export const profSchema = new mongoose.Schema({
  instructor: String,
  andrewID: String,
  courses: [
    {
      courseID: String, 
      yearHrsPerWeek: Number,
      summerHrsPerWeek: Number,
      teachingRating: Number,
      overallRating: Number,
      semesters: [{year: String, semester: String}]
    }],
  respectForStudents: Number,
  interestInLearning: Number,
  providesFeedback: Number,
});