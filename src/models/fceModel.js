import mongoose from 'mongoose';

const fceData = {
    section: String,
    instructor: String,
    possibleRespondents: Number,
    numRespondents: Number,
    responseRate: Number,
    hrsPerWeek: Number,
    hrsPerWeek5: Number,
    hrsPerWeek8: Number,
    rating: [Number]
};

const year = {
    year: String,
    fall: [fceData],
    spring: [fceData],
    summer: [fceData]
};

export const fceSchema = new mongoose.Schema({
    courseID: String,
    courseName: String,
    college: String,
    department: String,
    level: String,
    fce: [year]
});