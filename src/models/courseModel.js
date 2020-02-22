import mongoose from 'mongoose';

const lecture = [{
    times: [{
        days: [Number],
        begin: String,
        end: String,
        building: String,
        room: String,
        location: String
    }],
    name: String,
    instructors: [String]
}];

const section = [{
    times: [{
        days: [Number],
        begin: String,
        end: String,
        building: String,
        room: String,
        location: String
    }],
    name: String,
    instructors: [String]
}];

export const courseSchema = new mongoose.Schema({
    courseID: String,
    desc: String,
    prereqs: [String],
    coreqs: [String],
    name: String,
    units: Number,
    department: String,
    lectures: lecture,
    sections: section
});
