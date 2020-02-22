import mongoose from 'mongoose';

const fceData = {
    section: String,
    instructor: String,
    possibleRespondents: Number,
    numRespondents: Number,
    responseRate: mongoose.Types.Decimal128,
    hrsPerWeek: mongoose.Types.Decimal128,
    hrsPerWeek5: mongoose.Types.Decimal128,
    hrsPerWeek8: mongoose.Types.Decimal128,
    rating: [mongoose.Types.Decimal128]
};

const semester = {
    semester: String,
    data: [fceData]
};

const year = {
    year: String,
    semesters: [semester]
};

export const fceSchema = new mongoose.Schema({
    courseId: String,
    courseName: String,
    college: String,
    department: String,
    level: String,
    fce: [year]
});